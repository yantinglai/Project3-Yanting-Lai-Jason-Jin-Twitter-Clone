$('#deletePostModal').on('show.bs.modal', (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  const deleteButton = $('#deletePostButton');
  deleteButton.data('id', postId);
});

$('#deletePostButton').click((event) => {
  const deleteButton = $(event.target);
  const postId = deleteButton.data('id');
  const url = `/api/posts/${postId}`;

  $.ajax({
    url: url,
    type: 'DELETE',
    success: (data, status, xhr) => {
      if (xhr.status != 202) {
        alert('Could not delete post');
        return;
      }

      location.reload();
    },
  });
});
