$(document).ready(() => {
  const options = { followingOnly: true };

  $.get('/api/posts', options, (results) => {
    const container = $('.postsContainer');
    outputPosts(results, container);
  });
});
