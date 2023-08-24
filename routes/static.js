const path = require("path");
const fs = require("fs");
const mime = require("mime");
const { ROOT_DIR } = require('../shared/rootPath');
// const util = require('util');

module.exports = {
    get: function (req, res) {
        let url = decodeURI(req.url);
        console.log(ROOT_DIR)
        let filePath = path.join(ROOT_DIR, url == "/" ? "index.html" : url);
        console.log(`Requested file: ${filePath}`);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                //  Some server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            } else {
                // Success
                res.writeHead(200, {
                    "Content-Type": mime.getType(filePath)
                });
                res.end(content, "utf8");
            }
        });
    }
}