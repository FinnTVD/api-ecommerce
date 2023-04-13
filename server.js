import jsonServer from "json-server";
import queryString from "query-string";
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
	if (req.method === "POST") {
		req.body.createdAt = Date.now();
		req.body.updatedAt = Date.now();
	} else if (req.method === "PATCH") {
		req.body.updatedAt = Date.now();
	}
	// Continue to JSON Server router
	next();
});

router.render = (req, res) => {
	const headers = res.getHeaders();
	const path = req._parsedUrl.pathname.slice(1);
	const totalCounts = headers["x-total-count"]?.__wrapped__[path]?.length;
	const queryParams = queryString.parse(req._parsedUrl?.query);
	if (req.method === "GET" && queryParams._limit && queryParams._page) {
		if (queryParams.category) {
			const result = {
				data: res.locals.data,
				pagination: {
					page: Number.parseInt(queryParams._page),
					limit: Number.parseInt(queryParams._limit),
					totalCounts: res.locals.data.length,
					totalPage: Math.ceil(
						res.locals.data.length /
							Number.parseInt(queryParams._limit)
					),
				},
			};
			return res.jsonp(result);
		}
		const result = {
			data: res.locals.data,
			pagination: {
				page: Number.parseInt(queryParams._page),
				limit: Number.parseInt(queryParams._limit),
				totalCounts: totalCounts,
				totalPage: Math.ceil(
					totalCounts / Number.parseInt(queryParams._limit)
				),
			},
		};
		return res.jsonp(result);
	}
	return res.jsonp({
		data: res.locals.data,
		pagination: { totalCounts: res.locals.data.length },
	});
};

// Use default router
server.use("/api", router);
server.listen(3000, () => {
	console.log("JSON Server is running", 3000);
});
module.exports = server;
