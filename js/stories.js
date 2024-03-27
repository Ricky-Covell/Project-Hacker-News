"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${isUserLoggedIn() ? getCheckboxHtml() : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}


// Helper function for creating favorites checkbox
function getCheckboxHtml() {
  return `<input type="checkbox" class="favorited-checkbox">`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    // if user is loggend in then check
   if (isUserLoggedIn()) {
      if (isClickedStoryFavorited(story)){
        $story.children('.favorited-checkbox').prop('checked', true);
    }
   }

    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// Creates new story when story form is submitted

async function submitStory(event) {
  console.debug("submitStory");
  event.preventDefault();

  const title = $titleInput.val();
  const author = $authorInput.val();
  const url = $urlInput.val();
  const username = currentUser.username;
  const storyData = { title, author, url, username };

  const story = await storyList.addStory(currentUser, storyData);
  const storyMarkup = generateStoryMarkup(story);

  $allStoriesList.prepend(storyMarkup);
  $storyFormClass.hide();
  
  [ $titleInput, $authorInput, $urlInput ].forEach(element => element.val(""));

  // automatically navigates to front page when story is submitted
  navAllStories();
}

$submitStoryForm.on("submit", submitStory);


// Favorited stories handling

function displayFavorites(){
  console.debug("displayFavorites");
  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>Click checkbox to add a favorite!</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story).addClass('favorites-list-li');
      // adds checked to checkbox if favorited
      if (isClickedStoryFavorited(story)){
        $story.children('.favorited-checkbox').prop('checked', true);
      }
      
      $favoritedStories.append($story);
    }
  }

    $favoritedStories.show();
  }



// Helper function that checks if post of clicked checkbox is favorited
function isClickedStoryFavorited(story){
   if (currentUser.favorites === []) {
    return false;
   } else {
    return currentUser.favorites.some(fav => fav.storyId === story.storyId);
   }
}



// Handle favorite/un-favorite behavior

async function handleClickedCheckbox() {
  console.debug("handleClickedCheckbox");
  const $target = $(this);
  const $targetParentLi = $target.parent();
  const liId = $targetParentLi.attr('id');  
  const clickedStory = storyList.stories.find(s => s.storyId === liId);
    
  if (isClickedStoryFavorited(clickedStory) === false){
      await currentUser.addFavorite(clickedStory);
  } 
  else {
      currentUser.favorites = currentUser.favorites.filter( s => s.storyId !== clickedStory.storyId);
      await currentUser.removeFavorite(clickedStory);

      // removes li from the page if user is currently in the "favorites" tabs of the nav bar
      if ($targetParentLi.attr('class') === 'favorites-list-li'){
        $targetParentLi.remove();
      }
  }

  // Redisplays checkbox instructions if no favorites are left
  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>Click checkbox to add a favorite!</h5>")
  }
}

$body.on("click", "input.favorited-checkbox", handleClickedCheckbox);




// Handle 'my stories' behavior

function displayMyStories() {
  console.debug("displayMyStories");
  $userStories.empty();

  if (currentUser.ownStories.length === 0) {
    $userStories.append("<h5>Submit a story!</h5>");
  } else { 
    for (let story of currentUser.ownStories) {
      // Makes delete buttton and markup for each story
      const $newDeleteButton = $('<input type="button" class="delete-story-button" value="DELETE">')
      const $story = generateStoryMarkup(story).addClass('my-stories-li');
      // adds checked to checkbox if favorited
      if (isClickedStoryFavorited(story)){
        $story.children('.favorited-checkbox').prop('checked', true);
      }
      
      // Append delete button to $story and then appends $story the my stories list
      $story.append($newDeleteButton);
      $userStories.append($story);
    }
  }

    $userStories.show()
} 


// Handles 'DELETE' click on my stories page

async function removeMyStoryOnDeleteButtonClick(event) {
  console.debug("removeMyStoryOnDeleteButtonClick"); 
  const $target = $(this);
  const $targetParentLi = $target.parent();
  const liId = $targetParentLi.attr('id');  
  const clickedStory = currentUser.ownStories.find(s => s.storyId === liId);

  await storyList.deleteStory(currentUser, clickedStory);

  $targetParentLi.remove();
  currentUser.ownStories = currentUser.ownStories.filter(s => s.storyId !== clickedStory.storyId);
  currentUser.favorites = currentUser.ownStories.filter(s => s.storyId !== clickedStory.storyId);

  // Redisplays Submit message if no user stories are left
  if (currentUser.ownStories.length === 0) {
    $userStories.append("<h5>Submit a story!</h5>")
  }
}

$userStories.on('click', 'input.delete-story-button', removeMyStoryOnDeleteButtonClick);



