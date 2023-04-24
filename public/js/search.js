var timer;

// Attach an event listener to the search box for the 'keydown' event
$('#searchBox').keydown(function (event) {
  clearTimeout(timer);
  var textbox = $(event.target);
  var value = textbox.val();
  var searchData = textbox.data().search;

  timer = setTimeout(function () {
    value = textbox.val().trim();
    if (value == '') {
      $('.resultsContainer').html('');
    } else {
      search(value, searchData);
    }
  }, 1000);
});

// Define an asynchronous function to perform the search
async function search(searchTerm, searchData) {
  const url = searchData === 'users' ? '/api/users' : '/api/posts';

  try {
    const results = await $.get(url, { search: searchTerm });

    if (searchData === 'users') {
      outputUsers(results, $('.resultsContainer'));
    } else {
      outputPosts(results, $('.resultsContainer'));
    }

    return results;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
