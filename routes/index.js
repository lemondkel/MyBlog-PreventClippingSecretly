const request = require('request');
const fs = require('fs');

let express = require('express');
let router = express.Router();
require('chromedriver');

router.get('/', function (req, res, next) {
	res.render('index');
});

router.get('/2', async function (req, res, next) {

	const id = req.query.id;
	let pageNum = 1;
	var result = await getBody("https://blog.naver.com/PostTitleListAsync.naver?blogId=" + id + "&viewdate=&currentPage=" + pageNum + "&categoryNo=&parentCategoryNo=&countPerPage=30");

	var body = JSON.parse(result.replace(/'/gi, '"'));
	const totalCount = body.totalCount;
	let postList = body.postList;

	while (totalCount > pageNum * 30) {
		pageNum++;
		result = await getBody("https://blog.naver.com/PostTitleListAsync.naver?blogId=" + id + "&viewdate=&currentPage=" + pageNum + "&categoryNo=&parentCategoryNo=&countPerPage=30");
		body = JSON.parse(result.replace(/'/gi, '"'));
		let postListTemp = body.postList;
		postList = postList.concat(postListTemp);
	}

	for (var i = 0; i < postList.length; i++) {
		console.log("[제목]" + decodeURIComponent(postList[i].title));
		fs.appendFileSync('test1.txt', "\n\n[제목]" + decodeURIComponent(postList[i].title) + "\n");
		var res2 = await getBody('https://search.naver.com/search.naver?sm=tab_hty.top&where=nexearch&query=' + postList[i].title + '&tqi=hkbAdsprvh8ss4Gsck0ssssstdR-362053');
		while (res2 !== '') {
			var bloggerIdIndex = res2.indexOf("blog.naver.com/");
			if (bloggerIdIndex === -1) {
				break;
			}
			var temp = res2.substring(bloggerIdIndex);
			var end = temp.indexOf('"');

			var blogId = temp.substring(0, end);
			res2 = res2.substring(0, end);
			if (blogId.indexOf(id) > -1) {
				await fs.appendFileSync('test1.txt', ' '+blogId + '\n');
			} else {
				await fs.appendFileSync('test1.txt', ' (펌?!) '+blogId + '\n');
			}
		}
	}
	// postList = postList.filter(function (a, b) {
	// 	return a.logNo !== b.logNo;
	// });
	console.log(postList);
	console.log(postList.length);
	console.log(pageNum + "번까지 함");
});

async function getBody(url) {
	const options = {
		url: url,
		method: 'GET',
	};

	// Return new promise
	return new Promise(function (resolve, reject) {
		// Do async job
		request.get(options, function (err, resp, body) {
			if (err) {
				reject(err);
			} else {
				resolve(body);
			}
		})
	})
}

module.exports = router;
