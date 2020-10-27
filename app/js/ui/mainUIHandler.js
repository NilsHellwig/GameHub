import {
  Observable,
  Event,
}
from "../utils/Observable.js";
import Config from "../utils/config.js";
var context, appCopy, authId, darkmodeIsEnabled;

function createUserReviewElement(transferedData, reviewId, elementText) {
  let gameTitle = transferedData[0],
    reviewData = transferedData[1],
    reviewElement = createElementFromHTML(elementText),
    reviewList = document.querySelector(Config.ELEMENTS.REVIEW_TAB_REVIEW_LIST),
    pointsElement = reviewElement.querySelector(Config.ELEMENTS.REVIEW_TAB_REVIEW_ELEMENT_RANKING),
    gameTitleElement = reviewElement.querySelector(Config.ELEMENTS.REVIEW_TAB_REVIEW_ELEMENT_GAME_TITLE);
  setTextOfReviewElement(pointsElement, reviewData, gameTitleElement, reviewElement, gameTitle, reviewList);
  /* After we initialized the list-elements, we want to set an event-listener
   to see if a list-element has been clicked by the user in order to see the
   whole review.
   The data that was already fetched for the list-elements
   is also needed to display the whole review*/
  setEventListenerForFullViewOfReview(reviewElement, reviewId);
}

function createElementFromHTML(htmlString) {
  /* After the HTML file is fetched we need to transform the htmlString into an HTML Element.
   used method from: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro*/
  let div = document.createElement(Config.ELEMENTS.DIV_ELEMENT);
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

function setTextOfReviewElement(pointsElement, reviewData, gameTitleElement, reviewElement, gameTitle, reviewList) {
  pointsElement.innerHTML = reviewData.ranking + Config.MAXIMUM_OF_POINTS;
  gameTitleElement.innerHTML = gameTitleElement.innerHTML + reviewData.title;
  // the reviewTitleElement needs to be initialized after the gameTitle was added.
  let reviewTitleElement = reviewElement.querySelector(Config.ELEMENTS.REVIEW_TAB_REVIEW_ELEMENT_REVIEW_TITLE);
  reviewTitleElement.innerHTML = gameTitle;
  reviewList.append(reviewElement);
}

function setEventListenerForFullViewOfReview(reviewElement, reviewId) {
  /* If the user clicks on the element we need to open a popup to show the detailed
   view of the review*/
  reviewElement.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    createEvent(Config.EVENTS.LOAD_FULL_REVIEW, reviewId);
  });
}

function createEvent(eventName, data) {
  let event = new Event(eventName, data);
  context.notifyAll(event);
}

function initReviewViewPopup(popup, reviewData) {
  let popupElement = popup.el,
    gameTitleElement = popupElement.querySelector(Config.ELEMENTS.REVIEW_DETAIL_SHEET_ELEMENT_GAME_TITLE),
    reviewTitleElement = popupElement.querySelector(Config.ELEMENTS.REVIEW_DETAIL_SHEET_ELEMENT_REVIEW_TITLE),
    reviewTextElement = popupElement.querySelector(Config.ELEMENTS.REVIEW_DETAIL_SHEET_ELEMENT_DESCRIPTION),
    reviewRankingElement = popupElement.querySelector(Config.ELEMENTS.REVIEW_DETAIL_SHEET_ELEMENT_RANKING),
    reviewRoleElement = popupElement.querySelector(Config.ELEMENTS.REVIEW_DETAIL_SHEET_ELEMENT_ROLE),
    authorElement = popupElement.querySelector(Config.ELEMENTS.REVIEW_DETAIL_SHEET_ELEMENT_AUTHOR),
    stepperElement = popupElement.querySelector(Config.ELEMENTS.REVIEW_DETAIL_SHEET_ELEMENT_STEPPER),
    reviewId = reviewData[1], // we need the Id of the review to save a vote of a user to the review in the database
    votes = reviewData[0].votes,
    userVoteForReview = reviewData[4]; // The stepper must represent a previously cast vote.
  waitForDeletionOfOpenedReview(popup, reviewId);
  initReviewViewPopupElement(reviewData, gameTitleElement, reviewTitleElement, reviewTextElement, reviewRankingElement, authorElement, reviewRoleElement);
  setupStepper(stepperElement, votes, reviewId, userVoteForReview);
  addDeleteButtonToReviewPopupIfReviewWasWrittenByAuthenticatedUser(popupElement, reviewData);
}

function waitForDeletionOfOpenedReview(popup, reviewId) {
  /* The review popup should be closed when the opened game is deleted.
   This could be the case when the delete button is clicked, but ALSO
   when the review was deleted while the reviewSheet is opened (e.g. by the creator of the game for which the review was written).*/
  let dataNeededToClosePopup = [popup, reviewId];
  createEvent(Config.EVENTS.WAIT_FOR_DELETION_OF_REVIEW_TO_CLOSE_REVIEW, dataNeededToClosePopup);
}

function initReviewViewPopupElement(reviewData, gameTitleElement, reviewTitleElement, reviewTextElement, reviewRankingElement, authorElement, reviewRoleElement) {
  // change Text of the HTML elements
  gameTitleElement.innerHTML = Config.GAME_TITLE_STANDARD_TEXT + reviewData[2].title; //reviewData.data[2] saves information about the game
  reviewTitleElement.innerHTML = reviewData[0].title; // reviewData[0] saves information about the review
  reviewTextElement.innerHTML = reviewData[0].text;
  reviewRankingElement.innerHTML = reviewData[0].ranking + Config.MAXIMUM_OF_POINTS;
  // reviewData[3][0] saves information about the username of the writer
  // reveiwData[3][1] saves information about the role of the writer
  authorElement.innerHTML = Config.AUTHOR_TEXT_STANDARD_TEXT + reviewData[3][0];
  reviewRoleElement.innerHTML = reviewData[3][1];
}

function setupStepper(stepperElement, votes, reviewId, userVoteForReview) {
  let plusButtonElement = stepperElement.querySelector(Config.ELEMENTS.STEPPER_PLUS_ELEMENT),
    minusButtonElement = stepperElement.querySelector(Config.ELEMENTS.STEPPER_MINUS_ELEMENT),
    displayedPointsElement = stepperElement.querySelector(Config.ELEMENTS.STEPPER_TEXT_ELEMENT),
    stepperPoints = getVoteValue(votes);
  displayedPointsElement.value = stepperPoints;
  listenForStepperChanges(displayedPointsElement, plusButtonElement, minusButtonElement, stepperPoints, reviewId, userVoteForReview);
}

function getVoteValue(votes) {
  // We have to iterate through all votes submitted to a review to calculate the balance between positive and negative votes.
  let keys = Object.values(votes),
    stepperPoints = 0;
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === true) {
      stepperPoints++;
    } else {
      stepperPoints--;
    }
  }
  return stepperPoints;
}

function listenForStepperChanges(displayedPointsElement, plusButtonElement, minusButtonElement, stepperPoints, reviewId, userVoteForReview) {
  changeToDownVotedStepper(userVoteForReview, minusButtonElement);
  changeToUpVotedStepper(userVoteForReview, plusButtonElement);
  setupStepperButtonListeners(userVoteForReview, plusButtonElement, minusButtonElement, stepperPoints, reviewId, displayedPointsElement);
}

