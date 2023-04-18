$(document).ready(() => {
<<<<<<< HEAD
  $.get('/api/posts/' + postId, (results) => {
    outputPostsWithReplies(results, $('.postsContainer'));
  });
});
=======
    $.get("/api/posts/" + postId, results => {
        outputPostsWithReplies(results, $(".postsContainer"));
    })
})
>>>>>>> JasonJin
