import * as functions from 'firebase-functions';

import * as express from 'express';
import * as parser from 'body-parser';
import * as friends from './friends'

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

//

const app = express();

app.use(parser.json());
app.use(parser.urlencoded());

app.use('/friends', friends.router);

export const api = functions.https.onRequest(app);