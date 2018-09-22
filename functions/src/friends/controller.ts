import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions';

import * as algoliasearch from 'algoliasearch'

import { Request, Response } from 'express';

const ALGOLIA_APP_ID = functions.config().algolia.app_id;
const ALGOLIA_API_KEY = functions.config().algolia.api_key;
const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;

const FRIENDS_INDEX_NAME = 'todo_dev_FRIENDS';

const db = admin.firestore();

// MARK: Variables

const algolia = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const indexFriends = algolia.initIndex(FRIENDS_INDEX_NAME);

// MARK: Index management

export const createFriend = (req, res) => {
    if (!req.body.email) {
        res.status(400).send("An email is a required param");
    }

    req.body.objectID = req.params.friendId;
    indexFriends.saveObject(req.body).then(value => {
        res.status(200).send(value);
    }).catch(reason => {
        res.status(500).send(reason);
    });
};

export const searchFriend = (req, res) => {
    return res.whoops.badData("something wrong");
    indexFriends.search({query: req.params.query}).then(value => {
        res.send(value.hits);
    }).catch(reason => {
        res.status(500).send("error:" + reason);
    });
};

export const updateFriend = (req, res) => {
    req.body.objectID = req.params.friendId;
    indexFriends.saveObject(req.body).then(value => {
        res.status(200).send(value);
    }).catch(reason => {
        res.status(500).send(reason);
    });
};

export const deleteFriend = (req, res) => {
    indexFriends.deleteObject(req.params.friendId).then(value => {
        res.status(200).send(value);
    }).catch(reason => {
        res.status(500).send(reason);
    });
};

// MARK: Invites

export const createFriendInvitation = (req: Request, res: Response) => {


    const batch = db.batch();

    const invitee = db.collection("users").doc(req.params.friend).collection("incomingRequests").doc(req.user.uid);
    batch.set(invitee, { status: "awaiting" });

    const inviter = db.collection("users").doc(req.user.uid).collection("outgoingRequests").doc(req.params.friend);
    batch.set(inviter, { status: "awaiting" });

    batch.commit().then(value => {
        res.status(200).send(value);
    }).catch(reason => {
        res.status(500).send(reason);
    });
};

export const deleteFriendInvitation = (req, res) => {
    res.status(200).send("OK");
};

export const acceptFriendInvitation = (req, res) => {
    res.status(200).send("OK");
};

export const rejectFriendInvitation = (req, res) => {
    res.status(200).send("OK");
};