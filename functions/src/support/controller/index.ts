import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

class FirestoreController {
    protected db: admin.firestore.Firestore;

    constructor() {
        this.db = admin.firestore();
    }
}