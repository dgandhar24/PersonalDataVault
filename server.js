const http = require("http");
const staticRouter = require("./routes/static");
const filesRouter = require("./routes/files");
const uploadRouter = require("./routes/upload");
const downloadRouter = require("./routes/download");

const server = http.createServer((req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
    const url = decodeURI(req.url);
    if (url.startsWith('/api/My Drive')) {
        filesRouter.router(req, res);
    }
    else if (url.startsWith('/api/upload/My Drive')) {
        uploadRouter.router(req, res);
    }
    else if (url.startsWith('/api/download/My Drive')) {
        downloadRouter.router(req, res);
    }
    else {
        staticRouter.get(req, res);
    }
});

const PORT = 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));