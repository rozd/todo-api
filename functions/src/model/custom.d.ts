import * as admin from "firebase-admin";

declare global {
    namespace Express {
        import DecodedIdToken = admin.auth.DecodedIdToken;

        interface Request {
            user?: DecodedIdToken
        }
    }
}