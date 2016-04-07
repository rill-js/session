var Receptacle = require('receptacle')
var head = /(<head[^>]*>)([\s\S]*)<\/head>/

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

    cache[session.id] = ctx.session = session

    return next().then(function () {
      // Set cookie on new sessions.
      if (String(session.id) !== token) res.cookie(ID, session.id, { path: '/' })
      if (head.test(res.body)) {
        // Append state to html to avoid an extra round trip in the browser.
        res.body = res.body.replace(head, function (m, head, content) {
          return (
          head +
          "<script id='" + DATA + "'>" +
          'window.' + DATA + ' = ' + JSON.stringify(session) + ';' +
          "document.head.removeChild(document.getElementById('" + DATA + "'));" +
          '</script>' +
          content +
          '</head>'
          )
        })
      }
    })
  }
}
