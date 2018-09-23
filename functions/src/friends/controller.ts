import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

import * as algoliasearch from 'algoliasearch'

import { Request, Response } from 'express'
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import { Whoops } from '../errors/Whoops'

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

    const inviter = db.collection('users').doc(req.user.uid);
    const invitee = db.collection('users').doc(req.params.friend);

    const outgoingInvite = inviter.collection('outgoingRequests').doc(req.params.friend);
    const incomingInvite = invitee.collection('incomingRequests').doc(req.user.uid);

    return Promise.resolve(true)
        .then(() => invitee.get())
        .then(snap => {
            if (!snap.exists) {
                throw Whoops.notFound('User not found');
            }
            return true;
        })
        .then(() => outgoingInvite.get())
        .then(snap => {
            if (snap.exists && snap.data().status != 'rejected') {
                throw Whoops.conflict('You already sent invite to this user.');
            }
            return true
        })
        .then(() => {
            const batch = db.batch();
            batch.set(incomingInvite, { status: 'awaiting' });
            batch.set(outgoingInvite, { status: 'awaiting' });
            return batch.commit();
        });
};

export const deleteFriendInvitation = (req: Request, res: Response) => {
    const inviter = db.collection('users').doc(req.user.uid).collection('outgoingRequests').doc(req.params.friend);
    const invitee = db.collection('users').doc(req.params.friend).collection('incomingRequests').doc(req.user.uid);

    inviter.get()
        .then(snap => {
            if (!snap.exists) {
                throw Whoops.notFound('The invitation could not be cancelled as it does not exist.');
            }

            const batch = db.batch();
            batch.delete(inviter);
            batch.delete(invitee);
            return batch.commit();
        }).then(value => {
            res.status(200).send(value);
        }).catch(reason => {
            res.whoops.send(reason);
        });
};

export const acceptFriendInvitation = (req: Request, res: Response) => {
    res.status(200).send("OK");
};

export const rejectFriendInvitation = (req: Request, res: Response) => {
    const invitee = db.collection('users').doc(req.user.uid).collection('incomingRequests').doc(req.params.friend);
    const inviter = db.collection('users').doc(req.params.friend).collection('outgoingRequests').doc(req.user.uid);

    Promise.resolve(true)
        .then(value => invitee.get())
        .then(snap => {
            if (!snap.exists) {
                throw Whoops.notFound('The invitation could not be rejected as it does not exist anymore.');
            }
            return true;
        })
        .then(value => inviter.get())
        .then(snap => {
            if (!snap.exists) {
                throw Whoops.notFound('The invitation could not be rejected as it does not exist anymore on inviter side.');
            }
            return true;
        })
        .then(value => {
            const batch = db.batch();
            batch.delete(invitee);
            batch.set(inviter, { status : 'rejected' });
            return batch.commit();
        }).then(value => {
            res.status(200).send(value);
        }).catch(reason => {
            res.whoops.send(reason);
        });
};