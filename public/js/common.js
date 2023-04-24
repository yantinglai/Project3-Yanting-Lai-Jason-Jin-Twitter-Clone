$('#imageInput').on('change', function (event) {
  var file = event.target.files[0]; // Get the selected file

  // Read the file data as a DataURL
  var reader = new FileReader();
  reader.onload = function (event) {
    var imageDataUrl = event.target.result; // Get the DataURL of the file
    // Append the DataURL to the textarea
    $('#postTextarea, #replyTextarea').val(
      $('#postTextarea, #replyTextarea').val() + ' ' + imageDataUrl
    );
  };
  reader.readAsDataURL(file); // Read the file data as a DataURL
});

$('#postTextarea, #replyTextarea').keyup((event) => {
  var textbox = $(event.target);
  var value = textbox.val().trim();

  var isModal = textbox.parents('.modal').length == 1;

  var submitButton = isModal ? $('#submitReplyButton') : $('#submitPostButton');

  if (submitButton.length == 0) return alert('No submit button found');

  if (value == '') {
    submitButton.prop('disabled', true);
    return;
  }

  submitButton.prop('disabled', false);
});

// $('#editTextarea').keyup((event) => {
//   var textbox = $(event.target);
//   var value = textbox.val().trim();
//   var editPostButton = $('#editPostButton');
//   if (editPostButton.length == 0) return alert('No submit button found');
//   if (value == '') {
//     editPostButton.prop('disabled', true);
//     return;
//   }
//   editPostButton.prop('disabled', false);
// });
$('#submitPostButton, #submitReplyButton').click(() => {
  var button = $(event.target);

  var isModal = button.parents('.modal').length == 1;
  var textbox = isModal ? $('#replyTextarea') : $('#postTextarea');

  var data = {
    content: textbox.val(),
  };

  if (isModal) {
    var id = button.data().id;
    if (id == null) return alert('Button id is null');
    data.replyTo = id;
  }

  $.post('/api/posts', data, (postData) => {
    if (postData.replyTo) {
      location.reload();
    } else {
      var html = createPostHtml(postData);
      $('.postsContainer').prepend(html);
      textbox.val('');
      button.prop('disabled', true);
    }
  });
});

/*
------------------------------------------------------------------------------------------------
*/

$('#editPostModal').on('show.bs.modal', (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $('#editPostButton').data('id', postId);

  $.get('/api/posts/' + postId, (results) => {
    var content = results.postData.content;
    console.log(results);
    console.log(content);
    $('#originalPostContainer').text(content);
    $('#editPostTextarea').val('').attr('placeholder', content);
  });
});

$('#editPostModal').on('hidden.bs.modal', () =>
  $('#originalPostContainer').html('')
);

$('#editPostTextarea').keyup((event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  var isModal = button.parents('.modal').length == 1;

  var submitButton = $('#editPostModal');
  if (submitButton.length == 0) return alert('No submit button found');

  // Fetch original content from server by post ID
  $.ajax({
    url: '/getOriginalContent', // Update with your server endpoint to fetch original content
    type: 'GET',
    data: { postId: postId }, // Pass the post ID as data to the server
    success: function (response) {
      var originalContent = response.content; // Update with the actual response structure
      console.log('Original content:', originalContent);
      var editModal = createEditPostModal(userLoggedIn, originalContent); // Pass the original content to the createEditPostModal mixin
      editModal.find('#editPostModal').data('id', button.data('id')); // Set the post/reply ID to the modal
      editModal.modal('show');

      var value = $('#editPostTextarea').val(); // Get the current value of the textarea
      if (value == '') {
        submitButton.prop('disabled', true);
        return;
      }
      submitButton.prop('disabled', false);
    },
    error: function (xhr, textStatus, errorThrown) {
      console.error('Error fetching original content:', errorThrown);
    },
  });
});

$('#editPostButton').click((event) => {
  var postId = $(event.target).data('id');

  var textbox = $('#editPostTextarea');

  var data = {
    content: textbox.val(),
  };

  $.post(`/api/posts/${postId}`, data, (postData) => {
    if (postData.replyTo) {
      location.reload();
    } else {
      var html = createPostHtml(postData);
      $('.postsContainer').prepend(html);
      textbox.val('');
      button.prop('disabled', true);
    }
  });
});
/*
------------------------------------------------------------------------------------------------
*/
$('#replyModal').on('show.bs.modal', (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $('#submitReplyButton').data('id', postId);

  $.get('/api/posts/' + postId, (results) => {
    outputPosts(results.postData, $('#originalPostContainer'));
  });
});

