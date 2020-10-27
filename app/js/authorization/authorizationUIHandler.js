import Config from "../utils/config.js";
import {
  Observable,
  Event,
}
from "../utils/Observable.js";
var appCopy, context;

function createWelcomeToGameHubPopup() {
  // Above the login popup, which cannot be closed by the user without being logged in,
  // a popup should be displayed with a small overview of what the GameHub offers.
  // This popup is of course only displayed if the user is not yet logged in. It should
  // serve as a help to be able to enjoy the full scope of the application later.
  appCopy.request.get(Config.TEMPLATES.INTRODUCTION_POPUP, function(data) {
    var registerPopupText = data,
      registerPopup = appCopy.popup.create({
        content: registerPopupText,
        swipeToClose: true,
        swipeHandler: Config.ELEMENTS.SWIPE_HANDLER_INTRODUCTION_POPUP,
      });
    registerPopup.open();
  });
}

function setupLoginEvents(loginPopup) {
  let loginPopupElement = loginPopup.el,
    loginButton = loginPopupElement.querySelector(Config.LOGIN_POPUP_LOGIN_BUTTON_ELEMENT),
    registerButton = loginPopupElement.querySelector(Config.LOGIN_POPUP_REGISTER_BUTTON_ELEMENT),
    errorTextElement = loginPopupElement.querySelector(Config.LOGIN_POPUP_ERROR_TEXT_ELEMENT);
  loginButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    transferLoginData(loginPopup, errorTextElement);

  });
  registerButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    createRegisterPopup(loginPopup);
  });
}

function transferLoginData(loginPopup, errorTextElement) {
  let formData = appCopy.form.convertToData(Config.FORM_DATA_ELEMENT_LOGIN),
    loginData = [];
  loginData.push(formData.email);
  loginData.push(formData.password);
  loginData.push(loginPopup);
  loginData.push(errorTextElement);
  createEvent(Config.EVENTS.TRY_TO_LOGIN, loginData);
}

function createEvent(eventName, data) {
  let event = new Event(eventName, data);
  context.notifyAll(event);
}

function createRegisterPopup(loginPopup) {
  appCopy.request.get(Config.TEMPLATES.REGISTER_POPUP, function(data) {
    var registerPopupText = data,
      registerPopup = appCopy.popup.create({
        content: registerPopupText,
        // Popup can not be closed by user
        closeByBackdropClick: false,
      });
    registerPopup.open();
    setupRegisterEvents(registerPopup, loginPopup);
  });
}

function setupRegisterEvents(registerPopup, loginPopup) {
  let registerPopupElement = registerPopup.el,
    registerButton = registerPopupElement.querySelector(Config.REGISTER_POPUP_REGISTER_BUTTON_ELEMENT),
    backToLoginButton = registerPopupElement.querySelector(Config.REGISTER_POPUP_LOGIN_BUTTON_ELEMENT),
    errorTextElement = registerPopupElement.querySelector(Config.REGISTER_POPUP_ERROR_TEXT_ELEMENT);
  registerButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    transferRegisterData(registerPopup, loginPopup, errorTextElement);
  });
  backToLoginButton.addEventListener(Config.EVENTS.CLICK_EVENT, function() {
    destroyPopup(registerPopup);
  });
}

function transferRegisterData(registerPopup, loginPopup, errorTextElement) {
  let formData = appCopy.form.convertToData(Config.FORM_DATA_ELEMENT_REGISTER),
    emailText = formData.email,
    passwordText = formData.password,
    passwordConfirmationText = formData.passwordConfirmation,
    name = formData.name,
    role = formData.role;
  checkIfEntriesAreCorrectAndCreateUser(passwordText, passwordConfirmationText, emailText, role, registerPopup, loginPopup, errorTextElement, name);
}

function checkIfEntriesAreCorrectAndCreateUser(passwordText, passwordConfirmationText, emailText, role, registerPopup, loginPopup, errorTextElement, name) {
  if (passwordText === passwordConfirmationText) {
    if (name.length >= Config.MIN_CHARS_NAME) {
      createNewUserAndClosePopups(emailText, passwordText, name, role, registerPopup, loginPopup, errorTextElement);
    } else {
      errorTextElement.innerHTML = Config.ERROR_TEXT_USERNAME_IS_TOO_SHORT;
    }
  } else {
    errorTextElement.innerHTML = Config.ERROR_TEXT_PASSWORDS_ARE_NOT_EQUAL;
  }
}

function createNewUserAndClosePopups(emailText, passwordText, name, role, registerPopup, loginPopup, errorTextElement) {
  let dataNeededToCreateUserAndClosePopupElements = [emailText, passwordText, name, role, registerPopup, loginPopup, errorTextElement];
  createEvent(Config.EVENTS.CREATE_USER_WITH_EMAIL_AND_PASSWORD, dataNeededToCreateUserAndClosePopupElements);
}

function destroyPopup(popup) {
  popup.close(true);
  popup.el.remove();
}

class AuthorizationUIHandler extends Observable {
  constructor(app) {
    super();
    appCopy = app;
    context = this;
  }

  createLoginPopupAndWelcomePopup() {
    appCopy.request.get(Config.TEMPLATES.LOGIN_POPUP, function(data) {
      var loginPopupText = data,
        loginPopup = appCopy.popup.create({
          content: loginPopupText,
          // Popup can only be closed if the user is logged in (by registration / login)
          closeByBackdropClick: false,
        });
      loginPopup.open();
      loginPopup.on(Config.EVENTS.POPUP_OPENED, function() {
        createWelcomeToGameHubPopup();
      });
      setupLoginEvents(loginPopup);
    });
  }

  deletePopup(popup) {
    // Popup needs to be deleted after the login was successful
    destroyPopup(popup);
  }

  createErrorMessage(message, errorTextElement) {
    errorTextElement.innerHTML = message;
  }

}

export default AuthorizationUIHandler;