function changeToDownVotedStepper(userVoteForReview, minusButtonElement) {
  if (userVoteForReview === false) {
    minusButtonElement.setAttribute(Config.ATTRIBUTES.STYLE, Config.GREY_BACKGROUND_STYLE);
  }
}

function changeToUpVotedStepper(userVoteForReview, plusButtonElement) {
  if (userVoteForReview === true) {
    plusButtonElement.setAttribute(Config.ATTRIBUTES.STYLE, Config.GREY_BACKGROUND_STYLE);
  }
}

function setupStepperButtonListeners(userVoteForReview, plusButtonElement, minusButtonElement, stepperPoints, reviewId, displayedPointsElement) {
  if (userVoteForReview === undefined) {
    // The user will only be able to evaluate the review if he has never evaluated it before. Once a review has been rated, it cannot be rated again, similar to the social network "Jodel".
    plusButtonElement.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
      saveUpvotedStepper(stepperPoints, reviewId, displayedPointsElement);
    });
    minusButtonElement.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
      saveDownvotedStepper(stepperPoints, reviewId, displayedPointsElement);
    });
  }
}

function saveUpvotedStepper(stepperPoints, reviewId, displayedPointsElement) {
  let newVotingBalance = stepperPoints + 1;
  displayedPointsElement.value = newVotingBalance;
  notifyDatabaseToSaveVote(true, reviewId);
}

function saveDownvotedStepper(stepperPoints, reviewId, displayedPointsElement) {
  let newVotingBalance = stepperPoints - 1;
  displayedPointsElement.value = newVotingBalance;
  notifyDatabaseToSaveVote(false, reviewId);
}

function notifyDatabaseToSaveVote(vote, reviewId) {
  // The databaseHandler will need both the vote and the id of the review to save the vote to the database.
  let dataAboutVote = [vote, reviewId];
  createEvent(Config.EVENTS.NOTIFY_DATABASE_TO_SAVE_VOTE, dataAboutVote);
}

function addColorToBadge(votesElement, valueOfAllVotes) {
  // Depending on how the voting balance is, the badge gets a different colour. (red = negative, grey = 0, green = positive)
  if (valueOfAllVotes === 0) {
    votesElement.setAttribute(Config.ATTRIBUTES.CLASS, Config.BADGE_COLORS.GRAY_BADGE);
  } else if (valueOfAllVotes > 0) {
    votesElement.setAttribute(Config.ATTRIBUTES.CLASS, Config.BADGE_COLORS.GREEN_BADGE);
  } else {
    votesElement.setAttribute(Config.ATTRIBUTES.CLASS, Config.BADGE_COLORS.RED_BADGE);
  }
}

function addDeleteButtonToReviewPopupIfReviewWasWrittenByAuthenticatedUser(popupElement, reviewData) {
  /* We will check if the user that is logged-in is also the writer of the opened review or the creator of the game.
   If it's true we will need to create a delete button.
   The firebase database will also check if the logged-in user is allowed to delete the review.*/
  if (reviewData[0].writer === authId || reviewData[2].createdBy === authId || authId === Config.ADMIN_UID) {
    let reviewElementContent = popupElement.querySelector(Config.ELEMENTS.REVIEW_DETAIL_PAGE_CONTENT),
      deleteButton = document.createElement(Config.ELEMENTS.BUTTON_ELEMENT);
    deleteButton.setAttribute(Config.ATTRIBUTES.CLASS, Config.REVIEW_DELETE_BUTTON_CLASS);
    deleteButton.setAttribute(Config.ATTRIBUTES.STYLE, Config.REVIEW_DELETE_BUTTON_STYLE);
    deleteButton.innerHTML = Config.REVIEW_DELETE_BUTTON_TEXT;
    reviewElementContent.lastElementChild.append(deleteButton);
    listenForButtonClickAndNotifyDatabaseToDeleteReview(deleteButton, reviewData[1]);
  }
}

function listenForButtonClickAndNotifyDatabaseToDeleteReview(deleteButton, reviewId) {
  // If the delete button is pressed, the databaseHandler must be informed about it to delete the review.
  deleteButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    appCopy.dialog.confirm(Config.DIALOG_TEXT_DELETE_REVIEW, function() {
      createEvent(Config.EVENTS.DELETE_REVIEW, reviewId);
    });
  });
}

function createCatalogElement(catalogMetaData, catalogMetaDataKey, gameData, catalogList, elementText) {
  let catalogListElement = createElementFromHTML(elementText),
    catalogGamesList = catalogListElement.querySelector(Config.ELEMENTS.CATALOG_GAME_LIST), // The games of a catalog are inserted into this HTML element.
    catalogNameElement = catalogListElement.querySelector(Config.ELEMENTS.CATALOG_NAME),
    catalogCreationDate = catalogListElement.querySelector(Config.ELEMENTS.CATALOG_CREATION_DATE);
  catalogNameElement.innerHTML = catalogMetaData.name; // Set text of catalog title
  if (catalogMetaDataKey !== Config.MY_GAMES_CATALOG_INDIVIDUAL_ID) { // All catalogs will get a date except the general my games catalog
    catalogCreationDate.innerHTML = catalogMetaData.date; // Set text of catalog creation date
  }
  catalogList.append(catalogListElement);
  // After the catalog was added to the list-element of all catalogs we need to insert all games into the catalog element.
  makeSureThatTheMyGamesCatalogIsAtTheBeginningAndAddDeleteButtons(catalogMetaDataKey, catalogListElement, catalogList);
  createGameListForCatalog(catalogMetaData, gameData, catalogListElement, catalogGamesList, catalogList, catalogMetaDataKey);
}

/*It is important that the "My Games" catalog is always at the top of the catalog list.
"My Games" contains all games that a user has ever added to a catalog.
If a user adds a game to any catalog he has created, it will automatically be added to the catalog "My Games".
"My Games" thus contains all games that are in any catalog. If the user deletes a game from "My Games",
it will also be deleted from all other catalogs.  However, if a game is deleted from another catalog, it will
initially remain in "My Games". */
function makeSureThatTheMyGamesCatalogIsAtTheBeginningAndAddDeleteButtons(
  catalogMetaDataKey, catalogListElement, catalogList) {
  if (catalogMetaDataKey === Config.MY_GAMES_CATALOG_INDIVIDUAL_ID) {
    catalogListElement.setAttribute(Config.ATTRIBUTES.CLASS, Config.MY_GAMES_CATALOG_ATTRIBUTE);
  } else {
    /* All catalogs except the "My Games" catalog will get a delete button
     Deleting My Games is not possible.*/
    addDeleteButtonToCatalogElement(catalogMetaDataKey, catalogListElement, catalogList);
  }
  /* The "My Games" catalog should always be at the top of the list, so as soon as it has been
   made from the database fetch data packet into an element, it will always be set as the first child node.*/
  let mygamesCatalog = document.querySelector(Config.MY_GAMES_CATALOG_ATTRIBUTE_SELECTOR);
  if (mygamesCatalog !== null) {
    catalogList.firstElementChild.before(mygamesCatalog);
  }
}

