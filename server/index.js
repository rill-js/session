'use strict'

var Receptacle = require('receptacle')

/**
 * Adds a session to a rill app and persists it between browser and server.
 *
 * @return {Function}
 */
module.exports = function (opts) {
  opts = opts || {}
  var ID = opts.key || 'rill_session'
  var DATA = '__' + ID + '__'
  var cache = {}

  return function sessionMiddleware (ctx, next) {
    var req = ctx.req
    var res = ctx.res
    var token = req.cookies[ID]
    var session = (!token || !cache[token])
      // Client needs a session.
      ? new Receptacle()
      // Load existing session.
      : cache[token]

    // Respond to a session request.
    if (req.get(DATA)) {
      // Ensure session is not cached.
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.set('Pragma', 'no-cache')
      res.set('Expires', '0')
      res.status = 200

      // Handle session load.
      if (req.method === 'GET') {
        res.body = session.toJSON()
        return
      }

      // Handle session save.
      if (req.method === 'POST') {
        cache[token] = new Receptacle(req.body)
        return
      }
    }

    // Set cookie on new sessions.
    if (String(session.id) !== token) {
      res.cookie(ID, session.id, { path: '/', httpOnly: true })
    }

    // Attach session for the request.
    cache[session.id] = ctx.session = session

    // Allow middleware to run.
    return next()
  }
}
