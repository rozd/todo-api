import {Request, Response} from "express";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {FirestoreController} from "../support/controller/FirestoreController";
import {Woops} from "woops/lib/Woops";

export class FriendInviteController extends FirestoreController {

    // MARK: Create invite

    public create = (req: Request, res: Response): Promise<any> => {
        const inviterId = req.user.uid;
        const inviteeId = req.params.friend;

        const inviter = this.db.collection('users').doc(inviterId);
        const invitee = this.db.collection('users').doc(inviteeId);

        const inviterFriend = inviter.collection('firends').doc(inviteeId);
        const inviteeFriend = invitee.collection('friends').doc(inviterId);

        const outgoingInvite = inviter.collection('outgoingInvites').doc(inviteeId);
        const incomingInvite = invitee.collection('incomingInvites').doc(inviterId);

        return Promise.all([inviter.get(), invitee.get(), inviterFriend.get(), inviteeFriend.get(), outgoingInvite.get()])
            .then(value => {
                const inviterSnp: DocumentSnapshot = value[0];
                const inviteeSnp: DocumentSnapshot = value[1];
                const inviterFriendSnp: DocumentSnapshot = value[2];
                const inviteeFriendSnp: DocumentSnapshot = value[3];
                const outgoingInviteSnp: DocumentSnapshot = value[4];
                if (!inviteeSnp.exists) {
                    throw Woops.notFound('Invitee user not found');
                }
                if (!inviterSnp.exists) {
                    throw Woops.notFound('Inviter user not found');
                }
                if (inviterFriendSnp.exists && inviteeFriendSnp.exists) {
                    throw Woops.conflict('You are already friends.')
                }
                if (outgoingInviteSnp.exists && outgoingInviteSnp.data().status != 'rejected') {
                    throw Woops.conflict('You already sent invite to this user.');
                }
                return { inviter: inviterSnp, invitee: inviteeSnp };
            }).then(() => {
                const batch = this.db.batch();
                batch.set(incomingInvite, { status: 'awaiting' });
                batch.set(outgoingInvite, { status: 'awaiting' });
                return batch.commit();
            })
            .then(value => {
                res.status(200).send(value);
            });
    };

    // MARK: Cancel invite

    public cancel = (req: Request, res: Response): Promise<any> => {
        const inviterId = req.user.uid;
        const inviteeId = req.params.friend;

        const inviter = this.db.collection('users').doc(inviterId);
        const invitee = this.db.collection('users').doc(inviteeId);

        const outgoingInvite = inviter.collection('outgoingInvites').doc(inviteeId);
        const incomingInvite = invitee.collection('incomingInvites').doc(inviterId);

        return Promise.resolve(outgoingInvite.get())
            .then(snp => {
                if (!snp.exists) {
                    throw Woops.notFound('The invitation could not be cancelled as it does not exist.');
                }
                return snp;
            })
            .then(() => {
                const batch = this.db.batch();
                batch.delete(outgoingInvite);
                batch.delete(incomingInvite);
                return batch.commit();
            })
            .then(value => {
                res.status(200).send(value);
            });
    };

    // MARK: Accept invite

    public accept = (req: Request, res: Response): Promise<any> => {
        const inviterId: string = req.params.friend;
        const inviteeId: string = req.user.uid;

        const inviter = this.db.collection('users').doc(inviterId);
        const invitee = this.db.collection('users').doc(inviteeId);

        const incomingInvite = invitee.collection('incomingInvites').doc(inviterId);
        const outgoingInvite = inviter.collection('outgoingInvites').doc(inviteeId);

        return Promise.all([inviter.get(), invitee.get(), incomingInvite.get(), outgoingInvite.get()])
            .then(value => {
                const inviterSnp: DocumentSnapshot = value[0];
                const inviteeSnp: DocumentSnapshot = value[1];
                const incomingInviteSnp: DocumentSnapshot = value[1];
                const outgoingInviteSnp: DocumentSnapshot = value[2];
                if (!inviterSnp.exists) {
                    throw Woops.notFound('Inviter user not found.');
                }
                if (!inviteeSnp.exists) {
                    throw Woops.notFound('Invitee user not found.');
                }
                if (!incomingInviteSnp.exists || !outgoingInviteSnp.exists) {
                    throw Woops.notFound('The invitation could not be accepted as it does not exist.');
                }
                return { inviter: inviterSnp, invitee: inviteeSnp };
            })
            .then(data => {
                const batch = this.db.batch();
                batch.set(inviter.collection('friends').doc(inviteeId), { displayName: data.invitee.data().displayName });
                batch.set(invitee.collection('friends').doc(inviterId), { displayName: data.inviter.data().displayName });
                batch.delete(incomingInvite);
                batch.delete(outgoingInvite);
                return batch.commit();
            })
            .then(value => {
                res.status(200).send(value);
            });
    };

    // MARK: Reject invite

    public reject = (req: Request, res: Response): Promise<any> => {
        const inviterId: string = req.params.friend;
        const inviteeId: string = req.user.uid;

        const inviter = this.db.collection('users').doc(inviterId);
        const invitee = this.db.collection('users').doc(inviteeId);

        const incomingInvite = invitee.collection('incomingInvites').doc(inviterId);
        const outgoingInvite = inviter.collection('outgoingInvites').doc(inviteeId);

        return Promise.all([incomingInvite.get(), outgoingInvite.get()])
            .then(value => {
                const incomingInviteSnp: DocumentSnapshot = value[0];
                const outgoingInviteSnp: DocumentSnapshot = value[1];
                if (!incomingInviteSnp.exists) {
                    throw Woops.notFound('The invitation could not be rejected as it does not exist anymore.');
                }
                if (!outgoingInviteSnp.exists) {
                    throw Woops.notFound('The invitation could not be rejected as it does not exist anymore on inviter side.');
                }
                return true
            })
            .then(() => {
                const batch = this.db.batch();
                batch.delete(incomingInvite);
                batch.set(outgoingInvite, { status: 'rejected' });
                return batch.commit();
            })
            .then(value => {
                res.status(200).send(value);
            });
    };

    // MARK: Helpers
}

export default new FriendInviteController();