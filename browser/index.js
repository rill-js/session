'use strict'

var Receptacle = require('receptacle')
var doc = document
var head = doc.head

/**
 * Adds a session to a rill app and persists it between browser and server.
 *
 * @return {Function}
 */
module.exports = function (opts) {
  opts = opts || {}
  opts.name = opts.name || 'session'
  opts.browser = !('browser' in opts) || opts.browser
  // Don't try to load session if it isn't setup for the browser.
  if (!opts.browser) return

  var ID = opts.key || 'rill_session'
  var URL = '/__' + encodeURIComponent(ID) + '__'
  var loadSession = getInitialSession()
  var activeSession = null

  return function sessionMiddleware (ctx, next) {
    return loadSession
      // Add session to request.
      .then(function () { ctx[opts.name] = activeSession })
      // Run middleware.
      .then(next)
  }

  function getInitialSession () {
    return new Promise(function (resolve) {
      var script = doc.createElement('script')
      script.onload = function () {
        resolve(activeSession = new Receptacle(window[URL]))
        var lastSaved = activeSession.lastModified
        delete window[URL]

        // Persist current session to disk when the browser exits.
        window.addEventListener('visibilitychange', function () {
          if (
            document.visibilityState === 'hidden' &&
            lastSaved !== (lastSaved = activeSession.lastModified)
          ) {
            navigator.sendBeacon(URL, new Blob(
              [JSON.stringify(activeSession)],
              { type: 'application/json' }
            ))
          }
        })
      }
      script.async = true
      script.src = URL + '?' + Date.now().toString(32)
      head.appendChild(script)
      head.removeChild(script)
    })
  }
}
