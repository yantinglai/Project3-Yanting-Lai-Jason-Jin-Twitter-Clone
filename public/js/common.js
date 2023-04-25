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

function getPostIdFromElement(element) {
  var isRoot = element.hasClass('post');
  var rootElement = isRoot == true ? element : element.closest('.post');
  var postId = rootElement.data().id;

  if (postId === undefined) return alert('Post id undefined');

  return postId;
}

function createPostHtml(postData, largeFont = false) {
  if (postData == null) return alert('post object is null');

  var postedBy = postData.postedBy;

  if (postedBy._id === undefined) {
    return console.log('User object not populated');
  }

  var displayName = postedBy.firstName + ' ' + postedBy.lastName;
  var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  var largeFontClass = largeFont ? 'largeFont' : '';

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

                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='pinnedPostText'>${pinnedPostText}</div>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
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
