// Copyright (C) 2010-2014 Makoto Mizukami

exports.format = function (params) {
	var res = [];

	res.push("<?xml version=\"1.0\"?>");
	res.push("<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">");
	res.push("  <channel>");
	res.push("    <title>スレッド一覧: " + params.boardName + "</title>");
	res.push("    <link>" + params.boardURL + "</link>");
	res.push("    <description>Listed by ThreadFeed</description>");
	res.push("    <language>ja-jp</language>");
	res.push("    <pubDate>" + params.feedDate.toUTCString() + "</pubDate>");
	res.push("    <atom:link href=\"" + params.feedURL + "\" rel=\"self\" type=\"application/rss+xml\" />");

	params.threads.forEach(function (thread) {
		res.push("");
		res.push("    <item>");
		res.push("      <title>" + thread.title + "</title>");
		res.push("      <link>" + thread.pageURL + "</link>");
		res.push("      <guid isPermaLink=\"false\">" + thread.datURL + "</guid>");
		res.push("      <pubDate>" + new Date(parseInt(thread.id, 10) * 1000).toUTCString() + "</pubDate>");
		res.push("    </item>");
	});

	res.push("  </channel>");
	res.push("</rss>");

	return res.join("\n");
};
