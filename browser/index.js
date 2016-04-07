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
  var session = getInitialSession()

  // Save session before page closes.
  window.addEventListener('beforeunload', function () {
    window.localStorage.setItem(DATA, JSON.stringify(session))
  })

  return function sessionMiddleware (ctx, next) {
    ctx.session = session
    return next()
  }

  function getInitialSession () {
    var serverSession = window[DATA]
    var localSession = window.localStorage.getItem(DATA)

    if (!localSession) return new Receptacle(serverSession)
    else localSession = JSON.parse(localSession)

    return new Receptacle(
      localSession.lastModified > serverSession.lastModified
        ? localSession
        : serverSession
    )
  }
}