function addDeleteButtonToCatalogElement(catalogMetaDataKey, catalogListElement) {
  let deleteButtonElement = document.createElement(Config.ELEMENTS.BUTTON_ELEMENT);
  deleteButtonElement.setAttribute(Config.ATTRIBUTES.CLASS, Config.DELETE_CATALOG_BUTTON_CLASS);
  deleteButtonElement.innerHTML = Config.DELETE_CATALOG_BUTTON_TEXT;
  catalogListElement.append(deleteButtonElement);
  // When the user clicks the delete button, he is asked again if he really wants to delete the catalog.
  deleteButtonElement.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    appCopy.dialog.confirm(Config.DELETE_CATALOG_CONFIRMATION, function() {
      /* If the user then confirms the deletion, an event should be created to pass the changes on to the database.
       The database will need the key (Individual Id) of the catalog in the database to delete it.*/
      createEvent(Config.EVENTS.DELETE_CATALOG, catalogMetaDataKey);
    });
  });
}

function createGameListForCatalog(catalogMetaData, gameData, catalogListElement, catalogGamesList, catalogList, catalogMetaDataKey) {
  // It's possible that a catalog is empty (to avoid an error), so first we need to check if there are any games added by the user.
  if (catalogMetaData.games !== undefined) {
    let gamesInCatalog = Object.keys(catalogMetaData.games);
    appCopy.request.get(Config.TEMPLATES.CATALOG_GAME_ELEMENT, function(elementText) {
      for (let i = 0; i < gamesInCatalog.length; i++) {
        // Creation of a new element for each game
        createGameInCatalog(i, gamesInCatalog, gameData, catalogListElement, catalogGamesList, catalogList, catalogMetaDataKey, elementText);
      }
    });
  }
}

function createGameInCatalog(i, gamesInCatalog, gameData, catalogListElement, catalogGamesList, catalogList, catalogId, elementText) {
  let catalogGameElement = createElementFromHTML(elementText),
    titleElement = catalogGameElement.querySelector(Config.ELEMENTS.CATALOG_GAME_ELEMENT_TITLE),
    genreElement = catalogGameElement.querySelector(Config.ELEMENTS.CATALOG_GAME_ELEMENT_GENRE),
    releaseYearElement = catalogGameElement.querySelector(Config.ELEMENTS.CATALOG_GAME_ELEMENT_RELEASE_YEAR);
  for (let j = 0; j < gameData.length; j++) {
    // Now we iterate through all the games (which are in My Games) to check for which game in the catalog an item needs to be added.
    if (gamesInCatalog[i] === gameData[j].key) {
      addClickEventListenerToListElementOfGame(catalogGameElement, gameData[j].val(), gameData[j].key, Config.ELEMENTS.CATALOG_VIEW);
      setupDeleteSwipe(catalogId, gameData[j].key, catalogGameElement);
      titleElement.innerHTML = gameData[j].val().title;
      genreElement.innerHTML = gameData[j].val().genre;
      releaseYearElement.innerHTML = gameData[j].val().releaseYear;
    }
  }
  catalogGamesList.append(catalogGameElement);
}

function addClickEventListenerToListElementOfGame(gameListElement, gameData, gameId, gameView) {
  /* If a game element gets clicked, we want to show the view of the whole game.
   We will notify the database to fetch all data needed to display the full game page.
   We need to transfer the following information: which tab opened the full view of the game (for examle #view-catalog) and the id of the clicked game*/
  gameListElement.querySelector(Config.ELEMENTS.ITEM_INNER_OF_GAME_LIST_ELEMENT).addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    let dataNeededDisplayGameInATab = [gameView, gameId];
    /* After we initialized the list-element, we want to set an event-listener
     To see if a list-element has been clicked by the user to see the
     whole game.*/
    createEvent(Config.EVENTS.SHOW_SINGLE_GAME_PAGE, dataNeededDisplayGameInATab);
  });
}

function setupDeleteSwipe(catalogId, gameId, catalogGameElement) {
  let dataNeededToDeleteGameFromCatalog = [gameId, catalogId];
  catalogGameElement.addEventListener(Config.EVENTS.SWIPE_OUT_DELETE_EVENT, function() {
    /* If a game gets deleted from a regular catalog it will only be deleted from this catalog.
     But if the user deletes a game from "MyCatalog" it will also be deleted from all other catalogs
     because all games that are in any catalogs will automatically be in "MyCatalog".
     So this means we need different events because the deletion process will be completely different for
     the database*/
    if (catalogId === Config.MY_GAMES_CATALOG_INDIVIDUAL_ID) {
      createEvent(Config.EVENTS.DELETE_GAME_FROM_MY_CATALOG, dataNeededToDeleteGameFromCatalog);
    } else {
      createEvent(Config.EVENTS.DELETE_GAME_FROM_REGULAR_CATALOG, dataNeededToDeleteGameFromCatalog);
    }
  });
}

function createAddCatalogDialog() {
  appCopy.dialog.prompt(Config.ADD_CATALOG_PROMPT_TEXT, function(catalogName) {
    appCopy.dialog.confirm(Config.ADD_CATALOG_CONFIRMATION_TEXT + catalogName + Config.QUESTION_MARK, function() {
      createEvent(Config.EVENTS.ADD_NEW_CATALOG_TO_DATABASE, catalogName);
    });
  });
}

function initGamePage(gameData, pageElement, viewId) {
  let cardHeaderTitleElement = pageElement.querySelector(Config.ELEMENTS.CARD_HEADER_TITLE_ELEMENT),
    platformElement = pageElement.querySelector(Config.ELEMENTS.PLATFORM_ELEMENT),
    ratingElement = pageElement.querySelector(Config.ELEMENTS.CARD_CREATED_RATING_ELEMENT),
    releaseYearElement = pageElement.querySelector(Config.ELEMENTS.CARD_RELEASE_YEAR_ELEMENT),
    genreElement = pageElement.querySelector(Config.ELEMENTS.CARD_GENRE_ELEMENT),
    description = pageElement.querySelector(Config.ELEMENTS.CARD_DESCRIPTION_ELEMENT),
    averageRating = getAverageRating(gameData[0]),
    reviewSectionListElement = pageElement.querySelector(Config.ELEMENTS.REVIEW_SECTION_LIST),
    imageElement = pageElement.querySelector(Config.ELEMENTS.CARD_IMAGE_ELEMENT);
  initGamePageParts(cardHeaderTitleElement, platformElement, ratingElement, releaseYearElement, genreElement, description, gameData, averageRating,
    imageElement, pageElement, reviewSectionListElement, viewId);
}

function initGamePageParts(cardHeaderTitleElement, platformElement, ratingElement, releaseYearElement, genreElement, description, gameData, averageRating,
  imageElement, pageElement, reviewSectionListElement, viewId) {
  let writeReviewButton = pageElement.querySelector(Config.ELEMENTS.WRITE_REVIEW_BUTTON);
  waitForReviewChanges(gameData[3], gameData[0], reviewSectionListElement, writeReviewButton, platformElement, ratingElement, viewId);
  initCardContent(cardHeaderTitleElement, platformElement, ratingElement, releaseYearElement, genreElement, description, gameData[2], averageRating);
  initCardImage(gameData[1], imageElement);
  addDeleteButtonIfGameWasCreatedByLoggedInUser(gameData, pageElement);
  initButtons(pageElement, gameData[3], writeReviewButton);
  initReviewSection(gameData[0], reviewSectionListElement);
}

