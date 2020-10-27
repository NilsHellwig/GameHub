import {
  Observable,
  Event,
}
from "../utils/Observable.js";
import Config from "../utils/config.js";
var firebaseCopy, context, authId, database, storage, openedGameReviewReferences;

function fetchReviewsFromDatabase(reviewIdsObject) {
  let reviews = [],
    reviewIds = Object.keys(reviewIdsObject.val());
  for (let i = 0; i < reviewIds.length; i++) {
    reviews.push(getReview(reviewIds[i], context));
  }
  // The Promise will be returned once all reviews have been fetched.
  return Promise.all(reviews).then(function(reviewData) {
    return [reviewIds, reviewData];
  });
}

function getReview(reviewId) {
  let reviewReference = database.ref(Config.DATABASE_PATHS.REVIEW_DATABASE + reviewId);
  return reviewReference.once(Config.DATABASE_ONCE_VALUE).then(function(review) {
    // We also have to fetch the data for the game, because the game's title should also be displayed.
    return getGameDataById(review.val().game).then(function(game) {
      let reviewWithAssociatedGame = [game.val().title, review.val()];
      // Finally we need to return an array with both the information about the review and the game
      return reviewWithAssociatedGame;
    });
  });
}

function getGameDataById(gameId) {
  let gameReference = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE + gameId);
  return gameReference.once(Config.DATABASE_ONCE_VALUE).then(function(games) {
    return games;
  });
}

function waitingForChangesOfUserReviews(userReference, userReviewIds) {
  // We are waiting for the user to write a new review, which should then be added to the list.
  // The event USER_REVIEWS_CHANGED should only be triggered if the review was added/removed at runtime.
  userReference.on(Config.DATABASE_ADDED, function(review) {
    let isAlreadyInList = false;
    for (let i = 0; i < userReviewIds.length; i++) {
      if (review.key === userReviewIds[i]) {
        isAlreadyInList = true;
      }
    }
    if (!isAlreadyInList) {
      createEventWithoutData(Config.EVENTS.USER_REVIEWS_CHANGED);
      userReviewIds.push(review.key);
    }
  });
  userReference.on(Config.DATABASE_REMOVED, function() {
    createEventWithoutData(Config.EVENTS.USER_REVIEWS_CHANGED);
  });
}

function getUsernameAndRoleOfUserId(userId) {
  let userProfileReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + userId);
  return userProfileReference.once(Config.DATABASE_ONCE_VALUE).then(function(userData) {
    return [userData.val().name, userData.val().role];
  });
}

function checkIfLoggedInUserHasAlreadyVotedForReview(reviewId) {
  let profileReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.VOTES_OF_LOGGED_IN_USER);
  return profileReference.once(Config.DATABASE_ONCE_VALUE).then(function(allVotesFromLoggedInUser) {
    if (allVotesFromLoggedInUser.hasChild(reviewId)) {
      if (allVotesFromLoggedInUser.val()[reviewId] === true) {
        // true means that the user does like the review (upvote)
        return true;
      }
      // false means that the user doesn't like the review (downvote)
      return false;
    }
    // if the user didn't vote yet - undefined will be returned
    return undefined;
  });
}

function deleteReviewById(reviewId) {
  let reviewDatabaseReference = database.ref(Config.DATABASE_PATHS.REVIEW_DATABASE + reviewId);
  return reviewDatabaseReference.once(Config.DATABASE_ONCE_VALUE).then(function(reviewData) {
    let databaseManipulations = [],
      fetchedReviewData = reviewData.val();
    // 1. we need to delete the reference of the review from the game database
    databaseManipulations.push(deleteReviewFromGameDatabaseObject(reviewId, fetchedReviewData.game));
    // 2. we need to delete the review reference from the user profile
    databaseManipulations.push(deleteReviewFromUserProfile(reviewId, fetchedReviewData.writer));
    // 3. we need to delete the references of the votes users gave to this review
    databaseManipulations.push(deleteVotesFromUserProfiles(reviewId, Object.keys(fetchedReviewData.votes)));
    // 4. we need to delete the review object from the database
    databaseManipulations.push(deleteReviewObjectFromDatabase(reviewId));
    // Source for Promise.all: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
    return Promise.all(databaseManipulations);
  });
}

function deleteReviewFromGameDatabaseObject(reviewId, gameId) {
  let gameDatabaseReference = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE + gameId + Config.DATABASE_PATHS.REVIEWS_IN_GAME_DATABASE + reviewId);
  return gameDatabaseReference.remove();
}

function deleteReviewFromUserProfile(reviewId, reviewWriterId) {
  let userProfileReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + reviewWriterId + Config.DATABASE_PATHS.REVIEWS_IN_USER_DATABASE + reviewId);
  return userProfileReference.remove();
}

