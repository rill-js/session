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
    var token = req.cookies[ID] || req.get(ID)

    var session = (!token || !cache[token])
      // Client needs a session.
      ? new Receptacle()
      // Load existing session.
      : cache[token]

    // Respond to a session load request.
    if (req.get(DATA)) {
      res.status = 200
      res.body = session.toJSON()
      return
    }

    // Set cookie on new sessions.
    if (String(session.id) !== token) {
      res.cookie(ID, session.id, { path: '/' })
    }

    // Attach session for the request.
    cache[session.id] = ctx.session = session

    // Allow middleware to run.
    return next()
  }
}
