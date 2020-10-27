import DatabaseHandler from "./database/databaseHandler.js";
import AuthorizationHandler from "./authorization/authorizationHandler.js";
import MainUIHandler from "./ui/mainUIHandler.js";
import Config from "./utils/config.js";
var app, databaseHandler, authorizationHandler, mainUIHandler;
setupModules();
getStatus();

function setupModules() {
  /* global Framework7 */
  app = new Framework7(Config.FRAMEWORK7_SETTINGS);
  databaseHandler = new DatabaseHandler();
  // The process of authentication is made completely separate from the initialization and control of the main user interface.
  authorizationHandler = new AuthorizationHandler();
  mainUIHandler = new MainUIHandler(app);
  /* global firebase */
  databaseHandler.initDatabase(firebase);
}

function getStatus() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      authorizationHandler.initGlobalVariables(app, firebase, databaseHandler.getRootReference());
      databaseHandler.initAuthId();
      mainUIHandler.initAuthId(databaseHandler.getAuthId());
      initUI();
    } else {
      // If the user is not logged in yet, a login/register dialog is created using popups before the main UI gets initialized.
      authorizationHandler.initGlobalVariables(app, firebase, databaseHandler.getRootReference());
      authorizationHandler.initHandlers();
      authorizationHandler.createLoginPopupAndWelcomePopup();
    }
  });
}

function initUI() {
  /* Besides the initialization of the UI, e.g. with list elements, mainly events are
  intercepted for certain user interactions within the application.*/
  initReviewPage();
  initReviewHandler();
  initCatalogPage();
  initEventListenerToShowTheWholePageOfAGame();
  addAndDeleteGameFromCatalogs();
  initGamesPage();
  initReviewFormHandlers();
  initProfilePage();
  initDarkmode();
  checkIfUserReviewsChanged();
}

function initReviewPage() {
  // We would like to display all reviews that the user has written in the Reviews tab.
  // First, we will fetch all the data needed to display the list elements of all reviews written by the logged-in user from the database.
  databaseHandler.getUserReviews().then(function(reviewData) {
    let userReviewIds = [];
    // it might be that there are no reviews written by the user
    if (reviewData !== null) {
      mainUIHandler.initUserReviews(reviewData);
      userReviewIds = reviewData[0];
    }
    databaseHandler.waitingForChangesOfUserReviews(userReviewIds);
  });
}

function initReviewHandler() {
  setupEventsForFullViewOfReview();
  setupDeletionEventsOfReviews();
}

function setupEventsForFullViewOfReview() {
  // When a list element of a review is clicked, all data required to display the individual view of a review is fetched.
  mainUIHandler.addEventListener(Config.EVENTS.LOAD_FULL_REVIEW, function(reviewId) {
    // The databaseHandler will return all data needed to display the detailed review page just by the id of the review in the database.
    databaseHandler.getDataForSingleReview(reviewId.data).then(function(reviewData) {
      mainUIHandler.initSingleReviewPage(reviewData);
    });
  });
  mainUIHandler.addEventListener(Config.EVENTS.NOTIFY_DATABASE_TO_SAVE_VOTE, function functionName(voteData) {
    // vote data contains the id of the review that was rated and whether the review received an upvote (true) or downvote (false)
    databaseHandler.saveUserVoteToReviewAndProfile(voteData.data);
  });
}

function setupDeletionEventsOfReviews() {
  // If a review was deleted by clicking the delete button, this should be passed on to the database.
  mainUIHandler.addEventListener(Config.EVENTS.DELETE_REVIEW, function(reviewIdData) {
    databaseHandler.deleteReview(reviewIdData.data);
  });
  /* Assuming that the user has the review open, it is possible that the game to which this review belongs will be deleted at
   that moment and therefore the review will be deleted as well. It is also possible that the review is deleted by the
   creator of the game. So there are many cases where the sheet should be closed, not just by the user clicking the delete button.*/
  mainUIHandler.addEventListener(Config.EVENTS.WAIT_FOR_DELETION_OF_REVIEW_TO_CLOSE_REVIEW, function(reviewData) {
    let reviewId = reviewData.data[1];
    databaseHandler.waitForDeletionOfReview(reviewId).then(function(wasDeleted) {
      if (wasDeleted) {
        let reviewSheet = reviewData.data[0];
        mainUIHandler.removeReviewSheet(reviewSheet);
        mainUIHandler.notifyUserThatOpenedReviewWasDeleted();
      }
    });
  });
}

