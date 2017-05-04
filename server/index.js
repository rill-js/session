'use strict'

var Receptacle = require('receptacle')
var Cache = require('cacheman')

/**
 * Adds a session to a rill app and persists it between browser and server.
 *
 * @return {Function}
 */
module.exports = function (opts) {
  opts = opts || {}
  opts.cache = opts.cache || {}
  opts.cache.ttl = opts.cache.ttl || Number.MAX_VALUE

  var ID = opts.key || 'rill_session'
  var DATA = '__' + ID + '__'
  var cache = new Cache(ID, opts.cache)

  return function sessionMiddleware (ctx, next) {
    var req = ctx.req
    var res = ctx.res
    var token = req.cookies[ID]
    var isTransfer = req.get(DATA)

    // Handle session get/save.
    if (isTransfer) {
      switch (req.method) {
        case 'GET':
          return cache.get(token).then(function (data) {
            // Ensure session is not cached.
            res.set('Content-Type', 'application/json')
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
            res.set('Pragma', 'no-cache')
            res.set('Expires', '0')
            res.status = data ? 200 : 204
            res.body = data
          })
        case 'POST':
          return cache.set(String(req.body.id), JSON.stringify(req.body), '100y').then(function () {
            res.status = 200
            res.body = 'ok'
          })
        default: return
      }
    }

    // Load session for middleware to use.
    var load = !token
      // Client needs a session.
      ? Promise.resolve(new Receptacle())
      // Load existing session.
      : cache.get(token).then(function (data) {
        try {
          data = JSON.parse(data)
        } catch (err) {
          data = undefined
        }

        if (!data) return new Receptacle()
        return new Receptacle(data)
      })

    return load.then(function (session) {
      // Track the original modified time for the session.
      var initialModified = session.lastModified

      // Attach session to the context.
      ctx.session = session

      // Run middleware then save updated session.
      return next().then(saveSession, saveSession)

      // Utility to save the session and forward errors.
      function saveSession (err) {
        if (String(session.id) !== token) {
          // Set cookie on new sessions.
          res.cookie(ID, session.id, { path: '/', httpOnly: true, secure: req.secure })
        } else if (session.lastModified === initialModified) {
          // Skip saving if we have not changed the session.
          return rethrow(err)
        }

        // Persist session.
        return cache.set(String(session.id), JSON.stringify(session), '100y').then(rethrow)

        // If an error is provided it will throw it again.
        function rethrow () { if (err) throw err }
      }
    })
  }
}
