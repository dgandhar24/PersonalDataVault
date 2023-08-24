const path = require("path");
const fs = require("fs");
const mime = require("mime");
const { ROOT_DIR } = require('../shared/rootPath');

function get(req, res) {
    let url = decodeURI(req.url);
    console.log(url);
    let folders = url.split('/');
    console.log(folders);
    while (folders[0] === "" || folders[0] === "api" || folders[0] === "download") {
        folders.shift();
    }
    console.log(folders);

    let folderPath = path.join(ROOT_DIR);
    folders.forEach((folder) => {
        folderPath = path.join(folderPath, folder);
    });
    console.log(`Download folder path: ${folderPath}`);

    if (fs.statSync(folderPath).isDirectory()) {
        console.log("cannot serve folder")
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write(JSON.stringify({
            message: "cannot serve folder!"
        }));
        res.end();
    } else {
        let stat = fs.statSync(folderPath);
        console.log(`content-type: ${mime.getType(folderPath)}`);
        res.writeHead(200, {
            'Content-Type': mime.getType(folderPath),
            'Content-Length': stat.size,
            'Content-Disposition': `attachment; filename=${folders[folders.length-1]}`
        });

        var readStream = fs.createReadStream(folderPath);
        // We replaced all the event handlers with a simple call to readStream.pipe()
        console.log("send started!");
        readStream.on('open', function () {
            // This just pipes the read stream to the response object (which goes to the client)
            readStream.pipe(res);
        });

        readStream.on('error', function (err) {
            res.end(err);
        });
        console.log("Ended");
    }
}

function router(req, res) {
     if (req.method.toLowerCase() === "get") {
         get(req, res);
     }
}

module.exports = {
    router: router
}