function deleteVotesFromUserProfiles(reviewId, userIds) {
  let userProfileRemovements = [];
  for (let i = 0; i < userIds.length; i++) {
    let userProfileReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + userIds[i] + Config.DATABASE_PATHS.VOTES_IN_USER_DATABASE + reviewId);
    userProfileRemovements.push(userProfileReference.remove());
  }
  return Promise.all(userProfileRemovements);
}

function deleteReviewObjectFromDatabase(reviewId) {
  let reviewReference = database.ref(Config.DATABASE_PATHS.REVIEW_DATABASE + reviewId);
  return reviewReference.remove();
}

function getDateStringOfToday() {
  let todayDate = new Date(),
    todaySignature = todayDate.getDate() + "." + (todayDate.getMonth() + 1) + "." + todayDate.getFullYear();
  return todaySignature;
}

function createEventWithoutData(eventName) {
  let event = new Event(eventName);
  context.notifyAll(event);
}

function deleteGameFromAllCatalogs(gameId) {
  let userCatalogReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.CATALOGS_OF_LOGGED_IN_USER);
  userCatalogReference.once(Config.DATABASE_ONCE_VALUE).then(function(allCatalogData) {
    allCatalogData.forEach(function(catalogData) {
      // We iterate through all catalogs created by the logged-in user and delete the game from all of them.
      let gamesInCatalogReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.CATALOGS_OF_LOGGED_IN_USER + catalogData.key + Config.DATABASE_PATHS.GAMES_IN_USER_CATALOG);
      // The games in each catalog are fetched to compare with the game that's going to be deleted.
      gamesInCatalogReference.once(Config.DATABASE_ONCE_VALUE).then(function(games) {
        games.forEach(function(gameIdFromCatalog) {
          if (gameId === gameIdFromCatalog.key) {
            // If the game we want to delete is in the catalog, it will be removed.
            let userCatalogReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.CATALOGS_OF_LOGGED_IN_USER + catalogData.key + Config.DATABASE_PATHS.GAMES_IN_USER_CATALOG + gameId + Config.DATABASE_PATHS.PATH_BACKSLASH);
            userCatalogReference.remove();
          }
        });
      });
    });
  });
}

function deleteCatalogReferenceFromGameDatabase(gameId) {
  let gameReference = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE + gameId + Config.DATABASE_PATHS.PATH_OF_USER_IDS_THAT_INCLUDE_THE_GAME + authId);
  gameReference.remove();
}

function deleteGameFromCatalog(catalogId, gameId) {
  let gameReferenceInCatalog = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.CATALOGS_OF_LOGGED_IN_USER + catalogId +
    Config.DATABASE_PATHS.GAMES_IN_USER_CATALOG + gameId);
  gameReferenceInCatalog.remove();
}

function getAllReviewsAndUserNamesOfAuthorsOfTheReviews(reviewData) {
  // Object.keys will send an error if reviewData is undefined which is the case
  // if a game doesn't have any reviews.
  if (reviewData !== undefined) {
    let allReviewIds = Object.keys(reviewData),
      dataForAllReviews = [];
    for (let i = 0; i < allReviewIds.length; i++) {
      dataForAllReviews.push(getReviewByIdAndUsername(allReviewIds[i]));
    }
    return Promise.all(dataForAllReviews).then(function(reviews) {
      return reviews;
    });
  }
  return null;
}

function getReviewByIdAndUsername(reviewId) {
  let reviewReference = database.ref(Config.DATABASE_PATHS.REVIEW_DATABASE + reviewId);
  return reviewReference.once(Config.DATABASE_ONCE_VALUE).then(function(reviewData) {
    let userNameReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + reviewData.val().writer + Config.DATABASE_PATHS.PATH_USERNAME);
    return userNameReference.once(Config.DATABASE_ONCE_VALUE).then(function(usernameOfWriterOfTheReview) {
      //The return contains the reviewId, the data of the review and the username of the author.
      return [reviewId, reviewData.val(), usernameOfWriterOfTheReview.val()];
    });
  });
}

function getImageOfGame(gameId, creatorOfGame) {
  let imageStorageReference = storage.ref().child(Config.DATABASE_PATHS.PATH_GAME_IMAGES + gameId + Config.DATABASE_PATHS.UNDERSCORE_BETWEEN_GAMEID_CREATOR_OF_GAME + creatorOfGame + Config.DATABASE_PATHS.JPG_FILE);
  return imageStorageReference.getDownloadURL().then(function(downloadUrl) {
    return downloadUrl;
  });
}

