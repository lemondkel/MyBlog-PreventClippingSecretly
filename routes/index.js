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
		var res2 = await getBody('https://search.naver.com/search.naver?sm=tab_hty.top&where=nexearch&query=' + postList[i].title + '&tqi=hkbAdsprvh8ss4Gsck0ssssstdR-362053');

		var bloggerIdIndex = res2.indexOf("blog.naver.com/" + id);
		if (bloggerIdIndex === -1) {
			console.log("[상위노출맞나?]" + decodeURIComponent(postList[i].title));
			await fs.appendFileSync('test1.txt', '\t[상위노출맞나?] '+decodeURIComponent(postList[i].title) + '\n');
		} else {
			console.log("[제목]" + decodeURIComponent(postList[i].title));
			await fs.appendFileSync('test1.txt', ''+decodeURIComponent(postList[i].title) + '\n');
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
