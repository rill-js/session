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
  var loadSession = getInitialSession()
  var activeSession = null

  // Persist current session to disk when the browser exits.
  window.addEventListener('beforeunload', function () {
    if (activeSession && window.sessionStorage) {
      window.sessionStorage.setItem(DATA, JSON.stringify(activeSession))
    }
  })

  return function sessionMiddleware (ctx, next) {
    return loadSession
      // Add session to request.
      .then(function (session) { activeSession = ctx.session = session })
      // Run middleware.
      .then(next)
  }

  function getInitialSession () {
    return new Promise(function (resolve, reject) {
      // Use last local session if we can.
      if (window.sessionStorage) {
        var localSession = window.sessionStorage.getItem(DATA)
        if (localSession) return resolve(new Receptacle(JSON.parse(localSession)))
      }

      // Do a request to the server asking for the session.
      var xhr = new window.XMLHttpRequest()
      xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState !== 4) return
        if (xhr.status !== 200) return reject(new Error('Could not load initial session.'))
        try {
          resolve(new Receptacle(JSON.parse(xhr.responseText)))
        } catch (err) {
          reject(new Error('Could not load initial session.'))
        }
      })
      xhr.addEventListener('error', reject)
      xhr.open('GET', DATA, true)
      xhr.setRequestHeader(DATA, '1')
      xhr.send()
    })
  }
}
