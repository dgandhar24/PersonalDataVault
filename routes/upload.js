const path = require("path");
const fs = require("fs");
const formidable = require('formidable');
const {ROOT_DIR, UPLOAD_FOLDER} = require('../shared/rootPath');

function post(req, res) {
    const form = formidable({
        multiples: true,
        keepExtensions: true,
        maxFileSize: 4500*1024*1024,
        uploadDir: path.join(UPLOAD_FOLDER)
    });
    
    let url = decodeURI(req.url);
    let folders = url.split('/');
     while (folders[0] === "" || folders[0] === "api" || folders[0] === "upload") {
         folders.shift();
    }
    let folderPath = path.join(ROOT_DIR);
    folders.forEach((folder) => {
        folderPath = path.join(folderPath, folder);
    });
    console.log(`Upload file path: ${folderPath}`);
    form.parse(req, (err, fields, files) => {
        console.log(`Uploaded File:`)
        console.log(files);
        //console.log(files["newFile0"].path);
        //console.log(files["newFile1"].name);
        //console.log(files["newFile2"]);
        for (let i = 0; files[`newFile${i}`]; i++ ) {
            console.log(`Saving file ${files[`newFile${i}`].name}`);
            fs.renameSync(files[`newFile${i}`].path, path.join(folderPath, files[`newFile${i}`].name));
        }
        res.writeHead(200, {
            'content-type': 'application/json'
        });
        res.end(JSON.stringify({
            fields,
            files
        }, null, 2));

    });
}

function router(req, res) {
    if (req.method.toLowerCase() === "post") {
        post(req, res);
    }
}

module.exports = {
    router: router
}