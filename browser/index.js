var Receptacle  = require("receptacle");
var interceptor = require("side-step");
var NAMESPACE   = "__rill_session";
var ID          = NAMESPACE + "_id";
var DATA        = NAMESPACE + "_data";
var SAVED       = NAMESPACE + "_last_saved";
var session     = new Receptacle(window[DATA]);
var lastSaved   = session.lastModified;
var baseURL     = null;
var curReq      = null;

/**
 * Adds a session to a rill app and persists it between browser and server.
 *
 * @return {Function}
 */
module.exports = function (options) {
	return function sessionMiddleware (ctx, next) {
		baseURL        = ctx.app.base.pathname || "/";
		curReq         = ctx.req;
		curReq.session = session;
		return next();
	};
};

// Sync session with server on any request if the session has been modified.
interceptor.on("request", function (headers) {
	if (session.lastModified > lastSaved) {
		lastSaved     = new Date;
		headers[DATA] = JSON.stringify(session);
	}
	headers[SAVED] = String(lastSaved.valueOf());
	headers[ID]    = session.id;
});

// Sync local session if a response says that the session has been modified.
interceptor.on("response", function (headers) {
	var data = headers.get(DATA);
	if (!data) return;
	curReq.session = session = new Receptacle(JSON.parse(data));
	lastSaved      = session.lastModified;
});

// Sync session with server before the page closes.
addEventListener("beforeunload", function () {
	if (session.lastModified > lastSaved) {
		var xhr = new XMLHttpRequest;
		xhr.open("HEAD", baseURL, false);
		xhr.send();
	}
});