function waitForReviewChanges(gameId, reviewData, reviewSectionListElement, writeReviewButton, platformElement, ratingElement, viewId) {
  /* In rare cases, it can happen that while the user is viewing the individual view of a game a
   review is deleted / added. We want to prevent clicking on a review list element for which
   there is no review because it was deleted at runtime.*/
  let dataNeededToUpdateSingleGameView = [gameId, reviewData, reviewSectionListElement, viewId];
  createEvent(Config.EVENTS.WAIT_FOR_SINGLE_GAME_VIEW_CHANGES, dataNeededToUpdateSingleGameView);
}

function getAverageRating(reviewsOfGames) {
  // If there's no review we will directly return 0.
  if (reviewsOfGames === null) {
    return 0;
  }
  let allRankingPoints = 0,
    averageRating;
  for (let i = 0; i < reviewsOfGames.length; i++) {
    allRankingPoints += reviewsOfGames[i][1].ranking;
  }
  averageRating = Math.round(allRankingPoints / reviewsOfGames.length * Config.VALUE_HUNDRED) / Config.VALUE_HUNDRED;
  return averageRating;
}

function initCardContent(cardHeaderTitleElement, platformElement, ratingElement, releaseYearElement, genreElement, description, dataAboutTheGame,
  averageRating) {
  cardHeaderTitleElement.innerHTML = dataAboutTheGame.title;
  platformElement.innerHTML = dataAboutTheGame.platform;
  ratingElement.innerHTML = averageRating;
  releaseYearElement.innerHTML = dataAboutTheGame.releaseYear;
  genreElement.innerHTML = dataAboutTheGame.genre;
  description.innerHTML = dataAboutTheGame.description;
}

function initCardImage(imageUrl, imageElement) {
  imageElement.setAttribute(Config.ATTRIBUTES.STYLE, Config.CARD__STYLE_BEGINNING + imageUrl + Config.CARD_STYLE_ENDING);
}

function addDeleteButtonIfGameWasCreatedByLoggedInUser(gameData, pageElement) {
  let gameId = gameData[3];
  if (authId === gameData[2].createdBy || authId === Config.ADMIN_UID) {
    /* buttonsBlock is the element that contains the "add to catalog" button and the "write review" button.
     We additionally want to display a delete button if the opened game was created by the logged in user.
     The user who added the game is also the only user who will be able to delete it.
     This was also specified in the Firebase security rules.*/
    let buttonsBlock = pageElement.querySelector(Config.ELEMENTS.BUTTONS_GAME_SINGLE_VIEW),
      deleteButton = document.createElement(Config.ELEMENTS.BUTTON_ELEMENT);
    deleteButton.setAttribute(Config.ATTRIBUTES.CLASS, Config.GAME_DELETE_BUTTON_CLASS);
    deleteButton.innerHTML = Config.GAME_DELETE_BUTTON_TEXT;
    buttonsBlock.append(deleteButton);
    deleteGameListener(deleteButton, gameId);
  }
}

function deleteGameListener(deleteButton, gameId) {
  deleteButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    appCopy.dialog.confirm(Config.DIALOG_TEXT_DELETE_GAME, function() {
      /* If the delete button is clicked, the gameId of the present game is passed on.
       Before the game is deleted, the user will be asked again if he really wants to delete the game.*/
      createEvent(Config.EVENTS.DELETE_GAME_BY_ID, gameId);
    });
  });
}

function initButtons(pageElement, gameId, writeReviewButton) {
  let addToCatalogButton = pageElement.querySelector(Config.ELEMENTS.ADD_TO_CATALOG_BOTTONS);
  writeReviewButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    checkIfUserHasAlreadyReviewedThisGame(gameId);
  });
  addToCatalogButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    showUserCatalogs(gameId);
  });
}

function checkIfUserHasAlreadyReviewedThisGame(gameId) {
  createEvent(Config.EVENTS.CHECK_IF_USER_HAS_ALREADY_REVIEWED_THIS_GAME, gameId);
}

function createNotification(notificationTitle, notificationDescription) {
  let notification = appCopy.notification.create({
    subtitle: notificationTitle,
    text: notificationDescription,
    closeTimeout: Config.NOTIFICATION_TIME,
    title: Config.FRAMEWORK7_SETTINGS.name,
    icon: Config.NOTIFICATION_ICON,
  });
  notification.open();
}

function initReviewSection(reviews, reviewSectionListElement) {
  // We only iterate through the reviews, if any exist
  if (reviews !== null) {
    appCopy.request.get(Config.TEMPLATES.REVIEW_IN_GAMES_VIEW_ELEMENT, function(elementText) {
      for (let i = 0; i < reviews.length; i++) {
        addReviewToReviewSection(reviews[i], reviewSectionListElement, elementText);
      }
    });
  }
}

function addReviewToReviewSection(reviewData, reviewSectionListElement, elementText) {
  let gameListElement = createElementFromHTML(elementText),
    rankingElement = gameListElement.querySelector(Config.ELEMENTS.GAME_SINGLE_VIEW_REVIEW_RANKING_ELEMENT),
    titleElement = gameListElement.querySelector(Config.ELEMENTS.GAME_SINGLE_VIEW_REVIEW_TITLE_ELEMENT),
    authorElement = gameListElement.querySelector(Config.ELEMENTS.GAME_SINGLE_VIEW_REVIEW_AUTHOR_ELEMENT),
    badgeElement = gameListElement.querySelector(Config.ELEMENTS.GAME_SINGLE_VIEW_REVIEW_BADGE_ELEMENT),
    votesElement = gameListElement.querySelector(Config.ELEMENTS.GAME_SINGLE_VIEW_REVIEW_VOTES_ELEMENT),
    valueOfAllVotes = getValueOfAllVotes(reviewData[1].votes);
  initReviewTextElements(reviewData, valueOfAllVotes, rankingElement, titleElement, authorElement, votesElement);
  // We want to color the badges of positive vote / negative vote balance
  addColorToBadge(badgeElement, valueOfAllVotes);
  reviewSectionListElement.append(gameListElement);
  setEventListenerForFullViewOfReview(gameListElement, reviewData[0]);
}

function getValueOfAllVotes(votes) {
  let allVotes = Object.values(votes),
    voteLevelOfAllVotes = 0;
  for (let i = 0; i < allVotes.length; i++) {
    if (allVotes[i] === true) {
      voteLevelOfAllVotes++;
    } else {
      voteLevelOfAllVotes--;
    }
  }
  return voteLevelOfAllVotes;
}

function initReviewTextElements(reviewData, valueOfAllVotes, rankingElement, titleElement, authorElement, votesElement) {
  rankingElement.innerHTML = reviewData[1].ranking + Config.MAXIMUM_OF_POINTS;
  titleElement.innerHTML = reviewData[1].title; // Title of the review
  authorElement.innerHTML = reviewData[2];
  votesElement.innerHTML = valueOfAllVotes;
}

function waitForDeletionOfGame(gameId, view) {
  let dataNeededToListenForDeletionAndGame = [gameId, view];
  createEvent(Config.EVENTS.WAIT_FOR_DELETION_OF_GAME, dataNeededToListenForDeletionAndGame);
}

function createReviewForm(gameId) {
  appCopy.request.get(Config.TEMPLATES.REVIEW_FORM_ELEMENT, function(elementText) {
    let reviewForm = createElementFromHTML(elementText),
      popup = appCopy.popup.create({
        content: reviewForm,
        swipeToClose: false, // The review can only be closed with the close button, not with a wipe gesture.
      });
    popup.open();
    listenForDeletionOfGame(gameId, popup);
    listenForUserToAddReview(popup.el, popup, gameId);
    listenForClosingOfReviewForm(popup);
  });
}

