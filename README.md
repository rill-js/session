# Rill Session
Isomorphic session middleware that will provided consistent sessions from client to server.

# Installation

#### Npm
```console
npm install @rill/session
```

# Example

```javascript
const app     = require("rill")();
const session = require("@rill/session");

// Creates a session that will expire every second. (Default of 1 day)
app.use(require("@rill/session")({ ttl: 1000 }));

// Use the session.
app.use(function (req, res, next) {
	// Session will be persisted to the server after the request is over.
	req.session; //-> {};
});
```

# Options

**ttl [8.64e+7]** - How long (in miliseconds) should the session stay alive.

**refresh [true]** - If true the session will automatically increment the expiry when accessed.


### Contributions

* Use gulp to run tests.

Please feel free to create a PR!
