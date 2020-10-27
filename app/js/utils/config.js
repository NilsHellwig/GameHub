const Config = {
  FRAMEWORK7_SETTINGS: {
    root: "#app", // App root element
    name: "GameHub", // App name
    theme: "auto", // Automatic theme detection
    routes: [{
      name: "home",
      path: "/",
      url: "./index.html",
    }, {
      name: "gameForm",
      path: "/gameForm/",
      url: "./templates/game-form.html",
    }, {
      name: "gameView",
      path: "/gameView/",
      url: "./templates/gameview.html",
    }, {
      name: "settings",
      path: "/settings/",
      url: "./templates/settings.html",
    }],
  },
  ROUTE_NAMES: {
    GAME_VIEW: "/gameView/",
    GAME_FORM: "/gameForm/",
    SETTINGS: "/settings/",
  },
  ADMIN_UID: "CI5TPudL1fdonBhpQ7XE5oplX4Z2",
  MIN_CHARS_NAME: 2,
  ERROR_TEXT_USERNAME_IS_TOO_SHORT: "Your name needs to be at least 2 characters long!",
  ERROR_TEXT_PASSWORDS_ARE_NOT_EQUAL: "Please enter the same password twice. Please type it in again!",
  MY_GAMES_CATALOG_NAME: "My Games",
  TEMPLATES: {
    REVIEW_LIST_ELEMENT: "./templates/review-list-element.html",
    LOGIN_POPUP: "./templates/login-popup.html",
    REGISTER_POPUP: "./templates/register-popup.html",
    INTRODUCTION_POPUP: "./templates/introduction-popup.html",
    CATALOG_GAME_ELEMENT: "./templates/catalog-game-element.html",
    CATALOG_LIST_ELEMENT: "./templates/catalog-list-element.html",
    CATALOG_POPUP_ELEMENT: "./templates/catalogPopupElement.html",
    PROFILE_GAME_ELEMENT: "./templates/profile-game-element.html",
    GAMES_LIST_ELEMENT: "./templates/games-list-element.html",
    REVIEW_DETAIL_ELEMENT: "./templates/reviewDetail.html",
    REVIEW_IN_GAMES_VIEW_ELEMENT: "./templates/reviewInGamesViewElement.html",
    REVIEW_FORM_ELEMENT: "./templates/reviewForm.html",
    GAME_CATALOG_SHEET: "./templates/game-catalog-sheet.html",
  },
  LOGIN_POPUP_LOGIN_BUTTON_ELEMENT: "a[name='login-login-button']",
  LOGIN_POPUP_REGISTER_BUTTON_ELEMENT: "a[name='login-register-button']",
  LOGIN_POPUP_ERROR_TEXT_ELEMENT: "#login-error-text",

  REGISTER_POPUP_LOGIN_BUTTON_ELEMENT: "a[name='register-login-button']",
  REGISTER_POPUP_REGISTER_BUTTON_ELEMENT: "a[name='register-register-button']",
  REGISTER_POPUP_ERROR_TEXT_ELEMENT: "#register-error-text",

  FORM_DATA_ELEMENT_LOGIN: "#login-form",
  FORM_DATA_ELEMENT_REGISTER: "#register-form",
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyAjGP4W2AcJvGVJTiYTL8QoUuG00ApHsn0",
    authDomain: "gamehub-c16d6.firebaseapp.com",
    databaseURL: "https://gamehub-c16d6.firebaseio.com",
    projectId: "gamehub-c16d6",
    storageBucket: "gamehub-c16d6.appspot.com",
    messagingSenderId: "565578837406",
    appId: "1:565578837406:web:47688d54f0384acc923a8f",
    measurementId: "G-B809QLG0TM",
  },
  CARD__STYLE_BEGINNING: "background: url(",
  CARD_STYLE_ENDING: ") no-repeat center top; background-size: cover; height: 300px",
  GAME_WAS_ADDED_SUBTITLE: "Success!",
  GAME_WAS_ADDED_TEXT: "Your game has been added to the list!",
  ADD_CATALOG_PROMPT_TEXT: "What should the new catalog be called?",
  ADD_CATALOG_CONFIRMATION_TEXT: "Are you sure you want to call your new catalog ",
  DELETE_CATALOG_CONFIRMATION: "Do you really want to delete this catalog?",
  DELETE_CATALOG_BUTTON_TEXT: "DELETE CATALOG",
  DELETE_CATALOG_BUTTON_CLASS: "col button color-red",
  WARNING_SUBTITLE_ALREADY_CREATED_A_REVIEW: "WARNING!",
  WARNING_TEXT_ALREADY_CREATED_A_REVIEW: "You have already written a review!",
  NOTIFICATION_ICON: "<img style='height:20px; border-radius: 50%;'src='././assets/favicon.ico'>",
  NOTIFICATION_TITLE_WARNING: "WARNING",
  NOTIFICATION_DESCRIPTION_REVIEW_FORM: "Please provide both a title and a description for the review!",
  NOTIFICATION_GAME_FORM_NOT_COMPLETE: "Please provide the name for the game, the genre, the platform, a description, the date of publication and a picture (.jpg / smaller than 4MB)!",
  DIALOG_SIGN_OUT: "Do you really want to log out of your account?",
  NEW_USERNAME_PROMPT_TEXT: "Enter a new username if you want to change your current one!",
  DIALOG_ASK_USER_IF_HE_REALLY_WANTS_TO_ADD_GAME: "Do you really want to add the entered game to the database?",
  DIALOG_TEXT_DELETE_REVIEW: "Do you really want to delete this review?",
  DIALOG_TEXT_DELETE_GAME: "Do you really want to delete this game?",
  GAME_TITLE_STANDARD_TEXT: "Game: ",
  AUTHOR_TEXT_STANDARD_TEXT: "Author: ",
  MAXIMUM_OF_POINTS: " | 5",
  NO_POINTS_TEXT: "0 | 5",
  MAXIMUM_OF_POINTS_VALUE: 5,
  VALUE_HUNDRED: 100,
  GREY_BACKGROUND_STYLE: "background:rgb(100,100,100,0.3)",
  REVIEW_DELETE_BUTTON_CLASS: "col button button-fill color-red",
  REVIEW_DELETE_BUTTON_STYLE: "margin-top: 2em",
  REVIEW_DELETE_BUTTON_TEXT: "DELETE REVIEW",
  GAME_DELETE_BUTTON_CLASS: "col button color-red",
  GAME_DELETE_BUTTON_TEXT: "DELETE GAME",
  REVIEW_WAS_DELETED: "The opened review has just been deleted!",
  AMOUNT_OF_FAVORITE_GAMES_TO_DISPLAY: 5,
  AMOUNT_OF_GAMES_TO_LOAD_PER_REFRESH: 20,
  BADGE_COLORS: {
    GREEN_BADGE: "chip-media bg-color-green",
    RED_BADGE: "chip-media bg-color-red",
    GRAY_BADGE: "chip-media bg-color-gray",
  },
  THEMES: {
    LIGHT_THEME: "color-theme-red",
    DARK_THEME: "color-theme-red theme-dark",
  },
  POPUP_BACKGROUND_THEMES: {
    LIGHT_THEME: "background:rgb(240,240,240)",
    DARK_THEME: "background:black",
  },
  PROFILE_TAB_TITLE_PREFIX: "'s Profile",
  YOUR_USERNAME_TEXT: "your username: '",
  APOSTROPHE_AT_THE_END: "'",
  MAXIMUM_FILE_SIZE: 4096000,
  NOTIFICATION_TIME: 3000,
  IMAGE_TYPE: "image/jpeg",
  EVENTS: {
    CLICK_EVENT: "click",
    TRY_TO_LOGIN: "tryToLogIn",
    CREATE_USER_WITH_EMAIL_AND_PASSWORD: "createUserWithEmailAndPassword",
    RELOAD_CATALOG_TAB: "reloadCatalogTab",
    USER_REVIEWS_CHANGED: "userReviewsChanged",
    GAME_CREATION_PROCESS_IS_DONE: "gameCreationProcessIsDone",
    ADD_AND_DELETE_GAME_FROM_CATALOGS: "addAndDeleteGameFromCatalogs",
    ADD_REVIEW_TO_DATABASE: "addReviewToDatabase",
    ADD_GAME_TO_DATABASE: "addGameToDatabase",
    ADD_NEW_CATALOG_TO_DATABASE: "addNewCatalogToDatabase",
    SAVE_USERNAME_SETTINGS_TO_DATABASE: "saveUsernameSettingsToDatabase",
    SAVE_DARKMODE_SETTINGS_TO_DATABASE: "saveDarkmodeSettingsToDatabase",
    SIGN_OUT_FROM_ACCOUNT: "signOutFromAccount",
    LOAD_FULL_REVIEW: "loadFullReview",
    NOTIFY_DATABASE_TO_SAVE_VOTE: "notifyDatabaseToSaveVote",
    DELETE_REVIEW: "deleteReview",
    SHOW_SINGLE_GAME_PAGE: "showSingleGamePage",
    DELETE_GAME_FROM_MY_CATALOG: "deleteGameFromMyCatalog",
    DELETE_GAME_FROM_REGULAR_CATALOG: "deleteGameFromRegularCatalog",
    DELETE_CATALOG: "deleteCatalog",
    DELETE_GAME_BY_ID: "deleteGameById",
    SHOW_USER_CATALOGS: "showUserCatalogs",
    SWIPE_OUT_DELETE_EVENT: "swipeout:delete",
    TOGGLE_SWITCH_EVENT: "toggle:change",
    SHEET_OPENED: "opened",
    PAGE_INIT: "pageInit",
    PAGE_AFTER_IN: "pageAfterIn",
    POPUP_OPENED: "popupOpened",
    WAIT_FOR_DELETION_OF_GAME_ELEMENT: "waitForDeletionOfGameElement",
    NEW_GAME_WAS_ADDED_TO_DATABASE: "newGameWasAddedToDatabase",
    WAIT_FOR_DELETION_OF_REVIEW_TO_CLOSE_REVIEW: "waitForDeletionOfReviewToCloseReview",
    WAIT_FOR_DELETION_OF_GAME: "waitForDeletionOfGame",
    GO_BACK_AFTER_GAME_WAS_DELETED: "goBackAfterGameWasDeleted",
    WAIT_FOR_SINGLE_GAME_VIEW_CHANGES: "waitForSingleGameViewChanges",
    RELOAD_REVIEW_LIST_IN_GAME_VIEW: "reloadReviewListInGameView",
    CHECK_IF_USER_HAS_ALREADY_REVIEWED_THIS_GAME: "checkIfUserHasAlreadyReviewedThisGame",
    GAME_ELEMENT_WAS_REMOVED: "gameElementWasRemoved",
    WAIT_FOR_DELETION_OF_GAME_FOR_POPUP_AND_SHEET: "waitForDeletionOfGameForPopupAndSheet",
    CLOSE_POPUP_AND_SHEET_AFTER_GAME_WAS_DELETED: "closePopupAndSheetAfterGameWasDeleted",
  },
  ELEMENTS: {
    APP_ELEMENT: "#app",
    SWIPE_HANDLER_INTRODUCTION_POPUP: ".swipe-handler",
    REVIEW_TAB_REVIEW_LIST: "#review-list",
    REVIEW_TAB_REVIEW_ELEMENT_RANKING: "#ranking",
    REVIEW_TAB_REVIEW_ELEMENT_GAME_TITLE: ".item-title",
    REVIEW_TAB_REVIEW_ELEMENT_REVIEW_TITLE: ".item-header",
    DIV_ELEMENT: "div",
    REVIEW_DETAIL_SHEET_ELEMENT_GAME_TITLE: "#gameTitle",
    REVIEW_DETAIL_SHEET_ELEMENT_REVIEW_TITLE: "#reviewTitle",
    REVIEW_DETAIL_SHEET_ELEMENT_DESCRIPTION: "#description",
    REVIEW_DETAIL_SHEET_ELEMENT_RANKING: "#ranking",
    REVIEW_DETAIL_SHEET_ELEMENT_ROLE: "#role",
    REVIEW_DETAIL_SHEET_ELEMENT_AUTHOR: "#author",
    REVIEW_DETAIL_SHEET_ELEMENT_STEPPER: ".stepper",
    STEPPER_PLUS_ELEMENT: ".stepper-button-plus",
    STEPPER_MINUS_ELEMENT: ".stepper-button-minus",
    STEPPER_TEXT_ELEMENT: "#displayed-text",
    REVIEW_LIST_ELEMENT_VOTES_TEXT_ELEMENT: "#votes",
    REVIEW_LIST_ELEMENT_VOTES_BADGE: "#badge",
    REVIEW_DETAIL_PAGE_CONTENT: ".page-content",
    BUTTON_ELEMENT: "button",
    CATALOG_GAME_LIST: "#catalog-games-list",
    CATALOG_NAME: "#catalog-name",
    CATALOG_CREATION_DATE: "#catalog-creation-date",
    CATALOG_GAME_ELEMENT_TITLE: ".item-title",
    CATALOG_GAME_ELEMENT_GENRE: ".item-text",
    CATALOG_GAME_ELEMENT_RELEASE_YEAR: ".item-subtitle",
    CATALOG_VIEW: "#view-catalog",
    ITEM_INNER_OF_GAME_LIST_ELEMENT: ".item-inner",
    CARD_HEADER_TITLE_ELEMENT: ".card-header",
    PLATFORM_ELEMENT: "#platform",
    CARD_CREATED_RATING_ELEMENT: "#rating",
    CARD_RELEASE_YEAR_ELEMENT: "#releaseYear",
    CARD_GENRE_ELEMENT: "#genre",
    CARD_DESCRIPTION_ELEMENT: "#description",
    REVIEW_SECTION_LIST: "#reviewListInGameView",
    CARD_IMAGE_ELEMENT: "#card-element",
    BUTTONS_GAME_SINGLE_VIEW: ".block",
    ADD_TO_CATALOG_BOTTONS: "#addToCatalogButton",
    WRITE_REVIEW_BUTTON: "#writeReviewButton",
    ADD_REVIEW_BUTTON: "#addReviewButton",
    REVIEW_FORM: "#my-form",
    GAME_SINGLE_VIEW_REVIEW_RANKING_ELEMENT: ".item-media",
    GAME_SINGLE_VIEW_REVIEW_TITLE_ELEMENT: ".item-title",
    GAME_SINGLE_VIEW_REVIEW_AUTHOR_ELEMENT: ".item-subtitle",
    GAME_SINGLE_VIEW_REVIEW_BADGE_ELEMENT: "#badge",
    GAME_SINGLE_VIEW_REVIEW_VOTES_ELEMENT: "#votes",
    GAME_TAB_GAME_LIST: "#games-list",
    GAME_TAB_GAME_TITLE: ".item-title",
    GAME_TAB_GAME_RELEASE_YEAR: ".item-subtitle",
    GAME_TAB_GAME_GENRE: ".item-text",
    GAME_VIEW: "#view-games",
    GAME_FORM: "#gameForm",
    GAME_FORM_ADD_GAME_BUTTON: "#add-game-button",
    GAME_FORM_ADD_IMAGE_BUTTON: "#insert-image-button",
    IMAGE_INPUT_ELEMENT: "#fileInput",
    FILE_NAME_ELEMENT: "#imageName",
    FILE_INPUT_ELEMENT: "#fileInput",
    POPUP_CATALOG_LIST_SHEET_ELEMENT: ".sheet-modal",
    POPUP_CATALOG_LIST_ELEMENT: "#user-catalog-list",
    POPUP_CATALOG_DONE_BUTTON: "#addToCatalog",
    POPUP_CATALOG_CHECK_BOX: "#checkBox",
    POPUP_CATALOG_TITLE: ".item-title",
    USERNAME_ELEMENT: "#username",
    EDIT_USERNAME_BUTTON: "#editName",
    ROLE_ELEMENT: "#role",
    PROFILE_TAB_TOP_BAR_ELEMENT: "#username-top-bar-title",
    DARKMODE_TOGGLE: "#darkmodeToggle",
    POSSIBLY_EXISTING_CATALOG_SHEET: ".sheet-modal",
    CATALOG_LIST_ELEMENT: "#catalog-list",
    ADD_CATALOG_BUTTON_ELEMENT: "#add-catalog-button",
    GAME_LIST_SEARCHBAR_ELEMENT: "#gameListSearchbar",
    GAME_TITLE_LIST_ELEMENT_GAME_TAB: "#gameTitleListElement",
    VIEW_PROFILE: "#view-profile",
    GAUGE_ELEMENT: "#avgGauge",
    DATE_JOINED_ELEMENT: "#dateJoined",
    REVIEW_COUNTER_ELEMENT: "#reviewCount",
    FAVORITE_GAME_LIST_ELEMENT: "#list-of-favorite-games",
    FAVORITE_GAME_ELEMENT_RANKING: "#ranking",
    FAVORITE_GAME_GAME_TITLE: "#gameTitle",
    ADD_GAME_BUTTON: "#add-button",
    SETTINGS_BUTTON: "#settingsButton",
    LOGOUT_BUTTON: "#logOutButton",
    CLOSE_FORM_BUTTON: "#closeFormButton",
  },
  RANKING_KEY: "ranking",
  TITLE_KEY: "title",
  NO_REVIEWS_WRITTEN_BY_LOGGED_IN_USER: 0,
  CHECKBOX_CHECKED_ATTRIBUTE_CHECKED_VALUE: "checked",
  CHECKBOX_DISABLED_ATTRIBUTE_VALUE: "disabled",
  MY_GAMES_CATALOG_INDIVIDUAL_ID: "catalog",
  MY_GAMES_CATALOG_ATTRIBUTE: "mygames",
  MY_GAMES_CATALOG_ATTRIBUTE_SELECTOR: ".mygames",
  QUESTION_MARK: "?",
  YOUR_ROLE_TEXT: "your role: ",
  ATTRIBUTES: {
    STYLE: "style",
    CLASS: "class",
  },
  DATABASE_PATHS: {
    REVIEW_DATABASE: "/reviews/",
    GAMES_DATABASE: "/games/",
    USERS_DATABASE: "/users/",
    VOTES_OF_LOGGED_IN_USER: "/votes/",
    REVIEWS_IN_GAME_DATABASE: "/reviews/",
    REVIEWS_IN_USER_DATABASE: "/reviews/",
    VOTES_IN_USER_DATABASE: "/votes/",
    VOTES_IN_REVIEW_DATABASE: "/votes/",
    CATALOGS_OF_LOGGED_IN_USER: "/catalog/",
    GAMES_IN_USER_CATALOG: "/games/",
    PATH_BACKSLASH: "/",
    PATH_OF_USER_IDS_THAT_INCLUDE_THE_GAME: "/inUserList/",
    PATH_USERNAME: "/name/",
    PATH_GAME_IMAGES: "/images/games/",
    UNDERSCORE_BETWEEN_GAMEID_CREATOR_OF_GAME: "_",
    JPG_FILE: ".jpg",
    GAMES_IN_MY_CATALOG: "/catalog/catalog/games/",
    CREATED_GAMES_BY_LOGGED_IN_USER: "/createdGames/",
    NAME_OF_CATALOG: "name",
    GAMES_IN_CATALOG: "games",
    REVIEWS_OF_LOGGED_IN_USER: "/reviews/",
    DARKMODE_SETTING: "/darkmode/",
    USERNAME_SETTING: "/name/",
    DESCRIPTION: "description",
    DAY_OF_CREATION: "dayOfCreation",
    CATALOG: "catalog",
  },
  DATABASE_ONCE_VALUE: "value",
  DATABASE_REMOVED: "child_removed",
  DATABASE_ADDED: "child_added",
  DATABASE_CHANGED: "child_changed",
};

Object.freeze(Config);

export default Config;
