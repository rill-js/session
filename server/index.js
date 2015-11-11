var CONF  = require("../conf");
var KEY   = CONF.KEY;
var DATA  = CONF.DATA;

// Utils
var getUID = require("get-uid");

// In memory storage for all sessions.
var cache = {};

/**
 * Adds a session to a rill app and persists it between browser and server.
 *
 * @param {Object} options - options for the session.
 * @param {Number} options.ttl - the max age for the session in ms.
 * @param {Boolean} options.refresh - If the session should automatically reset it's timer when accessed.
 * @return {Function}
 */
module.exports = function (options) {
	if (null == options) options = {};
	if (null == options.ttl) options.ttl = 8.64e7;
	if (null == options.refresh) options.refresh = true;

	return function sessionMiddleware (ctx, next) {
		var req      = ctx.req;
		var res      = ctx.res;
		var newToken = false;
		var token    = req.cookies[KEY];
		var action   = req.get(KEY);

		if (!token || !cache[token]) {
			newToken     = true;
			token        = String(getUID())
			cache[token] = {};
		}

		switch (action) {
			case "load":
				next       = noop;
				res.status = 200;
				res.set(DATA, JSON.stringify(cache[token]));
				break;
			case "save":
				next         = noop;
				res.status   = 200;
				cache[token] = JSON.parse(req.get(DATA));
				break;
		}

		req.sessionId = token;
		req.session   = cache[token];

		return next().then(function () {
			var opts = { path: ctx.app.base.pathname || "/" };

			if (newToken || options.refresh) {
				if (options.ttl) {
					opts.expires = new Date(+new Date + options.ttl);
				}

				res.cookie(KEY, token, opts);
			}
			
			cache[token] = req.session;
		});
	};
};

function noop () { return Promise.resolve() }