function listenForDeletionOfGame(gameId, popup) {
  let dataNeededToClosePopup = [gameId, popup];
  createEvent(Config.EVENTS.WAIT_FOR_DELETION_OF_GAME_FOR_POPUP_AND_SHEET, dataNeededToClosePopup);
}

function listenForUserToAddReview(popupElement, popup, gameId) {
  let addReviewButton = popupElement.querySelector(Config.ELEMENTS.ADD_REVIEW_BUTTON),
    formElement = popupElement.querySelector(Config.ELEMENTS.REVIEW_FORM);
  initColorThemeForPopup(popupElement); // Framework7 Popups do not support the given darkmode by framework7 so we need to change CSS Attributes for the Popup
  addReviewButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    getDataFromFormAndCheckIfDataIsCompleted(formElement, popup, gameId);
  });
}

function initColorThemeForPopup(popupElement) {
  if (darkmodeIsEnabled === true) {
    popupElement.setAttribute(Config.ATTRIBUTES.STYLE, Config.POPUP_BACKGROUND_THEMES.DARK_THEME);
  } else {
    popupElement.setAttribute(Config.ATTRIBUTES.STYLE, Config.POPUP_BACKGROUND_THEMES.LIGHT_THEME);
  }
}

function getDataFromFormAndCheckIfDataIsCompleted(formElement, popup, gameId) {
  // Framework7 offers the possibility to read the data very easily by having the required data in a form element.
  let formData = appCopy.form.convertToData(formElement),
    reviewTitle = formData.reviewTitle,
    rating = parseInt(formData.rating),
    reviewText = formData.reviewText;
  /* The database is notified when both a review title and a description text have been added (should not be empty).
   The rating is automatically 5/5 if the user didn't choose one.*/
  if (reviewTitle === "" || reviewText === "") {
    createNotification(Config.NOTIFICATION_TITLE_WARNING, Config.NOTIFICATION_DESCRIPTION_REVIEW_FORM);
  } else {
    popup.close(true);
    popup.el.remove();
    addReviewToDatabase(reviewTitle, rating, reviewText, gameId);
  }
}

function addReviewToDatabase(reviewTitle, rating, reviewText, gameId) {
  let reviewData = [reviewTitle, rating, reviewText, gameId];
  // The data for the review is forwarded to the database together with the id of the corresponding game.
  createEvent(Config.EVENTS.ADD_REVIEW_TO_DATABASE, reviewData);
}

function listenForClosingOfReviewForm(popup) {
  // If the reviewForm gets closed we also want to delete it's element.
  let closeButton = popup.el.querySelector(Config.ELEMENTS.CLOSE_FORM_BUTTON);
  closeButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    popup.close(true);
    popup.el.remove();
  });
}

function createGameListElement(gameId, gameData, elementText) {
  let gameListElement = createElementFromHTML(elementText),
    gameList = document.querySelector(Config.ELEMENTS.GAME_TAB_GAME_LIST),
    gameTitleElement = gameListElement.querySelector(Config.ELEMENTS.GAME_TAB_GAME_TITLE),
    gameReleaseYearElement = gameListElement.querySelector(Config.ELEMENTS.GAME_TAB_GAME_RELEASE_YEAR),
    gameGenreElement = gameListElement.querySelector(Config.ELEMENTS.GAME_TAB_GAME_GENRE);
  gameTitleElement.innerHTML = gameData.title;
  gameReleaseYearElement.innerHTML = gameData.releaseYear;
  gameGenreElement.innerHTML = gameData.genre;
  gameList.append(gameListElement);
  addDeletionListener(gameListElement, gameId);
  addClickEventListenerToListElementOfGame(gameListElement, gameData, gameId, Config.ELEMENTS.GAME_VIEW);
}

function addDeletionListener(gameListElement, gameId) {
  let dataNeededToWaitForDeletionEvent = [gameListElement, gameId];
  createEvent(Config.EVENTS.WAIT_FOR_DELETION_OF_GAME_ELEMENT, dataNeededToWaitForDeletionEvent);
}

function createEventWithoutData(eventName) {
  let event = new Event(eventName);
  context.notifyAll(event);
}

function initGameFormSheet(formPage) {
  let formElement = formPage.querySelector(Config.ELEMENTS.GAME_FORM),
    addGameButton = formPage.querySelector(Config.ELEMENTS.GAME_FORM_ADD_GAME_BUTTON),
    addImageButton = formPage.querySelector(Config.ELEMENTS.GAME_FORM_ADD_IMAGE_BUTTON);
  addImageButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    getUploadedImage(formElement);
  });
  addGameButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    checkDataFromGameFormSheet(formElement);
  });
}

function getUploadedImage(formElement) {
  /* The user needs to upload an image for the game.
   The name of the uploaded file will be displayed in the fileNameElement.
   The file name is nevertheless changed later by the databaseHandler.
   Source from which the upload mechanism was developed: https://www.aspsnippets.com/Articles/Open-Fileupload-Upload-File-on-Button-Click-using-JavaScript-and-jQuery.aspx*/
  let imageInput = formElement.querySelector(Config.ELEMENTS.IMAGE_INPUT_ELEMENT),
    fileNameElement = formElement.querySelector(Config.ELEMENTS.FILE_NAME_ELEMENT);
  imageInput.click();

  imageInput.onchange = function() {
    let imageFile = imageInput.files[0];
    fileNameElement.innerHTML = imageFile.name;
  };
}

function checkDataFromGameFormSheet(formElement) {
  let gameMetaData = appCopy.form.convertToData(formElement),
    imageInput = formElement.querySelector(Config.ELEMENTS.FILE_INPUT_ELEMENT),
    imageFile = imageInput.files[0],
    releaseYear = parseInt(gameMetaData.releaseYear); // The release Year will be saved as an integer, so we need to convert it.
  gameMetaData.releaseYear = releaseYear;
  // The database will also check if the transferred data has the correct data type. To avoid problems nevertheless, it will check whether something was specified everywhere.
  if (gameMetaData.gameName.length >= 1 && gameMetaData.gamePlatform.length >= 1 && gameMetaData.gameGenre.length >= 1 && gameMetaData.gameDescription.length >= 1 && releaseYear > 0 && checkIfImageIsCompatible(imageFile)) {
    appCopy.dialog.confirm(Config.DIALOG_ASK_USER_IF_HE_REALLY_WANTS_TO_ADD_GAME, function() {
      addGameToDatabase(imageFile, gameMetaData);
    });
  } else {
    // The user is informed by a notification if a correct entry is missing.
    createNotification(Config.NOTIFICATION_TITLE_WARNING, Config.NOTIFICATION_GAME_FORM_NOT_COMPLETE);
  }
}

function checkIfImageIsCompatible(imageFile) {
  if (imageFile !== undefined) {
    // The size of the image should be smaller than 4 MB
    if (imageFile.size <= Config.MAXIMUM_FILE_SIZE && imageFile.type === Config.IMAGE_TYPE) {
      return true;
    }
  }
  return false;
}

