import AuthorizationUIHandler from "./authorizationUIHandler.js";
import AuthorizationDatabaseHandler from "./authorizationDatabaseHandler.js";
import Config from "../utils/config.js";
var appCopy, authorizationUIHandler, authorizationDatabaseHandler, authorizationObject, firebaseObject, databaseReference;

function initEvents() {
  authorizationUIHandler.addEventListener(Config.EVENTS.TRY_TO_LOGIN, function(loginData) {
    authorizationDatabaseHandler.tryToLogIn(loginData.data).then(function() {
      authorizationUIHandler.deletePopup(loginData.data[2]);
    }).catch(function(errorMessage) {
      authorizationUIHandler.createErrorMessage(errorMessage.message, loginData.data[3]);
    });
  });
  authorizationUIHandler.addEventListener(Config.EVENTS.CREATE_USER_WITH_EMAIL_AND_PASSWORD, function(dataNeededToCreateUserAndClosePopupElements) {
    authorizationDatabaseHandler.createUserWithEmailAndPassword(dataNeededToCreateUserAndClosePopupElements.data).then(function() {
      authorizationUIHandler.deletePopup(dataNeededToCreateUserAndClosePopupElements.data[5]);
      authorizationUIHandler.deletePopup(dataNeededToCreateUserAndClosePopupElements.data[4]);
      authorizationDatabaseHandler.addProfileToDatabase(dataNeededToCreateUserAndClosePopupElements.data[2], firebaseObject.auth().currentUser.uid,
        dataNeededToCreateUserAndClosePopupElements.data[3]);
    }).catch(function(errorMessage) {
      authorizationUIHandler.createErrorMessage(errorMessage, dataNeededToCreateUserAndClosePopupElements.data[6]);
    });
  });
}

class AuthorizationHandler {

  initGlobalVariables(app, firebase, rootRef) {
    appCopy = app;
    firebaseObject = firebase;
    authorizationObject = firebaseObject.auth();
    databaseReference = rootRef;
  }

  initHandlers() {
    authorizationUIHandler = new AuthorizationUIHandler(appCopy);
    authorizationDatabaseHandler = new AuthorizationDatabaseHandler(authorizationObject, databaseReference);
    initEvents();
  }

  createLoginPopupAndWelcomePopup() {
    // To ensure that the user is not only greeted by a login screen when the application is called up for the first time,
    // an additional popup is created (deliberately above the login screen popup) to introduce the user to the application.
    authorizationUIHandler.createLoginPopupAndWelcomePopup();
  }

  logOutFromUserAccount() {
    authorizationObject.signOut();
  }
}

export default AuthorizationHandler;
