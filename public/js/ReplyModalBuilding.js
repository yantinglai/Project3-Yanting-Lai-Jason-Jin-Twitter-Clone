$('#replyModal').on('show.bs.modal', (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  const submitButton = $('#submitReplyButton');
  submitButton.data('id', postId);

  const url = `/api/posts/${postId}`;
  $.get(url, (results) => {
    const container = $('#originalPostContainer');
    outputPosts(results.postData, container);
  });
});

$('#replyModal').on('hidden.bs.modal', () => {
  const container = $('#originalPostContainer');
  container.html('');
});
