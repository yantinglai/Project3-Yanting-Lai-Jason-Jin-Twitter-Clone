$('#postTextarea').keyup((event) => {
  var textbox = $(event.target);
  var value = textbox.val().trim();

  var submitButton = $('#submitPostButton');

  if (submitButton.length == 0) return alert('No submit button found');

  if (value == '') {
    submitButton.prop('disabled', true);
    return;
  }

  submitButton.prop('disabled', false);
});

$('#submitPostButton').click(() => {
  var button = $(event.target);
  var textbox = $('#postTextarea');

  var data = {
    content: textbox.val(),
  };

  $.post('/api/posts', data, (postData) => {
    var html = createPostHtml(postData);
    $('.postsContainer').prepend(html);
    textbox.val('');
    button.prop('disabled', true);
  });
});

function createPostHtml(postData) {
  var postedBy = postData.postedBy;
  var displayName = postedBy.firstName + ' ' + postedBy.lastName;
  var timestamp = postData.createdAt;

  return `<div class = 'post'>
              <div class = 'mainContainContainer'>
                  <div class ='userImageContainer'>
                      <img src ='${postedBy.profilePic}'>
                  </div>
                  <div class ='postContentContainer'>
                      <div class='header'>
                          <a href = '/profile/${postedBy.username}' class = 'displayName'>${displayName}</a>
                          <span class='username'>@${postedBy.username}</span>
                          <span class='date'>${timestamp}</span>
                      </div>
                      <div class='postBody'>
                          <span>${postData.content}</span>
                      </div>
                      <div class='postFooter'>
                          <div class='postButtonContainer'>
                              <button>
                                  <i class='far fa-comment'></i>
                              </button>
                          </div>
                          <div class='postButtonContainer'>
                              <button>
                                  <i class='fas fa-retweet'></i>
                              </button>
                          </div>
                          <div class='postButtonContainer'>
                              <button>
                                  <i class='far fa-heart'></i>
                              </button>
                          </div>

                      </div>
                  </div>
          </div>
          </div>`;
}
