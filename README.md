<h1 align="center">
  <!-- Logo -->
  <img src="https://raw.githubusercontent.com/rill-js/rill/master/Rill-Icon.jpg" alt="Rill"/>
  <br/>
  @rill/session
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-brightgreen.svg?style=flat-square" alt="API stability"/>
  </a>
  <!-- Standard -->
  <a href="https://github.com/feross/standard">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square" alt="Standard"/>
  </a>
  <!-- NPM version -->
  <a href="https://npmjs.org/package/@rill/session">
    <img src="https://img.shields.io/npm/v/@rill/session.svg?style=flat-square" alt="NPM version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@rill/session">
    <img src="https://img.shields.io/npm/dm/@rill/session.svg?style=flat-square" alt="Downloads"/>
  </a>
  <!-- Gitter Chat -->
  <a href="https://gitter.im/rill-js/rill">
    <img src="https://img.shields.io/gitter/room/rill-js/rill.svg?style=flat-square" alt="Gitter Chat"/>
  </a>
</h1>

Isomorphic session middleware that will provided consistent sessions from client to server.
Sessions are instances of [Receptacle](https://github.com/DylanPiercey/receptacle), check out the docs for modifying the session.

Session storage on the server side is done by [cacheman](https://github.com/cayasso/cacheman) and you can provide configuration via the `cache` option.

# Installation

```console
npm install @rill/session
```

# Example

```javascript
const app = require('rill')()

// Set up a session. (Defaults to in memory)
app.use(require('@rill/session')())

// Use the session.
app.use(({ session })=> {
	// Sessions are instances of a "Receptacle" cache.
	session.set('a', 1, { ttl: 1000 });
	session.get('a'); // 1
});
```

# Options

```js
{
	"key": "rill_session" // Optional key used for the session id cookie.
  "cache": {// Passed to cacheman on the server side only.
    // Mongo db example. (must have installed cacheman-mongo).
    engine: 'mongo',
    database: 'my-app'
  }
}
```

# Implementation Details
Rill sessions work in both the client and server however only the initial session from the server with the user will be synced using an XHR request.

In the browser sessions will be persisted with session storage and reused on subsequent page loads.

---

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
