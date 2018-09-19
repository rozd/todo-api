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

const firestore: admin.firestore.Firestore = admin.firestore();

// MARK: Auth Functions

export const onUserCreate = functions.auth.user().onCreate(user => {
    console.log("onUserCreate", user.uid);
    const doc = firestore.collection('users').doc(user.uid);
    return doc.set({
        email: user.email,
        displayName: user.displayName
    });
});

export const onUserDelete = functions.auth.user().onDelete(user => {
    console.log("onUserDelete", user.uid);
    const doc = firestore.collection('users').doc(user.uid);
    return doc.delete();
});

// MARK: Firestore Functions

export const onUserProfileCreate = functions.firestore.document('users/{userId}').onCreate((snapshot, context) => {
    console.log("onUserProfileCreate", context.params.userId);
    const friend = snapshot.data();
    friend.objectID = context.params.userId;
    return indexFriends.saveObject(friend);
});

export const onUserProfileDelete = functions.firestore.document('users/{userId}').onCreate((snapshot, context) => {
    console.log("onUserProfileDelete", context.params.userId);
    const objectID = context.params.userId;
    return indexFriends.deleteObject(objectID);
});

export const onUserProfileUpdate = functions.firestore.document('users/{userId}').onUpdate((change, context) => {
    console.log("onUserProfileUpdate", context.params.userId);
    const friend = change.after.data();
    friend.objectID = context.params.userId;
    return indexFriends.partialUpdateObject(friend);
});

export const router = FriendRouter;
