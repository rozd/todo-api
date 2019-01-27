import { Router, Request, Response } from 'express';

import invite from './friends-invite-controller';
import search from './friends-search-controller';

const router = Router();

router.route('/:friendId')
    .post(search.create)
    .put(search.update)
    .delete(search.delete);

router.route('/:friend/invite/outgoing')
    .post(invite.create)
    .delete(invite.cancel);

router.route('/:friend/invite/incoming')
    .post(invite.accept)
    .delete(invite.reject);

router.route('/search')
    .get(search.search);

export const FriendRouter: Router = router;