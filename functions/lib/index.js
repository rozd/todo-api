"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const express = require("express");
const parser = require("body-parser");
const friends = require("./friends");
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});
//
const app = express();
app.use(parser.json());
app.use(parser.urlencoded());
app.use('/friends', friends.router);
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map