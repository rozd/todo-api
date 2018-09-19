import { Router, Request, Response } from 'express';

import * as controller from './controller';

const router = Router();

router.route('/:friendId')
    .post(controller.createFriend)
    .put(controller.updateFriend)
    .delete(controller.deleteFriend);

router.route('/search').get(controller.searchFriend);

export const FriendRouter: Router = router;