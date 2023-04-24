// Determine which tab is selected and load the appropriate content
if (selectedTab === 'followers') {
  loadFollowers();
} else {
  
$(document).ready(() => {
  if (selectedTab === 'followers') {
    loadFollowers();
  } else {
    loadFollowing();
  }
});

// Make a GET request to the server for the profile user's followers and Pass the array of followers to the outputUsers function to display on the page
async function loadFollowers() {
  try {
    const results = await $.get(`/api/users/${profileUserId}/followers`);
    outputUsers(results.followers, $('.resultsContainer'));
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Make a GET request to the server for the users that the profile user is following and. Pass the array of following users to the outputUsers function to display on the page
async function loadFollowing() {
  try {
    const results = await $.get(`/api/users/${profileUserId}/following`);
    outputUsers(results.following, $('.resultsContainer'));
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// // Outputting the users
// function outputUsers(results, container) {
//   container.html('');

//   results.forEach((result) => {
//     var html = createUserHtml(result, true);
//     container.append(html);
//   });
//   // if no followers/follwing, show results not found
//   if (results.length == 0) {
//     container.append("<span class='noResults'>No results found</span>");
//   }
// }

// // display user for the followers/following list
// function createUserHtml(userData, showFollowButton) {
//   var name = userData.firstName + ' ' + userData.lastName;
//   var isFollowing =
//     userLoggedIn.following && userLoggedIn.following.includes(userData._id);

//   // display the icon text based on whether the user has followed you or not
//   var text = isFollowing ? 'Following' : 'Follow';
//   var buttonClass = isFollowing ? 'followButton following' : 'followButton';

//   var followButton = '';
//   // display follow button for the followers
//   if (showFollowButton && userLoggedIn._id != userData._id) {
//     followButton = `<div class='followButtonContainer'>
//                             <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
//                         </div>`;
//   }

//   return `<div class='user'>
//                 <div class='userImageContainer'>
//                     <img src='${userData.profilePic}'>
//                 </div>
//                 <div class='userDetailsContainer'>
//                     <div class='header'>
//                         <a href='/profile/${userData.username}'>${name}</a>
//                         <span class='username'>@${userData.username}</span>
//                     </div>
//                 </div>
//                 ${followButton}
//             </div>`;
// }
