"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const functions = require("firebase-functions");
admin.initializeApp();
const express = require("express");
const cors = require("cors");
const parser = require("body-parser");
const woops_1 = require("woops");
const woops_2 = require("woops");
const auth = require("./auth");
const friends = require("./friends");
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});
// Background functions
exports.onUserCreate = friends.onUserCreate;
exports.onUserDelete = friends.onUserDelete;
exports.onUserProfileCreate = friends.onUserProfileCreate;
exports.onUserProfileDelete = friends.onUserProfileDelete;
exports.onUserProfileUpdate = friends.onUserProfileUpdate;
// Server application
const app = express();
// Install Woops error support
app.use(woops_1.default());
// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
// Authentication
app.use(auth.firebase);
// Parsing body
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
// Module routes
app.use('/friends', friends.router);
// Adds error handling with Woops
app.use(woops_2.woopsExceptionHandler);
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map