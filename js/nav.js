"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $mainNavLinksContainer.show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

// Show story submission when the navbar's "submit" is clicked

function navSubmitClick() {
  console.debug("navSubmitClick");
  $storyFormClass.show()
}

$navSubmit.on("click", navSubmitClick);

// Show favorited stories when the navbar's "favorites" is clicked

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick");
  hidePageComponents();
  displayFavorites();
}

$navFavorites.on('click', navFavoritesClick);


// Show users own stories when the navbar's "my stories" is clicked

function navMyStoriesClick() {
  console.debug("navMyStoriesClick");
  hidePageComponents();
  displayMyStories();
}

$navMyStories.on('click', navMyStoriesClick);


  

