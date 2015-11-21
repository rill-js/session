var Receptacle = require("receptacle");
var NAMESPACE  = "__rill_session";
var ID         = NAMESPACE + "_id";
var DATA       = NAMESPACE + "_data";
var SAVED      = NAMESPACE + "_last_saved";
var head       = /(<head[^>]*>)(.*?)<\/head>/;

// In memory storage for all sessions.
var cache = {};

/**
 * Adds a session to a rill app and persists it between browser and server.
 *
 * @return {Function}
 */
module.exports = function (options) {
	return function sessionMiddleware (ctx, next) {
		var req       = ctx.req;
		var res       = ctx.res;
		var token     = req.cookies[ID] || req.get(ID);
		var updated   = req.get(DATA);
		var lastSaved = req.get(SAVED);
		var session   = cache[token];
		var baseURL   = ctx.app.base.pathname || "/";

		if (updated) {
			// Session save from client.
			session = new Receptacle(JSON.parse(updated));
		} else if (!token || !session) {
			// Client needs a session.
			session = new Receptacle;
		} else {
			// Load existing session.
			session = cache[token];
		}

		cache[session.id] = req.session = session;

		return next().then(function () {
			// Set cookie on new sessions.
			if (String(session.id) !== token) res.cookie(ID, session.id, { path: baseURL });

			if (typeof res.body === "string") {
				// Append state to html to avoid an extra round trip in the browser.
				res.body = res.body.replace(head, function (m, head, content) {
					return head + "<script>window." + DATA + " = " + JSON.stringify(session) + ";</script>" + "</head>";
				});
			} else if (Number(lastSaved) < session.lastModified) {
				// If the session has been updated via ajax then we will send the updated session.
				res.set(DATA, JSON.stringify(session));
			}

		});
	};
};