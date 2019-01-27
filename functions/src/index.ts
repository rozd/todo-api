import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
admin.initializeApp();

import * as express from 'express'
import * as cors from 'cors'
import * as parser from 'body-parser'

import woops from 'woops';
import { woopsExceptionHandler } from 'woops';

import * as auth from './auth'
import * as friends from './friends'

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

// Background functions

export const onUserCreate = friends.onUserCreate;
export const onUserDelete = friends.onUserDelete;

export const onUserProfileCreate = friends.onUserProfileCreate;
export const onUserProfileDelete = friends.onUserProfileDelete;
export const onUserProfileUpdate = friends.onUserProfileUpdate;

// Server application

const app = express();

// Install Woops error support
app.use(woops());

// Automatically allow cross-origin requests
app.use(cors({origin: true}));

// Authentication
app.use(auth.firebase);

// Parsing body
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

// Module routes
app.use('/friends', friends.router);

// Adds error handling with Woops
app.use(woopsExceptionHandler);

export const api = functions.https.onRequest(app);