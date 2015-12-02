# Rill Session
Isomorphic session middleware that will provided consistent sessions from client to server.
Sessions are instances of [Receptacle](https://github.com/DylanPiercey/receptacle), check out the docs for modifying the session.

# Installation

#### Npm
```console
npm install @rill/session
```

# Example

```javascript
const app = require("rill")();

// Set up a session.
app.use(require("@rill/session")());

// Use the session.
app.use(({ session })=> {
	// Sessions are instances of a "Receptacle" cache.
	session.set("a", 1, { ttl: 1000 });
	session.get("a"); // 1
});
```

# Implementation Details
Rill session uses some tricks to ensure that a session is always up to date on both the browser.

* It will automatically inject the current session as a (hidden) global variable when html is served to the client.

* It will listen for ajax calls and attempt to patch the session using existing calls. This allows for xhr requests (or fetch) whilst ensuring that any session changes are in both places.

* When the browser is about to quit it will send a message to the server with the final state for the session.

* All of the above steps are skipped if a session is not marked as modified.

---

### Contributions

* Use gulp to run tests.

Please feel free to create a PR!
