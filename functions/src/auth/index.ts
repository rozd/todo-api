import * as admin from 'firebase-admin'

import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";

admin.initializeApp();

export const firebase = (req: Request, res: Response, next: NextFunction) => {
    console.log('Check if request is authorized with Firebase ID token');

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) && !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.status(403).send('Unauthorized');
        return;
    }

    const accessToken = getAccessTokenFromRequest(req);
    if (!accessToken) {
        res.status(403).send('Unauthorized');
    }

    admin.auth().verifyIdToken(accessToken).then(decodedIdToken => {
        console.log('ID Token correctly decoded', decodedIdToken);
        req.user = decodedIdToken;
        next()
    }).catch(reason => {
        console.error('Error while verifying Firebase ID token:', reason);
        res.status(403).send('Unauthorized');
    });
};

// MARK: Helper methods

function getAccessTokenFromRequest(req: Request): string {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        return req.headers.authorization.split('Bearer ')[1];
    } else if(req.cookies) {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        return req.cookies.__session;
    }
    return null;
}