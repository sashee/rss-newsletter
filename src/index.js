const RSS = require("rss");
const moment = require("moment");
const inlineCss = require("inline-css");
const matter = require("gray-matter");
const fs = require("fs");
const util = require("util");

const getContent = async () => {
	const startDate = moment("2019-12-15");
	const currentDate = moment().startOf("day");
	const difference = currentDate.diff(startDate, "days");

	const files = (await util.promisify(fs.readdir)("content"))
		.sort(new Intl.Collator(undefined, {numeric: true}).compare);
	const currentFile = files[difference % files.length];

	const {content, data: {title}} = matter(await util.promisify(fs.readFile)(`content/${currentFile}`, "utf8"));

	return {
		title,
		content: await inlineCss(content, {url: " "}), 
		date: currentDate.toDate(),
	};
};

const getRSS = async () => {
	const {content, date, title} = await getContent();

	const feed = new RSS({
		title: "My newsletter",
	});

	feed.item({
		title,
		guid: date.toString(),
		date,
		description: content,
	});
	
	return feed.xml();
};

exports.handler = async (event, context) => {
	const feed = await getRSS();

	return {
		statusCode: 200,
		body: feed,
		headers: {
			"Content-Type": "application/rss+xml",
		},
	};
};
