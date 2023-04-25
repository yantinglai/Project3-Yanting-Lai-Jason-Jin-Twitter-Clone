/**
 * Once the posttextarea is clicked, the submit button will be enabled
 */
$('#postTextarea').keyup((event) => {
  handleTextareaKeyup(event, '#submitPostButton');
});
/**
 * Once the replyTextarea is clicked, the submit button will be enabled
 */
$('#replyTextarea').keyup((event) => {
  handleTextareaKeyup(event, '#submitReplyButton');
});
/**
 *  This function is used to handle the textarea
 * if the textarea is empty, the submit button will be disabled
 * if the textarea is not empty, the submit button will be enabled
 * */
function handleTextareaKeyup(event, submitButtonSelector) {
  const textbox = $(event.target);
  const value = textbox.val().trim();
  const submitButton = $(submitButtonSelector);

  if (submitButton.length == 0) {
    return alert('No submit button found');
  }

  if (value == '') {
    submitButton.prop('disabled', true);
    return;
  }

  submitButton.prop('disabled', false);
}
/**
 * Once the submitPostButton is clicked, the submit button will be enabled
 */
$('#submitPostButton').click(() => {
  handleSubmitButtonClick('#postTextarea');
});
/**
 * Once the submitReplyButton is clicked, the submit button will be enabled
 */
$('#submitReplyButton').click(() => {
  handleSubmitButtonClick('#replyTextarea', true);
});
/**
 * Once the button is clicked, the post will be submitted accordinly to the textarea
 */
function handleSubmitButtonClick(textareaSelector, isModal = false) {
  const button = $(event.target);
  const textbox = $(textareaSelector);
  const data = {
    content: textbox.val(),
  };

  if (isModal) {
    const id = button.data().id;
    if (id == null) return alert('Button id is null');
    data.replyTo = id;
  }

  $.post('/api/posts', data, (postData) => {
    if (postData.replyTo) {
      location.reload();
    } else {
      const html = createPostHtml(postData);
      $('.postsContainer').prepend(html);
      textbox.val('');
      button.prop('disabled', true);
    }
  });
}