function deleteOldReferenceListeners(dataNeededToUpdateSingleGameView) {
  /* The user will always open individual views of the games at runtime. Then he has to listen for changes
   of the reviews that belong to a game, so that this list of reviews can be updated. However, these
  listeners have to be deleted at some point (when the single view of a game is no longer open, in one of
  the two tabs (Catalog Tab or Game Tab). Therefore the listeners of a reference to a game are removed as
  soon as this game is no longer displayed in one of the two tabs. */
  if (dataNeededToUpdateSingleGameView[3] === Config.ELEMENTS.CATALOG_VIEW) {
    if (openedGameReviewReferences[0] !== null && openedGameReviewReferences[0] !== openedGameReviewReferences[1]) {
      let oldGameReference = database.ref(openedGameReviewReferences[0]);
      oldGameReference.off();
    }
    openedGameReviewReferences[0] = Config.DATABASE_PATHS.GAMES_DATABASE + dataNeededToUpdateSingleGameView[0] + Config.DATABASE_PATHS.REVIEW_DATABASE;
  }

  if (dataNeededToUpdateSingleGameView[3] === Config.ELEMENTS.GAME_VIEW) {
    if (openedGameReviewReferences[1] !== null && openedGameReviewReferences[0] !== openedGameReviewReferences[1]) {
      let oldGameReference = database.ref(openedGameReviewReferences[1]);
      oldGameReference.off();
    }
    openedGameReviewReferences[1] = Config.DATABASE_PATHS.GAMES_DATABASE + dataNeededToUpdateSingleGameView[0] + Config.DATABASE_PATHS.REVIEW_DATABASE;
  }
}

function checkIfUserHasAlreadyReviewedThisGame(reviews) {
  if (reviews === null) {
    return false;
  }
  for (let i = 0; i < reviews.length; i++) {
    // we just iterate through all the reviews written for a game
    // to see if the selected game has been reviewed yet.
    if (reviews[i][1].writer === authId) {
      return true;
    }
  }
  return false;
}

function addOrDeleteGameFromCatalog(catalogId, isInCatalog, gameId) {
  let catalogReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.CATALOGS_OF_LOGGED_IN_USER + catalogId + Config.DATABASE_PATHS.GAMES_IN_USER_CATALOG);
  if (isInCatalog === true) {
    catalogReference.child(gameId).set(isInCatalog);
  } else {
    catalogReference.child(gameId).remove();
  }
  addReferenceToCatalogToGameDatabaseIfCatalogNameIsMyGames(catalogId, isInCatalog, gameId);
}

function addReferenceToCatalogToGameDatabaseIfCatalogNameIsMyGames(catalogId, isInCatalog, gameId) {
  // In the database object of the game the usernames of the users who have the game in one of their catalogs should be stored.
  let catalogReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.GAMES_IN_MY_CATALOG + gameId);
  catalogReference.once(Config.DATABASE_ONCE_VALUE).then(function(gameInCatalog) {
    if (gameInCatalog.exists()) {
      let gameReference = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE + gameId + Config.DATABASE_PATHS.PATH_OF_USER_IDS_THAT_INCLUDE_THE_GAME + authId);
      gameReference.set(true);
    }
  });
}

function createEvent(eventName, data) {
  let event = new Event(eventName, data);
  context.notifyAll(event);
}

function addGameToDatabase(gameMetaData, imageFile) {
  let databaseReferenceForGames = firebaseCopy.database().ref(Config.DATABASE_PATHS.GAMES_DATABASE),
    gameData = {
      createdBy: authId,
      description: gameMetaData.gameDescription,
      genre: gameMetaData.gameGenre,
      title: gameMetaData.gameName,
      platform: gameMetaData.gamePlatform,
      releaseYear: gameMetaData.releaseYear,
    };
  databaseReferenceForGames.push(gameData).then(function(createdGame) {
    saveReferenceToUserProfile(createdGame.key); // A reference is also stored in the profile so that in certain cases you can easily iterate through all the games a player has created.
    saveImageToDatabase(createdGame.key, imageFile);
  });
}

function saveReferenceToUserProfile(gameId) {
  let profileReference = firebaseCopy.database().ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.CREATED_GAMES_BY_LOGGED_IN_USER);
  profileReference.child(gameId).set(true);
}

function saveImageToDatabase(gameId, imageFile) {
  /* In addition to the Id of the image, the Id of the game is also saved as a file name. This ensures that
  the image can only be deleted from the Firestore Storage if the user Id of the logged-in user matches
  the user Id in the file name.*/
  let storageReference = storage.ref().child(Config.DATABASE_PATHS.PATH_GAME_IMAGES + gameId + Config.DATABASE_PATHS.UNDERSCORE_BETWEEN_GAMEID_CREATOR_OF_GAME + authId + Config.DATABASE_PATHS.JPG_FILE);
  storageReference.put(imageFile).then(function() {
    // Once the data has been persisted in the database, this should be passed on to the MainUIHandler, i.e. to update the list of games.
    createEventWithoutData(Config.EVENTS.GAME_CREATION_PROCESS_IS_DONE);
  });
}