function addGameToDatabase(gameImage, gameMetaData) {
  let gameData = [gameImage, gameMetaData];
  // Now the data about the new game as well as the image is transferred to the database.
  createEvent(Config.EVENTS.ADD_GAME_TO_DATABASE, gameData);
}

function initCatalogs(catalogData, gameId) {
  let sheetElement = document.querySelector(Config.ELEMENTS.POPUP_CATALOG_LIST_SHEET_ELEMENT),
    catalogList = document.querySelector(Config.ELEMENTS.POPUP_CATALOG_LIST_ELEMENT),
    doneButton = document.querySelector(Config.ELEMENTS.POPUP_CATALOG_DONE_BUTTON),
    sheet = appCopy.sheet.get(sheetElement);
  doneButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    addChangesToCatalog(sheet, sheetElement, catalogList, catalogData, gameId.data);
  });
  waitForDeletionOfCatalogSheetGame(gameId.data, sheet);
  appCopy.request.get(Config.TEMPLATES.CATALOG_POPUP_ELEMENT, function(elementText) {
    // catalogData[0] contains all catalogs (catalog id in [0], name in [1]) the user created in general
    // catalogData[1] contains all catalogs (catalog id in [0], name in [1]) in which the opened game can be found
    for (let i = 0; i < catalogData[0].length; i++) {
      let catalogId = catalogData[0][i][0],
        catalogName = catalogData[0][i][1];
      createPopupCatalogElement(catalogId, catalogName, catalogList, catalogData, elementText);
    }
  });
}

function addChangesToCatalog(sheet, sheetElement, catalogList, catalogData, gameId) {
  checkWhichCatalogWasSelectedAndSendChangesToTheDatabase(catalogList, catalogData, gameId, sheet);
}

function checkWhichCatalogWasSelectedAndSendChangesToTheDatabase(catalogList, catalogData, gameId, sheet) {
  let catalogsInList = catalogList.childNodes,
    // All catalogs that were selected will now be identified. If a user deletes the game from a catalog (uncheck tickbox) it will be deleted from the database
    selectedCatalogIds = [];
  for (let i = 0; i < catalogsInList.length; i++) {
    let catalogId = catalogsInList[i].id,
      catalogCheckBox = catalogList.childNodes[i].querySelector(Config.ELEMENTS.POPUP_CATALOG_CHECK_BOX);
    if (catalogCheckBox.checked === true) {
      selectedCatalogIds.push([catalogId, true]);
    } else {
      selectedCatalogIds.push([catalogId, false]);
    }
  }
  sendCatalogChangesToDatabase(selectedCatalogIds, gameId);
  sheet.close();
}

function sendCatalogChangesToDatabase(selectedCatalogIds, gameId) {
  let dataToShareAboutChanges = [selectedCatalogIds, gameId]; // We want to notify the database to add/delete the game with the gameId from the selected catalogs
  createEvent(Config.EVENTS.ADD_AND_DELETE_GAME_FROM_CATALOGS, dataToShareAboutChanges);
}

function waitForDeletionOfCatalogSheetGame(gameId, sheet) {
  /* It may be that a user has opened the sheet to add the game to one of his catalogs
   while the game is being deleted. Then the sheet should be closed as well.*/
  let dataNeededToCloseSheet = [gameId, sheet];
  createEvent(Config.EVENTS.WAIT_FOR_DELETION_OF_GAME_FOR_POPUP_AND_SHEET, dataNeededToCloseSheet);
}

function createPopupCatalogElement(catalogId, catalogName, catalogList, catalogData, elementText) {
  let catalogPopupElement = createElementFromHTML(elementText),
    catalogPopupTitleElement = catalogPopupElement.querySelector(Config.ELEMENTS.POPUP_CATALOG_TITLE),
    checkBoxElement = catalogPopupElement.querySelector(Config.ELEMENTS.POPUP_CATALOG_CHECK_BOX);
  catalogPopupTitleElement.innerHTML = catalogName;
  catalogPopupElement.id = catalogId;
  initCatalogPopupCheckBox(catalogId, checkBoxElement, catalogData);
  // When a catalog is added to the list, the catalog "My Games" should always be at the top of the list.
  if (catalogId === Config.MY_GAMES_CATALOG_INDIVIDUAL_ID) {
    catalogList.prepend(catalogPopupElement);
  } else {
    catalogList.append(catalogPopupElement);
  }
}

function checkIfGameIsInCatalog(catalogId, catalogData) {
  for (let i = 0; i < catalogData[1].length; i++) {
    if (catalogData[1][i][0] === catalogId) {
      return true;
    }
  }
  return false;
}

function initCatalogPopupCheckBox(catalogId, checkBoxElement, catalogData) {
  if (catalogId === Config.MY_GAMES_CATALOG_INDIVIDUAL_ID) {
    checkBoxElement.setAttribute(Config.CHECKBOX_CHECKED_ATTRIBUTE_CHECKED_VALUE, true);
    checkBoxElement.setAttribute(Config.CHECKBOX_DISABLED_ATTRIBUTE_VALUE, true); // User should not be able to change this state (a game should always be in "My Catalog" too)
  }
  if (checkIfGameIsInCatalog(catalogId, catalogData) === true) {
    checkBoxElement.setAttribute(Config.CHECKBOX_CHECKED_ATTRIBUTE_CHECKED_VALUE, true);
  }
}

function calculateAverageRatingAndGenerateFavorites(userReviews) {
  let favorites = [],
    rankingSum = 0;
  for (let i = 0; i < userReviews[1].length; i++) {
    rankingSum += userReviews[1][i][1].ranking;
    favorites.push({
      [Config.RANKING_KEY]: userReviews[1][i][1].ranking, [Config.TITLE_KEY]: userReviews[1][i][0],
    });
  }
  generateFavorites(favorites);
  return rankingSum;
}

function generateFavorites(favorites) {
  favorites.sort((favorite, nextFavorite) => nextFavorite.ranking - favorite.ranking);
  appCopy.request.get(Config.TEMPLATES.PROFILE_GAME_ELEMENT, function(elementText) {
    for (let i = 0; i < Config.AMOUNT_OF_FAVORITE_GAMES_TO_DISPLAY; i++) {
      if (favorites[i]) {
        createFavoriteGameElement(favorites, elementText, i);
      }
    }
  });
}

function createFavoriteGameElement(favorites, elementText, i) {
  let rankingOfGame = favorites[i][Config.RANKING_KEY],
    gameTitle = favorites[i][Config.TITLE_KEY],
    favElement = createElementFromHTML(elementText),
    favoriteGamesListElement = document.querySelector(Config.ELEMENTS.FAVORITE_GAME_LIST_ELEMENT),
    rankingElement = favElement.querySelector(Config.ELEMENTS.FAVORITE_GAME_ELEMENT_RANKING),
    gameTitleElement = favElement.querySelector(Config.ELEMENTS.FAVORITE_GAME_GAME_TITLE);
  rankingElement.innerHTML = rankingOfGame + Config.MAXIMUM_OF_POINTS;
  gameTitleElement.innerHTML = gameTitle;
  favoriteGamesListElement.append(favElement);
}

function initGauge(isEmpty, gaugeLevel, avg, textAvg) {
  if (isEmpty) {
    gaugeLevel.update({
      value: 0,
      valueText: Config.NO_POINTS_TEXT,
    });
  } else {
    gaugeLevel.update({
      value: avg,
      valueText: textAvg + Config.MAXIMUM_OF_POINTS,
    });
  }
}

