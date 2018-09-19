import * as functions from 'firebase-functions';

import * as express from 'express';
import * as cors from 'cors'
import * as parser from 'body-parser';

import * as auth from './auth';

import * as friends from './friends'

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

//

const app = express();

// Automatically allow cross-origin requests
app.use(cors({origin: true}));

// Authentication
app.use(auth.firebase);

// Parsing body
app.use(parser.json());
app.use(parser.urlencoded());

// Module routes
app.use('/friends', friends.router);

export const api = functions.https.onRequest(app);