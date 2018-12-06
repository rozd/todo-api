import * as algoliasearch from 'algoliasearch'
import * as functions from "firebase-functions";

const ALGOLIA_APP_ID = functions.config().algolia.app_id;
const ALGOLIA_API_KEY = functions.config().algolia.api_key;
const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;

export class AlgoliaController {
    protected algolia: algoliasearch.Client;

    constructor() {
        this.algolia = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
    }
}