function initSettingsPage(settingsData, settingsViewElement) {
  initUsernameElement(settingsData, settingsViewElement);
  initDarkModeSwitchElement(settingsData, settingsViewElement);
  initRoleElement(settingsData, settingsViewElement);
}

function initUsernameElement(settingsData, settingsViewElement) {
  let usernameElement = settingsViewElement.querySelector(Config.ELEMENTS.USERNAME_ELEMENT),
    editNameButton = settingsViewElement.querySelector(Config.ELEMENTS.EDIT_USERNAME_BUTTON);
  usernameElement.innerHTML = Config.YOUR_USERNAME_TEXT + settingsData[1] + Config.APOSTROPHE_AT_THE_END;
  editNameButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    // Open dialog to ask user for new username
    appCopy.dialog.prompt(Config.NEW_USERNAME_PROMPT_TEXT, function(newUsername) {
      usernameElement.innerHTML = Config.YOUR_USERNAME_TEXT + newUsername + Config.APOSTROPHE_AT_THE_END;
      updateTopBarUsername(newUsername);
      createEvent(Config.EVENTS.SAVE_USERNAME_SETTINGS_TO_DATABASE, newUsername);
    });
  });
}

function updateTopBarUsername(newUsername) {
  // If the username is changed, this should also be changed in the top bar of the Profile tab.
  let profileTabTopBarElement = document.querySelector(Config.ELEMENTS.PROFILE_TAB_TOP_BAR_ELEMENT);
  profileTabTopBarElement.innerHTML = newUsername + Config.PROFILE_TAB_TITLE_PREFIX;
}

function initDarkModeSwitchElement(settingsData, settingsViewElement) {
  let darkModeSwitchElement = settingsViewElement.querySelector(Config.ELEMENTS.DARKMODE_TOGGLE),
    toggler = appCopy.toggle.get(darkModeSwitchElement);
  if (settingsData[0] === true) {
    toggler.toggle();
  }
  darkModeSwitchElement.addEventListener(Config.EVENTS.TOGGLE_SWITCH_EVENT, function() {
    let darkmodeSettings = toggler.checked;
    changeColorTheme(darkmodeSettings);
  });
}

function changeColorTheme(darkmodeSettings) {
  // If the darkmode settings are changed, this should be passed on to the database and the theme of the application should be updated immediately (change of class)
  let mainView = document.querySelector(Config.ELEMENTS.APP_ELEMENT);
  if (darkmodeSettings === true) {
    darkmodeIsEnabled = true;
    mainView.setAttribute(Config.ATTRIBUTES.CLASS, Config.THEMES.DARK_THEME);
    createEvent(Config.EVENTS.SAVE_DARKMODE_SETTINGS_TO_DATABASE, darkmodeSettings);
  } else {
    darkmodeIsEnabled = false;
    mainView.setAttribute(Config.ATTRIBUTES.CLASS, Config.THEMES.LIGHT_THEME);
    createEvent(Config.EVENTS.SAVE_DARKMODE_SETTINGS_TO_DATABASE, darkmodeSettings);
  }
}

function initRoleElement(settingsData, settingsViewElement) {
  let roleElement = settingsViewElement.querySelector(Config.ELEMENTS.ROLE_ELEMENT);
  roleElement.innerHTML = Config.YOUR_ROLE_TEXT + settingsData[2];
}

function showUserCatalogs(gameId) {
  destroyExistingSheetIfExisting();
  appCopy.request.get(Config.TEMPLATES.GAME_CATALOG_SHEET, function(elementText) {
    let sheet = appCopy.sheet.create({
      content: elementText,
    });
    sheet.on(Config.EVENTS.SHEET_OPENED, function() {
      createEvent(Config.EVENTS.SHOW_USER_CATALOGS, gameId);
    });
    sheet.open(true);
  });
}

function destroyExistingSheetIfExisting() {
  /* It might be that there's an opened sheet to add a game to a catalog.
   To prevent the user from no longer knowing which sheet belongs to which open game, a still opened sheet is closed to open a new one.*/
  let possiblyExistingCatalogSheetView = appCopy.sheet.get(Config.ELEMENTS.POSSIBLY_EXISTING_CATALOG_SHEET);
  if (possiblyExistingCatalogSheetView !== undefined) {
    possiblyExistingCatalogSheetView.close();
  }
}

class MainUIHandler extends Observable {
  constructor(app) {
    super();
    appCopy = app;
    context = this;
  }

  initAuthId(loggedInUserId) {
    authId = loggedInUserId;
  }

  initUserReviews(reviews) {
    let reviewIds = reviews[0],
      transferedData = reviews[1];
    /* We used a request libary offered by Framework7: https://framework7.io/docs/request.html
     to load HTML elements/templates from HTML files*/
    appCopy.request.get(Config.TEMPLATES.REVIEW_LIST_ELEMENT, function(elementText) {
      for (let i = 0; i < transferedData.length; i++) {
        // Iteration through all fetched reviews to create the HTML elements
        createUserReviewElement(transferedData[i], reviewIds[i], elementText);
      }
    });
  }

  clearReviewTab() {
    let reviewList = document.querySelector(Config.ELEMENTS.REVIEW_TAB_REVIEW_LIST);
    // delete all reviews from list
    reviewList.innerHTML = "";
  }

  removeReviewSheet(reviewSheet) {
    reviewSheet.close(true);
    reviewSheet.el.remove();
  }

  notifyUserThatOpenedReviewWasDeleted() {
    createNotification(Config.NOTIFICATION_TITLE_WARNING, Config.REVIEW_WAS_DELETED);
  }

  initSingleReviewPage(reviewData) {
    /* reviewData contains a lot of data needed to display the single view of a review
    reviewData[0] contains data about the review itself
    reviewData[1] contains the id of the review in the database
    reviewData[2] contains data about the game for which the review was written
    reviewData[3] contains data about the writer (role+username)
    reviewData[4] is either true (already voted up by the logged-in user) or false (voted down)
    */
    reviewData[2] = reviewData[2].val(); // We need the game data (not the key of the game for the next process)
    appCopy.request.get(Config.TEMPLATES.REVIEW_DETAIL_ELEMENT, function(elementText) {
      let reviewPage = createElementFromHTML(elementText),
        popup = appCopy.popup.open(reviewPage);
      initReviewViewPopup(popup, reviewData);
    });
  }

  createCatalog(catalogData) {
    let catalogMetaData = Object.values(catalogData[0]), // catalogMetaData contains Data like the date of creation
      catalogMetaDataKeys = Object.keys(catalogData[0]),
      gameData = catalogData[1], // Contains all data about all the games that are in any catalog
      catalogList = document.querySelector(Config.ELEMENTS.CATALOG_LIST_ELEMENT);
    // First we need to fetch the HTML element of a catalog
    appCopy.request.get(Config.TEMPLATES.CATALOG_LIST_ELEMENT, function(elementText) {
      for (let i = 0; i < catalogMetaData.length; i++) {
        /* catalogMetaData[i] contains data like the date of creation of a catalog
         catalogMetaDataKeys[i] contains the id of the catalog
         gameData contains data about all the games in all user catalogs
         catalogList is the HTML element where we want to insert the catalog items*/
        createCatalogElement(catalogMetaData[i], catalogMetaDataKeys[i], gameData, catalogList, elementText);
      }
    });
  }

