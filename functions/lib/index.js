"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const functions = require("firebase-functions");
admin.initializeApp();
const express = require("express");
const cors = require("cors");
const parser = require("body-parser");
const Whoops_1 = require("./errors/Whoops");
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
// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
// Authentication
app.use(auth.firebase);
// Errors with Whoops
app.use(Whoops_1.default());
// Parsing body
app.use(parser.json());
app.use(parser.urlencoded());
// Module routes
app.use('/friends', friends.router);
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map