// Copyright (C) 2010-2014 Makoto Mizukami

exports.format = function (params) {
	var res = [];

	res.push("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
	res.push("<feed xmlns=\"http://www.w3.org/2005/Atom\" xml:lang=\"ja-jp\">");
	res.push("  <title>スレッド一覧: " + params.boardName + "</title>");
	res.push("  <subtitle>Listed by ThreadFeed</subtitle>");
	res.push("  <link href=\"" + params.feedURL + "\" rel=\"self\" />");
	res.push("  <link href=\"" + params.boardURL + "\" />");
	res.push("  <id>" + params.boardURL + "</id>");
	res.push("  <updated>" + params.feedDate.toISOString() + "</updated>");

	params.threads.forEach(function (thread) {
		res.push("");
		res.push("  <entry>");
		res.push("    <title>" + thread.title + "</title>");
		res.push("    <link href=\"" + thread.pageURL + "\" />");
		res.push("    <author><name>" + params.boardName + "</name></author>");
		res.push("    <id>" + thread.datURL + "</id>");
		res.push("    <updated>" + new Date(parseInt(thread.id, 10) * 1000).toISOString() + "</updated>");
		res.push("  </entry>");
	});

	res.push("</feed>");

	return res.join("\n");
};
