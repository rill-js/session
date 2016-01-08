var URL         = require("url");
var Receptacle  = require("receptacle");
var interceptor = require("side-step");

console.log("got loaded");

/**
 * Adds a session to a rill app and persists it between browser and server.
 *
 * @return {Function}
 */
module.exports = function (opts) {
	opts          = opts || {};
	var NAMESPACE = opts.key || "__rill_session";
	var ID        = NAMESPACE;
	var DATA      = NAMESPACE + "_data";
	var SAVED     = NAMESPACE + "_last_saved";
	var session   = new Receptacle(window[DATA]);
	var lastSaved = session.lastModified.valueOf();
	var curCtx    = null;

	// Sync session with server on any request if the session has been modified.
	interceptor.on("request", function (req) {
		var headers = req.headers;
		if (!isSameOrigin(req.url)) return;
		if (session.lastModified > lastSaved) {
			lastSaved = (new Date).valueOf();
			headers.set(DATA, JSON.stringify(session));
		}
		headers.set(SAVED, String(lastSaved));
		headers.set(ID, session.id);
	});

	// Sync local session if a response says that the session has been modified.
	interceptor.on("response", function (res) {
		var headers = res.headers;
		var data    = headers.get(DATA);
		if (!isSameOrigin(res.url)) return;
		if (!data) return;
		curCtx.session = session = new Receptacle(JSON.parse(data));
		lastSaved      = session.lastModified;
	});

	// Sync session with server before the page closes.
	addEventListener("beforeunload", function () {
		if (session.lastModified > lastSaved) {
			var xhr = new XMLHttpRequest;
			xhr.open("HEAD", curCtx.req.pathname, false);
			xhr.send();
		}
	});

	return function sessionMiddleware (ctx, next) {
		curCtx         = ctx;
		curCtx.session = session;
		return next();
	};
};

function isSameOrigin (url) {
	return URL.parse(URL.resolve(location.origin, url || "")).host === location.host;
}
