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

$(document).on('click', '.post', (event) => {
  var element = $(event.target);
  var postId = getPostIdFromElement(element);

  if (postId !== undefined && !element.is('button')) {
    window.location.href = '/posts/' + postId;
  }
});
