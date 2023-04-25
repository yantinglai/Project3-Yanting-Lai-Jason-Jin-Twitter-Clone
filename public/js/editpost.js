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
    $('#editPostTextarea').val(content);
  });

  var submitButton = $('#editPostButton');
  var textbox = $('#editPostTextarea');
  var originalValue = textbox.val().trim();

  textbox.on('input', (event) => {
    var currentValue = $(event.target).val().trim();

    if (currentValue === originalValue) {
      submitButton.prop('disabled', true); // Disable submit button if content hasn't changed
    } else {
      submitButton.prop('disabled', false); // Enable submit button if content has changed
    }
  });
  submitButton.prop('disabled', true); // Disable submit button initially
});

$('#editPostModal').on('hidden.bs.modal', () =>
  $('#originalPostContainer').html('')
);

$('#editPostButton').click((event) => {
  event.preventDefault(); // Prevent form submission
  var postId = $(event.target).data('id');
  var textbox = $('#editPostTextarea');
  var currentValue = textbox.val().trim();

  $.get('/api/posts/' + postId, (results) => {
    var originalValue = results.postData.content;

    if (currentValue === originalValue) {
      alert('Content has not changed');
      return;
    }

    $.ajax({
      url: `/api/posts/${postId}`,
      type: 'PUT',
      data: {
        content: currentValue,
      },
      success: (postData) => {
        var html = createPostHtml(postData);
        var postElement = $(`.post[data-id="${postId}"]`); // Get the existing post element using the post ID

        // Replace the existing post with the updated post
        postElement.replaceWith(html);

        textbox.val('');
        $('#editPostButton').prop('disabled', true); // Update button disabled state
        $('#editPostModal').modal('hide'); // Hide the modal
      },
      error: (error) => {
        console.log(error);
      },
    });
  });
});

$('#editTextarea').keyup((event) => {
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

/*
------------------------------------------------------------------------------------------------
*/
