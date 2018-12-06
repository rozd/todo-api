import * as admin from 'firebase-admin'
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";

export class FirestoreController {
    protected db: admin.firestore.Firestore;

    constructor() {
        this.db = admin.firestore();
    }

    public failIfExists = (error: Error) => {
        return function(snap: DocumentSnapshot) {
            if (snap.exists) {
                throw error
            }
            return snap
        }
    };

    public ensureExists = (error: Error) => {
        return function(snap: DocumentSnapshot) {
            if (!snap.exists) {
                throw error
            }
            return snap;
        }
    };

}