function getAllCatalogsFromLoggedInUser(gameId) {
  let userCatalogReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.CATALOGS_OF_LOGGED_IN_USER),
    allUserCatalogIds = [],
    allUserCatalogsThatIncludeTheGame = [];
  // First we're fetching the created catalogs from the users' database.
  return userCatalogReference.once(Config.DATABASE_ONCE_VALUE).then(function(catalogs) {
    // Array with the Ids of all catalogs created by the user.
    allUserCatalogIds = Object.keys(catalogs.val());
    // Iteration through the catalogs
    for (let i = 0; i < allUserCatalogIds.length; i++) {
      /* In addition to the Id, the title of the catalog is now added to the array, because the
      MainUIHandler displays it.*/
      allUserCatalogIds[i] = [allUserCatalogIds[i], (catalogs.val()[allUserCatalogIds[i]][Config.DATABASE_PATHS.NAME_OF_CATALOG])];
      // Checks if there are games in the catalog at all.
      if (catalogs.val()[allUserCatalogIds[i][0]][Config.DATABASE_PATHS.GAMES_IN_CATALOG] !== undefined) {
        /* If the game where the popup for adding a game is opened is in the catalog, then this
        information is also passed on so that a tickbox hook can be made (game is in catalog) */
        if (catalogs.val()[allUserCatalogIds[i][0]].games[gameId] !== undefined) {
          allUserCatalogsThatIncludeTheGame.push(allUserCatalogIds[i]);
        }
      }
    }
    /* Finally we return all catalogs of the user together with the information in
    which catalog the game already is.*/
    return [allUserCatalogIds, allUserCatalogsThatIncludeTheGame];
  });
}

function deleteGameFromUserCatalog(userId, gameId) {
  let userReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + userId + Config.DATABASE_PATHS.CATALOGS_OF_LOGGED_IN_USER);
  userReference.once(Config.DATABASE_ONCE_VALUE).then(function(catalogs) {
    let catalogIds = Object.keys(catalogs.val()),
      deletions = [];
    for (let i = 0; i < catalogIds.length; i++) {
      let catalogReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + userId + Config.DATABASE_PATHS.CATALOGS_OF_LOGGED_IN_USER + catalogIds[i] + Config.DATABASE_PATHS.GAMES_IN_USER_CATALOG + gameId);
      deletions.push(catalogReference.remove());
    }
    return Promise.all(deletions);
  });
}

function deleteImageOfGame(gameId, creatorId) {
  let imageStorageReference = storage.ref().child(Config.DATABASE_PATHS.PATH_GAME_IMAGES + gameId + Config.DATABASE_PATHS.UNDERSCORE_BETWEEN_GAMEID_CREATOR_OF_GAME + creatorId + Config.DATABASE_PATHS.JPG_FILE);
  return imageStorageReference.delete();
}

function deleteReferenceFromUserProfile(gameId, userIdOfCreator) {
  // There's always a referece in a user profile for every game a user has created
  let userProfileGameReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + userIdOfCreator + Config.DATABASE_PATHS.CREATED_GAMES_BY_LOGGED_IN_USER + gameId);
  return userProfileGameReference.remove();
}

function addReviewAndStandardVoteToProfile(reviewId, gameId) {
  /* We want to save the first vote of the user who created the review in both the
  profile database and the review database. We will also save a reference of the review
  profile database and the database of the game.*/
  let reviewDatabaseProcesses = [],
    profileReviews = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.REVIEWS_OF_LOGGED_IN_USER + reviewId),
    votesInReviewPage = database.ref(Config.DATABASE_PATHS.REVIEW_DATABASE + reviewId + Config.DATABASE_PATHS.VOTES_IN_REVIEW_DATABASE + authId),
    reviewsInGamePage = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE + gameId + Config.DATABASE_PATHS.REVIEWS_IN_GAME_DATABASE + reviewId),
    votesInUserProfile = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.VOTES_OF_LOGGED_IN_USER + reviewId);
  reviewDatabaseProcesses.push(profileReviews.set(true));
  reviewDatabaseProcesses.push(votesInReviewPage.set(true));
  reviewDatabaseProcesses.push(reviewsInGamePage.set(true));
  reviewDatabaseProcesses.push(votesInUserProfile.set(true));

  Promise.all(reviewDatabaseProcesses);
}