$('#replyModal').on('hidden.bs.modal', () =>
  $('#originalPostContainer').html('')
);

$('#deletePostModal').on('show.bs.modal', (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $('#deletePostButton').data('id', postId);
});

$('#deletePostButton').click((event) => {
  var postId = $(event.target).data('id');

  $.ajax({
    url: `/api/posts/${postId}`,
    type: 'DELETE',
    success: (data, status, xhr) => {
      if (xhr.status != 202) {
        alert('could not delete post');
        return;
      }

      location.reload();
    },
  });
});

$('#confirmPinModal').on('show.bs.modal', (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $('#pinPostButton').data('id', postId);
});

$('#unpinModal').on('show.bs.modal', (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);
  $('#unpinPostButton').data('id', postId);
});

$('#pinPostButton').click((event) => {
  var postId = $(event.target).data('id');

  $.ajax({
    url: `/api/posts/${postId}`,
    type: 'PUT',
    data: { pinned: true },
    success: (data, status, xhr) => {
      if (xhr.status != 204) {
        alert('could not delete post');
        return;
      }

      location.reload();
    },
  });
});

$('#unpinPostButton').click((event) => {
  var postId = $(event.target).data('id');

  $.ajax({
    url: `/api/posts/${postId}`,
    type: 'PUT',
    data: { pinned: false },
    success: (data, status, xhr) => {
      if (xhr.status != 204) {
        alert('could not delete post');
        return;
      }

      location.reload();
    },
  });
});
// Globals
var cropper;
// upload photos to user profile
$('#filePhoto').change(function () {
  if (this.files && this.files[0]) {
    var reader = new FileReader();
    reader.onload = (e) => {
      var image = document.getElementById('imagePreview');
      image.src = e.target.result;
      // if user upload another image, destroy the current image
      if (cropper !== undefined) {
        cropper.destroy();
      }
      // otherwise create a cropper object with the image uploaded by user
      // pass on the image object to the cropper object
      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false,
      });
    };
    reader.readAsDataURL(this.files[0]);
  } else {
    console.log('nope');
  }
});

$('#coverPhoto').change(function () {
  if (this.files && this.files[0]) {
    var reader = new FileReader();
    reader.onload = (e) => {
      var image = document.getElementById('coverPreview');
      image.src = e.target.result;

      if (cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: false,
      });
    };
    reader.readAsDataURL(this.files[0]);
  }
});

// When user clip the image upload, user will get the cropped image
$('#imageUploadButton').click(() => {
  // contain the area that the photo was cropped
  var canvas = cropper.getCroppedCanvas();

  if (canvas == null) {
    alert('Could not upload image. Make sure it is an image file.');
    return;
  }

  // Blob is used to store videos and images, convert the canvas object into a binary image
  canvas.toBlob((blob) => {
    var formData = new FormData();
    formData.append('croppedImage', blob);
    // send an ajax request to update the photo
    $.ajax({
      url: '/api/users/profilePicture',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: () => location.reload(),
    });
  });
});

$('#coverPhotoButton').click(() => {
  var canvas = cropper.getCroppedCanvas();

  if (canvas == null) {
    alert('Could not upload image. Make sure it is an image file.');
    return;
  }

  canvas.toBlob((blob) => {
    var formData = new FormData();
    formData.append('croppedImage', blob);

    $.ajax({
      url: '/api/users/coverPhoto',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: () => location.reload(),
    });
  });
});

$(document).on('click', '.likeButton', (event) => {
  var button = $(event.target);
  var postId = getPostIdFromElement(button);

  if (postId === undefined) return;

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: 'PUT',
    success: (postData) => {
      button.find('span').text(postData.likes.length || '');

      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass('active');
      } else {
        button.removeClass('active');
      }
    },
  });
});

$(document).on('click', '.retweetButton', (event) => {
  var button = $(event.target);
  var postId = getPostIdFromElement(button);

  if (postId === undefined) return;

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: 'POST',
    success: (postData) => {
      button.find('span').text(postData.retweetUsers.length || '');

      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass('active');
      } else {
        button.removeClass('active');
      }
    },
  });
});

$(document).on('click', '.post', (event) => {
  var element = $(event.target);
  var postId = getPostIdFromElement(element);

  if (postId !== undefined && !element.is('button')) {
    window.location.href = '/posts/' + postId;
  }
});

