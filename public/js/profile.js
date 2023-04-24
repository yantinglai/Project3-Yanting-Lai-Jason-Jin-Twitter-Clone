$(document).ready(() => {
  selectedTab === 'replies' ? loadReplies() : loadPosts();
});

// Asynchronously load posts from the server and output them to the DOM
async function loadPosts() {
  try {
    const pinnedResults = await $.get('/api/posts', {
      postedBy: profileUserId,
      pinned: true,
    });
    const postsResults = await $.get('/api/posts', {
      postedBy: profileUserId,
      isReply: false,
    });

    outputPinnedPost(pinnedResults, $('.pinnedPostContainer'));
    outputPosts(postsResults, $('.postsContainer'));
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Asynchronously load replies from the server and output them to the DOM
async function loadReplies() {
  try {
    const results = await $.get('/api/posts', {
      postedBy: profileUserId,
      isReply: true,
    });
    outputPosts(results, $('.postsContainer'));
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Output pinned posts to the DOM
function outputPinnedPost(results, container) {
  if (!results.length) {
    container.hide();
    return;
  }

  container.empty().append(results.map((result) => createPostHtml(result)));
}
