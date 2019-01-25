import {AlgoliaController} from "../support/controller/AlgoliaController";
import * as algoliasearch from "algoliasearch";
import {Woops} from "woops/lib/Woops";

const FRIENDS_INDEX_NAME = 'todo_dev_FRIENDS';

export class FriendsSearchController extends AlgoliaController {
    protected friends: algoliasearch.Index;

    constructor() {
        super();
        this.friends = this.algolia.initIndex(FRIENDS_INDEX_NAME);
    }

    public create = (req, res): Promise<any> => {
        if (!req.body.email) {
            return Promise.reject(Woops.badRequest("An email is a required param."));
        }
        req.body.objectID = req.params.friendId;
        return this.friends.saveObject(req.body).then(value => {
            res.send(value);
        });
    };

    public search = (req, res): Promise<any> => {
        return this.friends.search({ query: req.params.query }).then(value => {
            res.send(value.hits);
        });
    };

    public update = (req, res): Promise<any> => {
        req.body.objectID = req.params.friendId;
        return this.friends.saveObject(req.body).then(value => {
            res.send(value);
        });
    };

    public delete = (req, res): Promise<any> => {
        return this.friends.deleteObject(req.params.friendId).then(value => {
            res.send(value);
        });
    }
}

export default new FriendsSearchController();