function initCatalogPage() {
  loadCatalogsFromDatabase();
  mainUIHandler.setupAddCatalogButton();
  mainUIHandler.addEventListener(Config.EVENTS.ADD_NEW_CATALOG_TO_DATABASE, function(catalogName) {
    databaseHandler.addCatalogToUserProfile(catalogName);
  });
  initCatalogDeletionEvents();
}

function loadCatalogsFromDatabase() {
  // First we need to fetch the data needed to display all catalogs in the catalog-tab.
  databaseHandler.getUserCatalogs().then(function(dataForCatalog) {
    /* After the first time all catalogs have been fetched from the database,
     we want to listen to whether any are added/deleted at runtime. So all´r
     catalogIds are passed to a listener that waits for changes.
     The Catalog Tab is then reloaded.
     We would also like to notice, for example, if a game is deleted from a catalog at runtime.*/
    databaseHandler.waitForGamesInCatalogChanges();
    mainUIHandler.createCatalog(dataForCatalog);
  });
}

function initCatalogDeletionEvents() {
  mainUIHandler.addEventListener(Config.EVENTS.DELETE_CATALOG, function(catalogMetaDataKey) {
    let catalogId = catalogMetaDataKey.data;
    databaseHandler.deleteCatalog(catalogId);
  });
  mainUIHandler.addEventListener(Config.EVENTS.DELETE_GAME_FROM_MY_CATALOG, function(deletedGameData) {
    databaseHandler.deleteGameFromMyCatalog(deletedGameData.data);
  });
  mainUIHandler.addEventListener(Config.EVENTS.DELETE_GAME_FROM_REGULAR_CATALOG, function(deletedGameData) {
    databaseHandler.deleteGameFromRegularCatalog(deletedGameData.data);
  });
  databaseHandler.addEventListener(Config.EVENTS.RELOAD_CATALOG_TAB, function() {
    mainUIHandler.deleteElementsInCatalogListToReloadIt();
    databaseHandler.getUserCatalogs().then(function(dataForCatalog) {
      databaseHandler.waitForGamesInCatalogChanges();
      mainUIHandler.createCatalog(dataForCatalog);
    });
  });
}

function initEventListenerToShowTheWholePageOfAGame() {
  showSingleGamePageEvent();
  gameDeletionEvents();
  /* We want to update the list with all reviews that were created for a game in realtime.
  So if the user opens the view of a single game we need to listen for changes (new review or review was deleted)*/
  mainUIHandler.addEventListener(Config.EVENTS.WAIT_FOR_SINGLE_GAME_VIEW_CHANGES, function(dataNeededToUpdateSingleGameView) {
    databaseHandler.waitForSingleGameViewChanges(dataNeededToUpdateSingleGameView.data);
  });
  databaseHandler.addEventListener(Config.EVENTS.RELOAD_REVIEW_LIST_IN_GAME_VIEW, function(dataNeededToReloadReviewSection) {
    databaseHandler.getDataNeededToReloadReviewSection(dataNeededToReloadReviewSection.data[0]).then(function(reviews) {
      mainUIHandler.updateReviewList(reviews, dataNeededToReloadReviewSection.data[1]);
    });
  });
  checkIfUserHasAlreadyReviewedGameEvent();
}

function showSingleGamePageEvent() {
  mainUIHandler.addEventListener(Config.EVENTS.SHOW_SINGLE_GAME_PAGE, function(gameDataNeededToRequestSingleGamePageData) {
    // Sometimes it can take a little longer to fetch a game including an image from the database. Therefore a loading bar is displayed.
    mainUIHandler.showLoadingBar();
    showSingleGamePage(gameDataNeededToRequestSingleGamePageData.data);
  });
}

function showSingleGamePage(gameDataNeededToRequestSingleGamePageData) {
  databaseHandler.getDataNeededToDisplaySinglePageOfGame(gameDataNeededToRequestSingleGamePageData).then(function(gameData) {
    mainUIHandler.showSingleGamePage(gameData, gameDataNeededToRequestSingleGamePageData[0]); // transferedData[0] is the id of the view (tab) where we want to display the full view of a single game
    mainUIHandler.stopLoadingBar();
  });
}

function gameDeletionEvents() {
  // As soon as the single view for a game exists, we want to check if the game has been deleted (might happen because of another user or if the logged-in user is the creator of the game). Then the single view should be closed.
  mainUIHandler.addEventListener(Config.EVENTS.WAIT_FOR_DELETION_OF_GAME, function(gameData) {
    databaseHandler.waitForDeletionOfGame(gameData.data[0], gameData.data[1]);
  });
  databaseHandler.addEventListener(Config.EVENTS.GO_BACK_AFTER_GAME_WAS_DELETED, function(gameData) {
    mainUIHandler.goBackWithRouter(gameData.data);
  });
}