  setupAddCatalogButton() {
    let addCatalogButton = document.querySelector(Config.ELEMENTS.ADD_CATALOG_BUTTON_ELEMENT);
    addCatalogButton.addEventListener(Config.EVENTS.CLICK_EVENT, createAddCatalogDialog);
  }

  deleteElementsInCatalogListToReloadIt() {
    // To insert the newest versions of the catalogs from the database we need to clear the catalog-list.
    let catalogTabList = document.querySelector(Config.ELEMENTS.CATALOG_LIST_ELEMENT);
    catalogTabList.innerHTML = "";
  }

  showSingleGamePage(gameData, viewId) {
    let view = appCopy.views.create(viewId);
    view.router.navigate(Config.ROUTE_NAMES.GAME_VIEW);
    view.on(Config.EVENTS.PAGE_INIT, function(page) {
      initGamePage(gameData, page.el, viewId);
      waitForDeletionOfGame(gameData[3], view); // gameId and view object
    });
  }

  goBackWithRouter(view) {
    view.router.back();
  }

  updateReviewList(reviews, reviewList) {
    reviewList.innerHTML = "";
    initReviewSection(reviews, reviewList);
  }

  createReviewForm(gameId) {
    createReviewForm(gameId);
  }

  createNotificationToNotifyUserThatGameWasAlreadyReviews() {
    createNotification(Config.WARNING_SUBTITLE_ALREADY_CREATED_A_REVIEW, Config.WARNING_TEXT_ALREADY_CREATED_A_REVIEW);
  }

  createGameList(games) {
    // The games that were newly fetched from the database should now be added to the list.
    if (games !== null) {
      // To create the elements, both the id of the game in the database and the data for the game are passed to the method.
      let gameIds = Object.keys(games);
      appCopy.request.get(Config.TEMPLATES.GAMES_LIST_ELEMENT, function(elementText) {
        for (let i = 0; i < gameIds.length; i++) {
          createGameListElement(gameIds[i], games[gameIds[i]], elementText);
        }
      });
    }
  }

  addGameToGameList(gameId, gameData) {
    appCopy.request.get(Config.TEMPLATES.GAMES_LIST_ELEMENT, function(elementText) {
      createGameListElement(gameId, gameData, elementText);
    });
  }

  removeGameListElement(gameId, dataOfGameElement) {
    // Now we have to see if this is the item that was deleted from the Game List.
    if (gameId === dataOfGameElement[1]) {
      let gameListElement = dataOfGameElement[0];
      gameListElement.parentNode.removeChild(gameListElement);
    }
  }

  openAddGameForm() {
    let gameFormView = appCopy.views.create(Config.ELEMENTS.GAME_VIEW); //eslint-disable-line
    gameFormView.router.navigate(Config.ROUTE_NAMES.GAME_FORM);
    /* It needs some time to load the new View into the
     index.html. So we will wait until the page gets initialized.
     Afterwards the form will be initialized.*/
    gameFormView.on(Config.EVENTS.PAGE_INIT, function(formPage) {
      initGameFormSheet(formPage.el);
    });
  }

  showLoadingBar() {
    appCopy.preloader.show();
  }

  stopLoadingBar() {
    appCopy.preloader.hide();
  }

  goBackToGamesList() {
    // After the game was added successfully, we want to close the displayed view
    let formViewElement = document.querySelector(Config.ELEMENTS.GAME_VIEW),
      formView = appCopy.views.get(formViewElement);
    formView.router.back();
  }

  createNotificationToNotifyUserThatGameWasAddedSuccessfully() {
    createNotification(Config.GAME_WAS_ADDED_SUBTITLE, Config.GAME_WAS_ADDED_TEXT);
  }

  initGameListSearchbar() {
    appCopy.searchbar.create({
      el: Config.ELEMENTS.GAME_LIST_SEARCHBAR_ELEMENT,
      searchContainer: Config.ELEMENTS.GAME_TAB_GAME_LIST, // List which contains all game elements
      searchIn: Config.ELEMENTS.GAME_TITLE_LIST_ELEMENT_GAME_TAB,
    });
  }

  initUserCatalogsForGame(catalogData, gameId) {
    initCatalogs(catalogData, gameId);
  }

  initProfile(userData, userReviews) {
    let profileTabTopBarElement = document.querySelector(Config.ELEMENTS.PROFILE_TAB_TOP_BAR_ELEMENT),
      gaugeLevel = appCopy.gauge.get(Config.ELEMENTS.GAUGE_ELEMENT),
      dateJoinedElement = document.querySelector(Config.ELEMENTS.DATE_JOINED_ELEMENT),
      reviewCountElement = document.querySelector(Config.ELEMENTS.REVIEW_COUNTER_ELEMENT),
      rankingSum = 0,
      isEmpty = true,
      noOfReviews = Config.NO_REVIEWS_WRITTEN_BY_LOGGED_IN_USER,
      textAvg, avg;
    if (userReviews !== null) {
      noOfReviews = userReviews[0].length;
      isEmpty = false;
      rankingSum = calculateAverageRatingAndGenerateFavorites(userReviews);
    }
    textAvg = Math.round(rankingSum / noOfReviews * Config.VALUE_HUNDRED) / Config.VALUE_HUNDRED;
    avg = textAvg / Config.MAXIMUM_OF_POINTS_VALUE;
    profileTabTopBarElement.innerHTML = userData.name + Config.PROFILE_TAB_TITLE_PREFIX;
    dateJoinedElement.innerHTML = userData.dayOfJoining;
    reviewCountElement.innerHTML = noOfReviews;
    initGauge(isEmpty, gaugeLevel, avg, textAvg);
  }

  showSettings(settingsData) {
    let settingsView = appCopy.views.create(Config.ELEMENTS.VIEW_PROFILE); //eslint-disable-line
    settingsView.router.navigate(Config.ROUTE_NAMES.SETTINGS);
    /* It needs some time to load the HTML-element into the
     displayed page. So we will wait until the page gets initialized.*/
    settingsView.once(Config.EVENTS.PAGE_AFTER_IN, function(settingsViewElement) {
      initSettingsPage(settingsData, settingsViewElement.el);
    });
  }

  showLogOutDialog() {
    appCopy.dialog.confirm(Config.DIALOG_SIGN_OUT, function() {
      // As soon as the user confirms that he wants to restart the application, the event is created for notification to the authorization database.
      createEventWithoutData(Config.EVENTS.SIGN_OUT_FROM_ACCOUNT);
    });
  }

  initDarkmodeSettings(darkmodeSettings) {
    let mainView = document.querySelector(Config.ELEMENTS.APP_ELEMENT);
    if (darkmodeSettings === true) {
      mainView.setAttribute(Config.ATTRIBUTES.CLASS, Config.THEMES.DARK_THEME);
      darkmodeIsEnabled = true;
    } else {
      mainView.setAttribute(Config.ATTRIBUTES.CLASS, Config.THEMES.LIGHT_THEME);
      darkmodeIsEnabled = false;
    }
  }

  clearFavorites() {
    let listOfFavoriteGames = document.querySelector(Config.ELEMENTS.FAVORITE_GAME_LIST_ELEMENT);
    listOfFavoriteGames.innerHTML = "";
  }

}

export default MainUIHandler;
