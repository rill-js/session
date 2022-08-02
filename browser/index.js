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
  var lastSaved = 0

  return function sessionMiddleware (ctx, next) {
    return loadSession
      // Add session to request.
      .then(function () { ctx[opts.name] = activeSession })
      // Run middleware.
      .then(next)
      .then(saveSession)
  }

  function saveSession() {
    if (lastSaved !== (lastSaved = activeSession.lastModified)) {
      var xhr = new window.XMLHttpRequest()
      xhr.open('POST', URL)
      xhr.setRequestHeader('content-type', 'application/json; charset=UTF-8')
      xhr.send(JSON.stringify(activeSession))
    }
  }

  function getInitialSession () {
    return new Promise(function (resolve) {
      var script = doc.createElement('script')
      script.onload = function () {
        resolve(activeSession = new Receptacle(window[URL]))
        lastSaved = activeSession.lastModified
        head.removeChild(script)
        delete window[URL]
      }
      script.src = URL
      head.appendChild(script)
    })
  }
}