function checkIfUserHasAlreadyReviewedGameEvent() {
  /* If the user clicks on the "write review" button, only a popup for writing a review should be created if the
   user has not yet written a review for the game. So every time the button is clicked, it will be checked if a review has already been written or not.*/
  mainUIHandler.addEventListener(Config.EVENTS.CHECK_IF_USER_HAS_ALREADY_REVIEWED_THIS_GAME, function(gameId) {
    databaseHandler.checkIfUserHasAlreadyReviewedThisGameById(gameId.data).then(function(userAlreadyReviewedThisGame) {
      if (!userAlreadyReviewedThisGame) {
        mainUIHandler.createReviewForm(gameId.data);
      } else {
        mainUIHandler.createNotificationToNotifyUserThatGameWasAlreadyReviews();
      }
    });
  });
}

function addAndDeleteGameFromCatalogs() {
  mainUIHandler.addEventListener(Config.EVENTS.ADD_AND_DELETE_GAME_FROM_CATALOGS, function(catalogDataAboutaddAndDeleteGameFromCatalogs) {
    databaseHandler.addAndDeleteGameFromCatalogs(catalogDataAboutaddAndDeleteGameFromCatalogs);
  });
}

function initGamesPage() {
  fetchGamesFromDatabaseAndInitGameList();
  /* The following two methods deal with keeping the list up to date (at runtime!).
   It is taken into account whether a new game is added to the list or even deleted.*/
  waitForDeletionAndAddingOfGameElement();
  initAddGameFunctionality(); // Adds ability to add Games
  mainUIHandler.initGameListSearchbar();
  waitForDeletionOfGameForCatalogSheet();
  mainUIHandler.addEventListener(Config.EVENTS.SHOW_USER_CATALOGS, function functionName(gameId) {
    databaseHandler.getCatalogDataFromDatabase(gameId.data).then(function(catalogData) {
      mainUIHandler.initUserCatalogsForGame(catalogData, gameId);
    });
  });
  mainUIHandler.addEventListener(Config.EVENTS.DELETE_GAME_BY_ID, function(gameId) {
    databaseHandler.deleteGameById(gameId.data);
  });
}

function fetchGamesFromDatabaseAndInitGameList() {
  databaseHandler.getGamesForGameBrowser().then(function(games) {
    waitForAdditionOfNewGame(games);
    // It might be that there are no games in the database (rare scenario)
    if (games !== null) {
      mainUIHandler.createGameList(games);
    }
  });
}

function waitForDeletionAndAddingOfGameElement() {
  // We want the list of all games to be kept up to date. For this we have to listen to whether an existing one has been deleted.
  mainUIHandler.addEventListener(Config.EVENTS.WAIT_FOR_DELETION_OF_GAME_ELEMENT, function(dataOfGameElement) {
    databaseHandler.waitForDeletionOfGameElement(dataOfGameElement.data[1]);
    databaseHandler.addEventListener(Config.EVENTS.GAME_ELEMENT_WAS_REMOVED, function(gameId) {
      mainUIHandler.removeGameListElement(gameId.data, dataOfGameElement.data);
    });
  });
}

function waitForAdditionOfNewGame(games) {
  // If a new game is added to the database, it should also be added to the list.
  let gameIds = [];
  // It might be that there are no games in the database (rare scenario)
  if (games !== null) {
    gameIds = Object.keys(games);
  }
  databaseHandler.waitForAdditionOfNewGame(gameIds);
  databaseHandler.addEventListener(Config.EVENTS.NEW_GAME_WAS_ADDED_TO_DATABASE, function(newGame) {
    mainUIHandler.addGameToGameList(newGame.data.key, newGame.data.val());
  });
}

function initAddGameFunctionality() {
  /* The Form to create a new game and add it to the database will be opened when the user clicks on the
   addGameButton*/
  let addGameButton = document.querySelector(Config.ELEMENTS.ADD_GAME_BUTTON);
  addGameButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    mainUIHandler.openAddGameForm();
  });
  mainUIHandler.addEventListener(Config.EVENTS.ADD_GAME_TO_DATABASE, function(gameData) {
    databaseHandler.addGameToDatabase(gameData.data);
    // It might take some time until the game was added to the database, so we will create a loading bar.
    mainUIHandler.showLoadingBar();
  });
  databaseHandler.addEventListener(Config.EVENTS.GAME_CREATION_PROCESS_IS_DONE, function() {
    // The loading bar should be closed again as soon as the game has been successfully added to the database.
    mainUIHandler.stopLoadingBar();
    // After the game was added to the database, we want to go back to the list of all games.
    mainUIHandler.goBackToGamesList();
    mainUIHandler.createNotificationToNotifyUserThatGameWasAddedSuccessfully();
  });
}

