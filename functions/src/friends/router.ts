import { Router, Request, Response } from 'express';

import * as controller from './controller';

import invite from './fiend-invite-controller'
import {whoopsErrorHandler} from "../errors/Whoops";

const router = Router();

router.route('/:friendId')
    .post(controller.createFriend)
    .put(controller.updateFriend)
    .delete(controller.deleteFriend);

router.route('/:friend/invite/outgoing')
    .post(invite.create)
    .delete(invite.cancel);

router.route('/:friend/invite/incoming')
    .post(invite.accept)
    .delete(invite.reject);

router.route('/search').get(controller.searchFriend);

router.use(whoopsErrorHandler);

export const FriendRouter: Router = router;