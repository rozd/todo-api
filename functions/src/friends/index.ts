import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as algoliasearch from 'algoliasearch'

import {FriendRouter} from "./router";

const ALGOLIA_APP_ID = functions.config().algolia.app_id;
const ALGOLIA_API_KEY = functions.config().algolia.api_key;
const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;

const FRIENDS_INDEX_NAME = 'todo_dev_FRIENDS';

// MARK: Variables

const algolia = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const indexFriends = algolia.initIndex(FRIENDS_INDEX_NAME);

// MARK: Firestore Functions

export const onUserCreated = functions.firestore.document('users/{userId}').onCreate((snapshot, context) => {
    const friend = snapshot.data();
    friend.objectID = context.params.userId;
    return indexFriends.saveObject(friend);
});

export const onUserRemoved = functions.firestore.document('users/{userId}').onCreate((snapshot, context) => {
    const objectID = context.params.userId;
    return indexFriends.deleteObject(objectID);
});

export const onUserUpdated = functions.firestore.document('users/{userId}').onUpdate((change, context) => {
    const friend = change.after.data();
    friend.objectID = context.params.userId;
    return indexFriends.partialUpdateObject(friend);
});

export const router = FriendRouter;
