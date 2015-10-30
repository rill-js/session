var CONF    = require("../conf");
var KEY     = CONF.KEY;
var DATA    = CONF.DATA;
var baseURL = null;

/**
 * Adds a session to a rill app and persists it between browser and server.
 *
 * @param {Object} options - options for the session.
 * @param {Number} options.ttl - the max age for the session in ms.
 * @param {Boolean} options.refresh - If the session should automatically reset it's timer when accessed.
 * @return {Function}
 */
module.exports = function  (options) {
	if (null == options) options = {};
	if (null == options.ttl) options.ttl = 8.64e7;
	if (null == options.refresh) options.refresh = true;

	return function sessionMiddleware (req, res, next) {
		var ctx   = this;
		var token = ctx.cookies.get(KEY);
		baseURL   = ctx.app.base.pathname || "/";

		return loadSession().then(function (session) {
			ctx.session = session;

			if (options.refresh && options.ttl) {
				ctx.cookies.set(KEY, token, {
					path: baseURL,
					expires: new Date(+new Date + options.ttl)
				});
			}

			return next().then(saveSession.bind(ctx));
		});
	};
};

function loadSession () {
	return new Promise(function (accept, reject) {
		var xhr = new XMLHttpRequest;
		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) return;
			if (xhr.status !== 200) return reject(new Error("Could not load session."));
			accept(JSON.parse(xhr.getResponseHeader(DATA)));
		};
		xhr.onerror = reject;
		xhr.open("HEAD", baseURL, true);
		xhr.setRequestHeader(KEY, "load");
		xhr.send();
	});
}

function saveSession () {
	var session = this.session;

	return new Promise(function (accept, reject) {
		var xhr = new XMLHttpRequest;
		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) return;
			if (xhr.status !== 200) return reject(new Error("Could not save session."));
			accept();
		};
		xhr.onerror = reject;
		xhr.open("HEAD", baseURL, true);
		xhr.setRequestHeader(KEY, "save");
		xhr.setRequestHeader(DATA, JSON.stringify(session));
		xhr.send();
	});
}