class DatabaseHandler extends Observable {

  initDatabase(firebase) {
    /* Important objects are defined as global variables (firebaseCopy, context, database, storage)
    This allows them to be accessed from anywhere. */
    firebaseCopy = firebase;
    // Transfer of important information for initialization such as the apiKey and the databaseURL
    firebase.initializeApp(Config.FIREBASE_CONFIG);
    context = this;
    database = firebase.database();
    storage = firebase.storage();
    openedGameReviewReferences = [null, null];
  }

  initAuthId() {
    authId = firebaseCopy.auth().currentUser.uid;
  }

  getAuthId() {
    return authId;
  }

  getRootReference() {
    return firebaseCopy.database().ref();
  }

  getUserReviews() {
    let reviewsInProfileReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.REVIEWS_OF_LOGGED_IN_USER);
    return reviewsInProfileReference.once(Config.DATABASE_ONCE_VALUE).then(function(reviewIds) {
      if (reviewIds.val() !== null) {
        return fetchReviewsFromDatabase(reviewIds);
      }
      return null;
    });
  }

  waitingForChangesOfUserReviews(userReviewIds) {
    let userReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.REVIEW_DATABASE);
    waitingForChangesOfUserReviews(userReference, userReviewIds);
  }

  getDataForSingleReview(reviewId) {
    let reviewReference = database.ref(Config.DATABASE_PATHS.REVIEW_DATABASE + reviewId + Config.DATABASE_PATHS.PATH_BACKSLASH);
    return reviewReference.once(Config.DATABASE_ONCE_VALUE).then(function(review) {
      let reviewData = [], // all data that is needed to finally display the detailed view will be stored in this array
        reviewDataFromProfileDatabase = review.val(); // first we need the data of the review itself.
      reviewData.push(reviewDataFromProfileDatabase);
      /* we will also return the Id of the review again because the mainUIHandler will need it again in case
      the user wants/is able to delete the review*/
      reviewData.push(reviewId);
      reviewData.push(getGameDataById(reviewDataFromProfileDatabase.game)); // Fetching full title of reviewed game
      reviewData.push(getUsernameAndRoleOfUserId(reviewDataFromProfileDatabase.writer)); // Fetching full name of reviewer
      reviewData.push(checkIfLoggedInUserHasAlreadyVotedForReview(reviewId)); // We also need to know if the logged-in user has already voted and whether they like or dislike the review
      return Promise.all(reviewData).then(function(
        allDataNeededToDisplaySingleViewOfReview) {
        return allDataNeededToDisplaySingleViewOfReview;
      });
    });
  }

  saveUserVoteToReviewAndProfile(voteData) {
    let userVote = voteData[0], // true or false -> user likes the review or not.
      reviewId = voteData[1],
      profileCatalogReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.VOTES_IN_USER_DATABASE),
      reviewReference = database.ref(Config.DATABASE_PATHS.REVIEW_DATABASE + reviewId + Config.DATABASE_PATHS.VOTES_IN_REVIEW_DATABASE);
    // We need to store the review vote in both the database entry of the profile and the review
    if (userVote === true) {
      profileCatalogReference.child(reviewId).set(true);
      reviewReference.child(authId).set(true);
    } else {
      profileCatalogReference.child(reviewId).set(false);
      reviewReference.child(authId).set(false);
    }
  }

  deleteReview(reviewId) {
    deleteReviewById(reviewId);
  }

  waitForDeletionOfReview(reviewId) {
    let deletionReference = database.ref(Config.DATABASE_PATHS.REVIEW_DATABASE + reviewId);
    return deletionReference.once(Config.DATABASE_REMOVED).then(function(reviewData) {
      /* If "dayOfCreation" is deleted, we know that the whole review has been deleted from the database, because
      dayOfCreation is only deleted if a whole review is deleted. We then return true. In app.js we check
      if true was returned, because Config.DATABASE_REMOVED is also triggered if a reference of a review to
      the review is deleted.*/
      if (reviewData.key === Config.DATABASE_PATHS.DAY_OF_CREATION) {
        return true;
      }
      return false;
    });
  }

  getUserCatalogs() {
    let catalogReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.CATALOGS_OF_LOGGED_IN_USER);
    return catalogReference.once(Config.DATABASE_ONCE_VALUE).then(function(catalogData) {
      /* If the user has not added a game to any catalog, we don't need to fetch games from the games
      database. If you would fetch the gamesIds, an error would occur because there are no
      games available.*/
      if (catalogData.val().catalog.games !== undefined) {
        let listOfAllGameIds = Object.keys(catalogData.val().catalog.games),
          games = [];
        for (let i = 0; i < listOfAllGameIds.length; i++) {
          games.push(getGameDataById(listOfAllGameIds[i]));
        }
        return Promise.all(games).then(function(gameData) {
          return [catalogData.val(), gameData]; // To display the catalog view you also need information about the individual games. Therefore, in addition to the information about the catalogs of a user, the data of all games is also fetched for the gameIds.
        });
      }
      return [catalogData.val(), null];
    });
  }

  addCatalogToUserProfile(catalogName) {
    // Saving the entered name and the date of creation in the database
    let catalogData = {
        name: catalogName.data,
        date: getDateStringOfToday(),
      },
      userCatalogReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.CATALOGS_OF_LOGGED_IN_USER);
    userCatalogReference.push(catalogData);
  }

  deleteCatalog(catalogId) {
    let catalogReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.CATALOGS_OF_LOGGED_IN_USER + catalogId);
    return catalogReference.remove();
  }

  deleteGameFromMyCatalog(deletedGameData) {
    let gameId = deletedGameData[0];
    /* If a game gets deleted in the "My Games" catalog, the game will also be deleted in
    all other catalogs. We also need to delete the reference from the game database. Each game has a reference
    to all users (userId) that have the game in any of their catalogs. That's because if a game gets deleted by its creator we also
    need to delete it from all the catalogs where the game is included. We will then just iterate through all users that have a
    reference in the game database, which is much more efficient. */
    deleteGameFromAllCatalogs(gameId);
    deleteCatalogReferenceFromGameDatabase(gameId);
  }

  deleteGameFromRegularCatalog(deletedGameData) {
    // we need both the gameId and the catalogId to delete the game from a specific catalog
    let gameId = deletedGameData[0],
      catalogId = deletedGameData[1];
    deleteGameFromCatalog(catalogId, gameId);
  }

  waitForGamesInCatalogChanges() {
    let catalogReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId);
    catalogReference.on(Config.DATABASE_CHANGED, function(changedData) {
      if (changedData.key === Config.DATABASE_PATHS.CATALOG) {
        // a new listener will be set to avoid asychronities
        catalogReference.off();
        createEventWithoutData(Config.EVENTS.RELOAD_CATALOG_TAB);
      }
    });
  }

  getDataNeededToDisplaySinglePageOfGame(transferedData) {
    let gameId = transferedData[1];
    return getGameDataById(gameId).then(function(gameData) {
      let otherDataNeededToDisplayGameView = [];
      otherDataNeededToDisplayGameView.push(getAllReviewsAndUserNamesOfAuthorsOfTheReviews(gameData.val().reviews));
      otherDataNeededToDisplayGameView.push(getImageOfGame(gameId, gameData.val().createdBy));
      return Promise.all(otherDataNeededToDisplayGameView).then(function(
        fetchedDataNeededToDisplayGameView) {
        fetchedDataNeededToDisplayGameView.push(gameData.val());
        fetchedDataNeededToDisplayGameView.push(gameId);
        return fetchedDataNeededToDisplayGameView;
      });
    });
  }

  waitForSingleGameViewChanges(dataNeededToUpdateSingleGameView) {
    let reviewList = [],
      gameReference = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE + dataNeededToUpdateSingleGameView[0] + Config.DATABASE_PATHS.REVIEW_DATABASE);
    deleteOldReferenceListeners(dataNeededToUpdateSingleGameView);
    if (dataNeededToUpdateSingleGameView[1] !== null) {
      for (let i = 0; i < dataNeededToUpdateSingleGameView[1].length; i++) {
        reviewList.push(dataNeededToUpdateSingleGameView[1][i][0]);
      }
    }
    gameReference.on(Config.DATABASE_ADDED, function(review) {
      let isAlreadyInList = false;
      for (let i = 0; i < reviewList.length; i++) {
        if (reviewList[i] === review.key) {
          isAlreadyInList = true;
        }
      }
      if (!isAlreadyInList) {
        reviewList.push(review.key);
        let dataNeededToReloadReviewSection = [dataNeededToUpdateSingleGameView[0], dataNeededToUpdateSingleGameView[2]];
        createEvent(Config.EVENTS.RELOAD_REVIEW_LIST_IN_GAME_VIEW, dataNeededToReloadReviewSection);
      }
    });
    gameReference.on(Config.DATABASE_REMOVED, function() {
      let dataNeededToReloadReviewSection = [dataNeededToUpdateSingleGameView[0], dataNeededToUpdateSingleGameView[2]];
      createEvent(Config.EVENTS.RELOAD_REVIEW_LIST_IN_GAME_VIEW, dataNeededToReloadReviewSection);
    });
  }

  getDataNeededToReloadReviewSection(gameId) {
    return getGameDataById(gameId).then(function(gameData) {
      if (gameData.val().reviews !== undefined) {
        return getAllReviewsAndUserNamesOfAuthorsOfTheReviews(gameData.val().reviews);
      }
      return null;
    });
  }

  checkIfUserHasAlreadyReviewedThisGameById(gameId) {
    return getGameDataById(gameId).then(function(gameData) {
      if (gameData.val().reviews === undefined) {
        return false;
      }
      return getAllReviewsAndUserNamesOfAuthorsOfTheReviews(gameData.val().reviews).then(function(reviewData) {
        return checkIfUserHasAlreadyReviewedThisGame(reviewData);
      });
    });
  }

  addAndDeleteGameFromCatalogs(catalogDataAboutAddAndDeleteGameFromCatalogs) {
    let catalogData = catalogDataAboutAddAndDeleteGameFromCatalogs.data[0],
      gameId = catalogDataAboutAddAndDeleteGameFromCatalogs.data[1];
    for (let i = 0; i < catalogData.length; i++) {
      addOrDeleteGameFromCatalog(catalogData[i][0], catalogData[i][1], gameId);
    }
  }

  getGamesForGameBrowser() {
    let gameReference = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE);
    /* The id of the last game that was fetched will always be saved as a global variable.
    The procedure differs depending on whether games have already been fetched or if more are to be loaded.
    This has to do with the way firebase allows us to only fetch portions of a huge amount of data.*/
    return gameReference.once(Config.DATABASE_ONCE_VALUE).then(function(gameData) {
      return gameData.val();
    });
  }

  waitForDeletionOfGame(gameId, view) {
      let deletionReference = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE + gameId);
      deletionReference.on(Config.DATABASE_REMOVED, function(deletedChild) {
        /* If the game's description is deleted, we know that the whole game has been deleted from the database.
        We then return true. In app.js we check if true was returned, because Config.DATABASE_REMOVED is also triggered
        if a reference of a review to the game is deleted. */
        if (deletedChild.key === Config.DATABASE_PATHS.DESCRIPTION) {
          createEvent(Config.EVENTS.GO_BACK_AFTER_GAME_WAS_DELETED, view);
        }
      });
    }
    /*Before the game is deleted from the game database, the reviews must be deleted from the review database.
      When deleting a game, the method deleteReviewById is also used, which is otherwise used to delete only a
      single review and not all the reviews belonging to a game. The deleteReviewById also accesses the game
      database to delete the reference to the review. Therefore you should not delete the game from the game
      database right at the beginning, because then there will be no more "/reviews/" directory in the game
      database. If a game is deleted, the listener who listens to changes in the review section under the
      card in the individual view of a game should be removed before the reviews are deleted to avoid
      exceptions due to asychronities that arise. So we first delete the element description (see
      deleteGameById), which this listener also listens to. This will prevent bugs and asynchronities. */
  waitForDeletionOfGameElement(gameId) {
    let deletionReference = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE + gameId);
    deletionReference.on(Config.DATABASE_REMOVED, function(deletedChild) {
      if (deletedChild.key === Config.DATABASE_PATHS.DESCRIPTION) {
        createEvent(Config.EVENTS.GAME_ELEMENT_WAS_REMOVED, gameId);
        // Remove the listener for the Review Section (might exist because game is opened)
        let reviewListenerReference = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE + gameId + Config.DATABASE_PATHS.REVIEWS_IN_GAME_DATABASE);
        reviewListenerReference.off();
      }
    });
  }

  waitForAdditionOfNewGame(gameIds) {
    let additionReference = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE),
      recentGameIds = gameIds;
    additionReference.on(Config.DATABASE_ADDED, function(newGame) {
      let gameAlreadyExists = false;
      for (let i = 0; i < recentGameIds.length; i++) {
        if (recentGameIds[i] === newGame.key) {
          gameAlreadyExists = true;
        }
      }
      if (gameAlreadyExists === false) {
        recentGameIds.push(newGame.key);
        createEvent(Config.EVENTS.NEW_GAME_WAS_ADDED_TO_DATABASE, newGame);
      }
    });
  }

  addGameToDatabase(gameData) {
    addGameToDatabase(gameData[1], gameData[0]); // gameData[1] is metadata and gameData[0] is the image file
  }

  getCatalogDataFromDatabase(gameId) {
    return getAllCatalogsFromLoggedInUser(gameId);
  }

  deleteGameById(gameId) {
    let gameDatabaseReference = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE + gameId);
    gameDatabaseReference.once(Config.DATABASE_ONCE_VALUE).then(function(gameData) {
      let gameObject = gameData.val(),
        deletions = [];
      /* The game is removed from the database based on its Id. After that, the game must be
      removed from all user catalogs. The IDs of the users who have
      the game in one of their lists are deliberately stored in the game's database object for this purpose.
      This way you only have to iterate through these users and not all of them.
      First we need to check if the game is included in any userLists.*/
      deletions.push(gameDatabaseReference.child(Config.DATABASE_PATHS.DESCRIPTION).remove());
      deletions.push(deleteImageOfGame(gameId, gameObject.createdBy));
      if (gameObject.inUserList !== undefined) {
        let userIdsThatHaveTheGameInACatalog = Object.keys(gameObject.inUserList);
        for (let i = 0; i < userIdsThatHaveTheGameInACatalog.length; i++) {
          deletions.push(deleteGameFromUserCatalog(userIdsThatHaveTheGameInACatalog[i], gameId));
        }
      }
      /* The reviews of a game that should be deleted must also be deleted. The already existing
      function "deleteReviewById" is used for this.*/
      if (gameObject.reviews !== undefined) {
        let reviewIdsOfTheGame = Object.keys(gameObject.reviews);
        for (let i = 0; i < reviewIdsOfTheGame.length; i++) {
          deletions.push(deleteReviewById(reviewIdsOfTheGame[i]));
        }
      }
      /* Finally, the reference in the user's database gets deleted (from the
      list of games created by the user) */
      deletions.push(deleteReferenceFromUserProfile(gameId, gameObject.createdBy));
      Promise.all(deletions).then(function() {
        // At the end the object of the game is deleted from the database.
        gameDatabaseReference.remove();
      });
    });
  }

  waitForDeletionOfGameForPopupAndSheet(data) {
    let deletionReference = database.ref(Config.DATABASE_PATHS.GAMES_DATABASE + data[0]);
    deletionReference.on(Config.DATABASE_REMOVED, function(deletedChild) {
      if (deletedChild.key === Config.DATABASE_PATHS.DESCRIPTION) {
        createEvent(Config.EVENTS.CLOSE_POPUP_AND_SHEET_AFTER_GAME_WAS_DELETED, data);
      }
    });
  }

  addReviewToDatabase(reviewData) {
    let reviewReference = database.ref(Config.DATABASE_PATHS.REVIEW_DATABASE),
      reviewDataObject = {
        dayOfCreation: getDateStringOfToday(),
        game: reviewData[3],
        ranking: reviewData[1],
        text: reviewData[2],
        title: reviewData[0],
        votes: {
          // The user who created the review will always put a positive vote on their own review. This feature was inspired by Reddit's upvote system.
          [authId]: true,
        },
        writer: authId,
      };
    reviewReference.push(reviewDataObject).then(function(createdReview) {
      let reviewId = createdReview.key;
      addReviewAndStandardVoteToProfile(reviewId, reviewData[3]);
    });
  }

  getUserProfile() {
    // Returns the data of the user profile of the logged in user.
    let userReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId);
    return userReference.once(Config.DATABASE_ONCE_VALUE).then(function(user) {
      return user.val();
    });
  }

  getDataForSettingsView() {
    /* The settings view enables switching between light and dark mode.
    In addition, the user name that is displayed for other users can be changed here.
    The user can also check their role.
    Therefore, the settings already defined must first be loaded. */
    let profileReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId);
    return profileReference.once(Config.DATABASE_ONCE_VALUE).then(function(profileData) {
      let profileDataNeededToDisplaySettings = [],
        darkmodeSetting = profileData.val().darkmode,
        username = profileData.val().name,
        role = profileData.val().role;
      profileDataNeededToDisplaySettings.push(darkmodeSetting);
      profileDataNeededToDisplaySettings.push(username);
      profileDataNeededToDisplaySettings.push(role);
      return profileDataNeededToDisplaySettings;
    });
  }

  saveDarkmodeSettingsToDatabase(darkmodeSettings) {
    let darkmodeSettingsDatabaseReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId);
    darkmodeSettingsDatabaseReference.child(Config.DATABASE_PATHS.DARKMODE_SETTING).set(darkmodeSettings);
  }

  saveUsernameSettingsToDatabase(newUsername) {
    let usernameDatabaseReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId);
    usernameDatabaseReference.child(Config.DATABASE_PATHS.USERNAME_SETTING).set(newUsername);
  }

  getDarkmodeSettingsFromDatabase() {
    let darkmodeSettingsReference = database.ref(Config.DATABASE_PATHS.USERS_DATABASE + authId + Config.DATABASE_PATHS.DARKMODE_SETTING);
    return darkmodeSettingsReference.once(Config.DATABASE_ONCE_VALUE).then(function(darkmodeSettings) {
      return darkmodeSettings.val();
    });
  }

}

export default DatabaseHandler;
