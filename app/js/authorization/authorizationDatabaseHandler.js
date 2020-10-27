import Config from "../utils/config.js";

var authorizationObject, databaseReference;

class AuthorizationDatabaseHandler {
  constructor(authObject, database) {
    authorizationObject = authObject;
    databaseReference = database;
  }

  tryToLogIn(loginData) {
    return authorizationObject.signInWithEmailAndPassword(loginData[0], loginData[1]);
  }

  createUserWithEmailAndPassword(dataNeededToCreateUserAndClosePopupElements) {
    let emailText = dataNeededToCreateUserAndClosePopupElements[0],
      passwordText = dataNeededToCreateUserAndClosePopupElements[1];
    return authorizationObject.createUserWithEmailAndPassword(emailText, passwordText);
  }

  addProfileToDatabase(name, uId, role) {
    let today = new Date(),
      dayOfCreation = today.getDate() + "." + (today.getMonth() + 1) + "." + today.getFullYear(),
      // When a new profile is created, some data is saved during creation. Among other things, the catalogue "My games" is also created.
      profile = {
        catalog: {
          catalog: {
            name: Config.MY_GAMES_CATALOG_NAME,
            date: dayOfCreation,
          },
        },
        darkmode: true,
        dayOfJoining: dayOfCreation,
        name: name,
        role: role,
      };
    databaseReference.child(Config.DATABASE_PATHS.USERS_DATABASE).child(uId).set(profile);
  }
}

export default AuthorizationDatabaseHandler;
