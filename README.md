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

// Save a session back to the server.
app.use(({ session })=> {
	// In the server this is a noop.
	return session.save();
});
```

# Options

```js
{
	"key": "rill_session" // Optional key used for the session id cookie.
}
```

# Implementation Details
Rill sessions work in both the client and server however it will not automatically sync the session
in real time back and forth. Instead the session can exist on the server and is persisted to the client
after which the client takes over (if it can).

In order to ensure that a session on the server is up to date with the browser call "session#save" which
will automatically post session data to the server if called in the browser.

---

### Contributions

* Use gulp to run tests.

Please feel free to create a PR!
