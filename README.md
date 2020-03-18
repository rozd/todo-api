```
// lists
{
	"name": "For dinner",
	"participants": {
		"user1": "owner",
		"user2": "guest"
	},
	"items": {
		"item1": {
			"claimedBy": null,
			"status": "outstanding"
		},
		"item2": {
			"claimedBy": "user1",
			"status": "outstanding|fulfilled|rejected"
		}
	}
}


// items
{
	"title": "Apple",
	"photo": {
		"full": "url",
		"thumb_64": "url",
		"thumb_128": "url"
	}
}

// users
{
	"email": "max.rozdobudko.dev@gmail.com",
	"displayName": "Max",
	"picture": {
	    "url": "a URL"
	    "thumb": {
	        "icon16": "url to 16px icon"
	        "icon32": "",
	        "icon64": "",
	        "icon128": "",
	        "icon256": ""
	    }
	},
	"lists": {
	    "list1": {
	        "name": "For dinner"
	        "role": "owner|guest"
	    },
	    "list2": {
	        
	    }
	},
	"friends": {
		"user1": {
			"displayName": "User 1"
		},
		"user2": {

		}
	},
	"incomingRequests": {
		"user3": {
			"displayName": "User 3"
		}
	},
	"outgoingRequests": {
		"user1": {
			"status": "awaiting|rejected",
			"displayName": "User 2"
		}
	}

}
```

```
POST /friends/:friend/invite/outgoing current user sends invite to :friend

DELETE /freinds/:friend/invite/outgoing current user cancels invite sent to :friend

POST /friends/:friend/invite/incoming current user accepts invite from :friend

DELETE /friends/:friend/invite/incoming current user rejects invite from :friend

```

### Error handling

**Important**: Return promise support is added to the express' Router by hacking its code as described [here](https://medium.com/@the1mills/hacking-express-to-support-returned-promises-in-middleware-9487251ca124). 
The file for override is here `./patches/express/router/layer.js` and here is a postinstall script:
```
node_modules/express/lib/router/layer.js
```