const path = require("path");
const fs = require("fs");
const { ROOT_DIR } = require('../shared/rootPath');
// const util = require('util');

class File {
    constructor(name, path) {
        this.path = path;
        this.name = name;
        this.dirs = [];
        this.files = [];
    }
}

var walkSync = function (dir, name) {
    var fs = fs || require('fs'),
    files = fs.readdirSync(dir);
    // dirlist = dirlist || [];
    let filelist = [];
    let tempdirlist = []
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir,file)).isDirectory()) {
            // filelist = walkSync(dir + file + '/', filelist);
            tempdirlist.push(file);
        } else {
            filelist.push(file);
        }
    });
    let tempdir = new File(name, dir);
    tempdir.files = filelist;
    // tempdir.dirs = tempdirlist;
    // dirlist.push(tempdir);
    // console.log(tempdir);
    tempdirlist.forEach((file) => {
        tempdir.dirs.push(walkSync(path.join(dir, file), file));
    })
    return tempdir;
}

var deleteFolderRecursive = function (folderPath) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function post(req, res) {
    let url = decodeURI(req.url);
    let body = "";
    req.on('data', function (data) {
        body += data;
        // console.log("Partial body: " + body);
    });
    req.on('end', function () {
        // console.log(body);
        let { name } = JSON.parse(body);
        let folders = url.split('/');
        while (folders[0] === "" || folders[0] === "api") {
            folders.shift();
        }
        console.log(folders);
        let folderPath = path.join(ROOT_DIR);
        folders.forEach((folder) => {
            folderPath = path.join(folderPath, folder);
        });
        folderPath = path.join(folderPath, name);
        console.log("folder path: " + folderPath);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
            console.log("folder created at: " + folderPath);
             res.writeHead(200, {
                 'Content-Type': 'application/json'
             });
             res.write(JSON.stringify({
                 message: `successfully created ${folderPath}!`
             }));
             res.end();
        }
        else {
            console.log("folder already exists: " + folderPath);
             res.writeHead(405, {
                 'Content-Type': 'application/json'
             });
             res.write(JSON.stringify({
                 message: `folder already exists: ${folderPath}!`
             }));
             res.end();
        }
    }); 
}

function put(req, res) {
    let url = decodeURI(req.url);
    let body = "";
    req.on('data', function (data) {
        body += data;
        // console.log("Partial body: " + body);
    });
    req.on('end', function () {
        // console.log(body);
        let { name } = JSON.parse(body);
        let folders = url.split('/');
        while (folders[0] === "" || folders[0] === "api") {
            folders.shift();
        }
        console.log(folders);
        let oldPath = path.join(ROOT_DIR);
        let newPath = path.join(ROOT_DIR);
        folders.forEach((folder, i) => {
            oldPath = path.join(oldPath, folder);
            if (i != folders.length - 1)
                newPath = path.join(newPath, folder);
        });
        newPath = path.join(newPath, name);
        console.log(`file path: ${newPath}`);
        
        if (!fs.existsSync(newPath)) {
            fs.renameSync(oldPath, newPath);
            console.log(`${oldPath} renamed as: ${newPath}`);
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.write(JSON.stringify({
                message: `successfully renamed!`
            }));
            res.end();
        }
        else {
            console.log(`folder already exists: ${newPath}`);
            res.writeHead(405, {
                'Content-Type': 'application/json'
            });
            res.write(JSON.stringify({
                message: `folder already exists!`
            }));
            res.end();
        }
    });
}

function del(req, res) {
    let url = decodeURI(req.url);
    let folders = url.split('/');
    while (folders[0] === "" || folders[0] === "api") {
        folders.shift();
    }
    console.log(folders);
    let folderPath = path.join(ROOT_DIR);
    folders.forEach((folder) => {
        folderPath = path.join(folderPath, folder);
    });
    console.log(`folder path: ${folderPath}`);
    let extname = path.extname(folderPath);
    if (extname == '') {
        deleteFolderRecursive(folderPath);
        console.log(`folder deleted at: ${folderPath}`);
    } else {
        fs.unlinkSync(folderPath);
        console.log(`file deleted at: ${folderPath}`);
    }
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    res.write(JSON.stringify({
        message: "successfully deleted file/folder!"
    }));
    res.end();
}

function get(req, res) {
    let url = decodeURI(req.url);
    console.log(url);
    let folders = url.split('/');
    console.log(folders);
    while (folders[0] === "" || folders[0] === "api") {
        folders.shift();
    }
    if (folders[folders.length - 1] == "") {
        folders.pop();
    }
    console.log(folders);

    let folderPath = path.join(ROOT_DIR);
    folders.forEach((folder) => {
        folderPath = path.join(folderPath, folder);
    });
    console.log(folders)
    let alllist = walkSync(folderPath, folders[folders.length-1]);
    //   console.log(alllist);
    // console.log(util.inspect(alllist, {depth: null}));
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    res.write(JSON.stringify(alllist));
    res.end();
}

function router(req, res) {
    // try {
        if (req.method.toLowerCase() === "post") {
            post(req, res);
        }
        else if (req.method.toLowerCase() === "put") {
            put(req, res);
        }
        else if (req.method.toLowerCase() === "delete") {
            del(req, res);
        }
        else {
            get(req, res);
        }
    // }
    // catch (error) {
    //     console.log(error.message);
    //     res.writeHead(200, {
    //         'Content-Type': 'application/json'
    //     });
    //     res.end(JSON.stringify(error.stack));
    // }
}
module.exports = {
    router: router
}