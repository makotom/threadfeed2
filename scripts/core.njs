// Copyright (C) 2010-2014 Makoto Mizukami

(function () {
	"use strict";

	var feedTypes = {
		"rss1" : "application/rss+xml",
		"rss2" : "application/rss+xml",
		"atom1" : "application/atom+xml"
	},

	bbsmenu = "",

	iconvSJ2U8 = require("iconv").Iconv("SHIFT_JIS", "UTF-8//IGNORE"),

	loadBBSMenu = function () {
		require("http").get("http://menu.2ch.net/bbsmenu.html", function (res) {
			var chunks = [];

			bbsmenu = "";

			res.on("data", function (chunk) {
				chunks.push(chunk);
			});

			res.on("end", function () {
				bbsmenu = iconvSJ2U8.convert(Buffer.concat(chunks)).toString();
			});
		});

		return;
	},

	endWithError = function (IO, status, message) {
		IO.setStatus(status);
		IO.setHeader("Content-Type: text/plain; charset=UTF-8");
		IO.echo(message);
		IO.end();

		return;
	},

	paramCheck = function (IO) {
		if (! IO.request.formData.GET.b || /[^0-9a-z]/i.test(IO.request.formData.GET.b)) {
			endWithError(IO, 400, "Malformed mandatory parameters.");
			return false;
		}

		if (IO.request.formData.GET.f && feedTypes[IO.request.formData.GET.f] === undefined) {
			endWithError(IO, 400, "Unsupported feed format.");
			return false;
		}

		if (IO.request.formData.GET.n && isNaN(IO.request.formData.GET.n)) {
			endWithError(IO, 400, "Unacceptable number of items.");
			return false;
		}

		return true;
	},

	getBoardMeta = function (brd) {
		var match = new RegExp("(http:\\/\\/([^\\/.]+)\\.2ch\\.net/" + brd + "\\/)[^>]*>([^<]+)<\\/a>", "i").exec(bbsmenu) || [];
		return match ? {
			server : match[2],
			board : brd,
			name : match[3],
			url : match[1]
		} : null;
	},

	buildBoardInfo = function (subjectTxt, boardMeta, env, limit) {
		var threads = [],
		subjectRows = subjectTxt.split("\n");

		for (let i = 0; i < subjectRows.length && threads.length < limit; i += 1) {
			let parts = subjectRows[i].split("<>"),
			dat = parts.shift(),
			datID = parseInt(dat.match(/\d+/)[0], 10),
			title = parts.join("<>").replace(/\(\d+\)$/, "").trim();

			if (datID > 2147483647) {
				continue;
			}

			threads.push({
				id : datID,
				title : title.toXMLSafeString(),
				pageURL : encodeURI("http://" + boardMeta.server + ".2ch.net/test/read.cgi/" + boardMeta.board + "/" + datID + "/").toXMLSafeString(),
				datURL : encodeURI(boardMeta.url + "dat/" + dat).toXMLSafeString()
			});
		}

		return {
			feedDate : new Date(),
			feedURL : encodeURI(env.REQUEST_SCHEME + "://" + env.HTTP_HOST + env.REQUEST_URI).toXMLSafeString(),
			server : boardMeta.server.toXMLSafeString(),
			boardID : boardMeta.board.toXMLSafeString(),
			boardURL : encodeURI(boardMeta.url).toXMLSafeString(),
			boardName : boardMeta.name.toXMLSafeString(),
			threads : threads
		}
	},

	respondFeed = function (IO) {
		var brd = IO.request.formData.GET.b.toLowerCase(),
		format = feedTypes[IO.request.formData.GET.f] ? IO.request.formData.GET.f : "atom1",
		limit = Math.min(parseInt(IO.request.formData.GET.n, 10), 200) || 100,

		boardMeta = getBoardMeta(brd);

		require("http").get(
			boardMeta.url + "/subject.txt",
			function (res) {
				var chunks = [];

				res.on("data", function (chunk) {
					chunks.push(chunk);
				});

				res.on("end", function () {
					var subjectTxt = iconvSJ2U8.convert(Buffer.concat(chunks)).toString();

					IO.setHeader("Content-Type: " + feedTypes[format] + "; charset=UTF-8");
					IO.echo(require("./" + format + ".js").format(buildBoardInfo(subjectTxt, boardMeta, IO.request.params, limit)));
					IO.end();
				});
			}
		);

		return;
	};

	String.prototype.toXMLSafeString = function () {
		return this.replace(/&/g, "&amp;").replace(/</g, "&lt;");
	};

	exports.exec = function (IO) {
		if (bbsmenu === "") {
			setImmediate(exports.exec.bind(exports, IO));
		} else if (paramCheck(IO)) {
			if (getBoardMeta(IO.request.formData.GET.b) === null) {
				endWithError(IO, 404, "Board not found.");
				return;
			}

			respondFeed(IO);
		}

		return;
	};

	loadBBSMenu();
	setInterval(loadBBSMenu, 300 * 1000);
})();
