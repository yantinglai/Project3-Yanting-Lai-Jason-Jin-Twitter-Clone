$('#postTextarea').keyup((event) => {
  var textbox = $(event.target);
  var value = textbox.val().trim(); // remove the space before and after the input

  var submitButton = $('#submitPostButton');

  if (submitButton.length == 0) return alert('No submit button found');

  if (value == '') {
    submitButton.prop('disabled', true);
    return;
  }

  submitButton.prop('disabled', false); // if user enters any text, the submitbuttom will be enabled
});

$('#submitPostButton').click(() => {
  var button = $(event.target);
  var textbox = $('#postTextarea');

  var data = {
    content: textbox.val(),
  };

  // create a post
  // submit a post AJAX request, xhr: xml http request
  $.post('/api/posts', data, (postData, status, xhr) => {});
});