$(document).on('click', '.followButton', (e) => {
  // get User id when user hit the "follow"
  var button = $(e.target);
  var userId = button.data().user;

  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: 'PUT',
    success: (data, status, xhr) => {
      // user not found
      if (xhr.status == 404) {
        alert('user not found');
        return;
      }

      var difference = 1;
      if (data.following && data.following.includes(userId)) {
        button.addClass('following');
        button.text('Following');
      } else {
        button.removeClass('following');
        button.text('Follow');
        difference = -1;
      }

      // change the followers number +1 or -1
      var followersLabel = $('#followersValue');
      if (followersLabel.length != 0) {
        var followersText = followersLabel.text();
        followersText = parseInt(followersText);
        followersLabel.text(followersText + difference);
      }
    },
  });
});

function getPostIdFromElement(element) {
  var isRoot = element.hasClass('post');
  var rootElement = isRoot == true ? element : element.closest('.post');
  var postId = rootElement.data().id;

  if (postId === undefined) return alert('Post id undefined');

  return postId;
}

function createPostHtml(postData, largeFont = false) {
  if (postData == null) return alert('post object is null');

  var isRetweet = postData.retweetData !== undefined;
  var retweetedBy = isRetweet ? postData.postedBy.username : null;
  postData = isRetweet ? postData.retweetData : postData;

  var postedBy = postData.postedBy;

  if (postedBy._id === undefined) {
    return console.log('User object not populated');
  }

  var displayName = postedBy.firstName + ' ' + postedBy.lastName;
  var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id)
    ? 'active'
    : '';
  var retweetButtonActiveClass = postData.retweetUsers.includes(
    userLoggedIn._id
  )
    ? 'active'
    : '';
  var largeFontClass = largeFont ? 'largeFont' : '';

  var retweetText = '';
  if (isRetweet) {
    retweetText = `<span>
                        <i class='fas fa-retweet'></i>
                        Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>    
                    </span>`;
  }

  var replyFlag = '';
  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      return alert('Reply to is not populated');
    } else if (!postData.replyTo.postedBy._id) {
      return alert('Posted by is not populated');
    }

    var replyToUsername = postData.replyTo.postedBy.username;
    replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                    </div>`;
  }

  var buttons = '';
  var pinnedPostText = '';
  if (postData.postedBy._id == userLoggedIn._id) {
    var pinnedClass = '';
    var dataTarget = '#confirmPinModal';
    if (postData.pinned === true) {
      pinnedClass = 'active';
      dataTarget = '#unpinModal';
      pinnedPostText =
        "<i class='fas fa-thumbtack'></i> <span>Pinned post</span>";
    }

    buttons = `<button class='pinButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}"><i class='fas fa-thumbtack'></i></button>
                    <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i></button>
                    <button data-id="${postData._id}" data-toggle="modal" data-target="#editPostModal"><i class='fas fa-edit'></i></button>`;
  }

  return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='pinnedPostText'>${pinnedPostText}</div>
                        <div class='header'>
                            <a href='/profile/${
                              postedBy.username
                            }' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${
                                      postData.retweetUsers.length || ''
                                    }</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ''}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return 'Just now';

    return Math.round(elapsed / 1000) + ' seconds ago';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago';
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago';
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + ' days ago';
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + ' months ago';
  } else {
    return Math.round(elapsed / msPerYear) + ' years ago';
  }
}

function outputPosts(results, container) {
  container.html('');

  if (!Array.isArray(results)) {
    results = [results];
  }

  results.forEach((result) => {
    var html = createPostHtml(result);
    container.append(html);
  });

  if (results.length == 0) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}

function outputPostsWithReplies(results, container) {
  container.html('');

  if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
    var html = createPostHtml(results.replyTo);
    container.append(html);
  }

  var mainPostHtml = createPostHtml(results.postData, true);
  container.append(mainPostHtml);

  results.replies.forEach((result) => {
    var html = createPostHtml(result);
    container.append(html);
  });
}

// Outputting the users
function outputUsers(results, container) {
  container.html('');

  results.forEach((result) => {
    var html = createUserHtml(result, true);
    container.append(html);
  });
  // if no followers/follwing, show results not found
  if (results.length == 0) {
    container.append("<span class='noResults'>No results found</span>");
  }
}

// display user for the followers/following list
function createUserHtml(userData, showFollowButton) {
  var name = userData.firstName + ' ' + userData.lastName;
  var isFollowing =
    userLoggedIn.following && userLoggedIn.following.includes(userData._id);

  // display the icon text based on whether the user has followed you or not
  var text = isFollowing ? 'Following' : 'Follow';
  var buttonClass = isFollowing ? 'followButton following' : 'followButton';

  var followButton = '';
  // display follow button for the followers
  if (showFollowButton && userLoggedIn._id != userData._id) {
    followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`;
  }

  return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}
