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

  // Persist current session to disk when the browser exits.
  window.addEventListener('beforeunload', function () {
    if (!activeSession) return
    // Do a request to the server to save the session.
    try {
      var xhr = new window.XMLHttpRequest()
      xhr.open('POST', URL, false)
      xhr.setRequestHeader('content-type', 'application/json; charset=UTF-8')
      xhr.send(JSON.stringify(activeSession))
    } catch (_) {}
  })

  return function sessionMiddleware (ctx, next) {
    return loadSession
      // Add session to request.
      .then(function (session) { activeSession = ctx[opts.name] = session })
      // Run middleware.
      .then(next)
  }

  function getInitialSession () {
    return new Promise(function (resolve, reject) {
      var script = doc.createElement('script')
      script.onload = function () {
        resolve(new Receptacle(window[URL]))
        delete window[URL]
      }
      script.async = true
      script.src = URL
      head.appendChild(script)
      head.removeChild(script)
    })
  }
}