function waitForDeletionOfGameForCatalogSheet() {
  mainUIHandler.addEventListener(Config.EVENTS.WAIT_FOR_DELETION_OF_GAME_FOR_POPUP_AND_SHEET, function(sheetData) {
    databaseHandler.waitForDeletionOfGameForPopupAndSheet(sheetData.data);
  });
  databaseHandler.addEventListener(Config.EVENTS.CLOSE_POPUP_AND_SHEET_AFTER_GAME_WAS_DELETED, function(dataFromDeletionDatabaseEvent) {
    dataFromDeletionDatabaseEvent.data[1].close(true);
  });
}

function initReviewFormHandlers() {
  mainUIHandler.addEventListener(Config.EVENTS.ADD_REVIEW_TO_DATABASE, function(reviewData) {
    /* There is the rare scenario that the user has the review form opened for the same game on two different devices with the same account.
     To prevent the user from writing two reviews for the same game, even after clicking on the button to add a review after
     it has been written, it will be checked again whether a review has already been written.*/
    databaseHandler.checkIfUserHasAlreadyReviewedThisGameById(reviewData.data[3]).then(function(userAlreadyReviewedThisGame) {
      if (!userAlreadyReviewedThisGame) {
        databaseHandler.addReviewToDatabase(reviewData.data);
      } else {
        mainUIHandler.createNotificationToNotifyUserThatGameWasAlreadyReviews();
      }
    });
  });
}

function initProfilePage() {
  initStatistics();
  initSettingsInitialization();
  initSignOutFunctionality();
  listenForSettingChanges();
}

function initStatistics() {
  databaseHandler.getUserProfile().then(function(userProfileData) {
    databaseHandler.getUserReviews().then(function(reviews) {
      mainUIHandler.initProfile(userProfileData, reviews);
    });
  });
}

function initSettingsInitialization() {
  let settingsButton = document.querySelector(Config.ELEMENTS.SETTINGS_BUTTON);
  settingsButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    databaseHandler.getDataForSettingsView().then(function(settingsData) {
      mainUIHandler.showSettings(settingsData);
    });
  });
}

function initSignOutFunctionality() {
  let logOutButton = document.querySelector(Config.ELEMENTS.LOGOUT_BUTTON);
  logOutButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    mainUIHandler.showLogOutDialog();
  });
  mainUIHandler.addEventListener(Config.EVENTS.SIGN_OUT_FROM_ACCOUNT, function() {
    authorizationHandler.logOutFromUserAccount();
    window.location.reload();
  });
}

function listenForSettingChanges() {
  // If either the username or the theme is changed, this is directly passed on to the database.
  mainUIHandler.addEventListener(Config.EVENTS.SAVE_DARKMODE_SETTINGS_TO_DATABASE, function(darkmodeSettings) {
    databaseHandler.saveDarkmodeSettingsToDatabase(darkmodeSettings.data);
  });
  mainUIHandler.addEventListener(Config.EVENTS.SAVE_USERNAME_SETTINGS_TO_DATABASE, function(newUsername) {
    databaseHandler.saveUsernameSettingsToDatabase(newUsername.data);
  });
}

function initDarkmode() {
  databaseHandler.getDarkmodeSettingsFromDatabase().then(function(darkmodeSettings) {
    mainUIHandler.initDarkmodeSettings(darkmodeSettings);
  });
}

function checkIfUserReviewsChanged() {
  /* If a review was either deleted or added by the logged-in users, both the
   review-tab and the profile-tab must be reloaded.*/
  databaseHandler.addEventListener(Config.EVENTS.USER_REVIEWS_CHANGED, function() {
    databaseHandler.getUserReviews().then(function(reviewData) {
      mainUIHandler.clearReviewTab();
      // It might be that there are no reviews written by the logged-in user
      if (reviewData !== null) {
        mainUIHandler.initUserReviews(reviewData);
      }
      reloadProfileTab();
    });
  });
}

function reloadProfileTab() {
  // If the logged-in user has written a new review or deletes one, all statistics in the Profile tab will also change.
  mainUIHandler.clearFavorites();
  initStatistics();
}
