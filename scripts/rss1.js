// Copyright (C) 2010-2014 Makoto Mizukami

exports.format = function (params) {
	var res = [],
	seq = [],
	list = [];

	res.push("<?xml version=\"1.0\"?>");
	res.push("<rdf:RDF xmlns=\"http://purl.org/rss/1.0/\" xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\">");
	res.push("  <channel rdf:about=\"" + params.feedURL + "\">");
	res.push("    <title>スレッド一覧: " + params.boardName + "</title>");
	res.push("    <link>" + params.boardURL + "</link>");
	res.push("    <description>Listed by ThreadFeed</description>");
	res.push("");

	params.threads.forEach(function (thread) {
		var item = [];

		seq.push("        <rdf:li rdf:resource=\"" + thread.pageURL + "\" />");

		item.push("  <item rdf:about=\"" + thread.pageURL + "\">");
		item.push("    <title>" + thread.title + "</title>");
		item.push("    <link>" + thread.pageURL + "</link>");
		item.push("  </item>");

		list.push(item.join("\n"));
	});

	res.push("    <items>");
	res.push("      <rdf:Seq>");
	res.push(seq.join("\n"));
	res.push("      </rdf:Seq>");
	res.push("    </items>");
	res.push("  </channel>");

	list.length > 0 && res.push("");
	res.push(list.join("\n\n"));

	res.push("</rdf:RDF>");

	return res.join("\n");
};
