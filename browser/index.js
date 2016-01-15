var URL         = require("url");
var Receptacle  = require("receptacle");

/**
 * Adds a session to a rill app and persists it between browser and server.
 *
 * @return {Function}
 */
module.exports = function (opts) {
	opts        = opts || {};
	var ID      = opts.key || "rill_session";
	var DATA    = "__" + ID + "__";
	var session = getInitialSession();

	session.save = function save () {
		var xhr = new XMLHttpRequest;
		return new Promise(function (accept, reject) {
			xhr.addEventListener("readystatechange", function () {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) accept();
					else reject(new Error("Unable to sync @rill/session."));
				}
			});
			xhr.addEventListener("error", reject);
			xhr.open("POST", location.pathname + "?" + DATA + "=" + session.id);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(JSON.stringify(session));
		});

	};

	// Save session before page closes.
	addEventListener("beforeunload", function () {
		localStorage.setItem(DATA, JSON.stringify(session));
	});

	return function sessionMiddleware (ctx, next) {
		ctx.session = session;
		return next();
	};

	function getInitialSession () {
		var serverSession = window[DATA];
		var localSession = localStorage.getItem(DATA);

		if (!localSession) return new Receptacle(serverSession);
		else localSession = JSON.parse(localSession);

		return new Receptacle(
			localSession.lastModified > serverSession.lastModified
				? localSession
				: serverSession
		);
	}
};
