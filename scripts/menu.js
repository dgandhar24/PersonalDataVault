const FILES_API_PATH = 'http://localhost:5000/api/My Drive/';
const DOWNLOAD_API_Path = 'http://localhost:5000/api/download/My Drive/';
const UPLOAD_API_PATH = 'http://localhost:5000/api/upload/My Drive/';
let CURRENT_FOLDER = '';
let FILE_NAME_CLICKED = "";
let UPLOAD_TOAST_ID = 0;
let running_ajax_processes = 0;

const root = document.documentElement;

//decoding string like &amp; &nbsp; and so on ,..
function decodeInnerHTML(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
}

//making sidenav directory structure.
var walkSync = function(current_dir) {
    let str = `<div class="menu">
    <div class="menu-name"><i class="material-icons arrow">keyboard_arrow_right</i><i class="material-icons folder-icon">folder</i>${current_dir.name}</div>
    <div class="menu-items">`;

    current_dir.dirs.forEach((dir) => {
        str += walkSync(dir);
    });

    str += `</div>
    </div>`;

    return str;
}

//on page load
function onLoad() {
    // let files;
    fetch(FILES_API_PATH)
    .then(res =>{
        if(res.ok) {
            console.log('onload success!');
        } 
        else {
            console.log('onload Not Successful');
        }
        return res.json()
    })
    .then(files => {
        console.log(files)
        let menuInnerHTTML = walkSync(files);
        document.getElementById("menu").innerHTML = menuInnerHTTML;
        setMenuListener(); 
        setFolderView(files);   
    });
    // console.log('Hello: ' + files);
}

// setting sidenav view click listener
function setMenuListener() {
    let menus = document.getElementsByClassName("menu");
    // console.log(menu.length);
    // console.log(menus);
    // console.log(menus[0].children)
    let i = 0;
    for(i = 0; i < menus.length; i++){
        let menu = menus[i];
        menu.children[0].children[0].addEventListener("click", () => {
            let menu_name = event.currentTarget.parentElement;
            let menu_items = menu_name.nextElementSibling;
            if(menu_items.style.display === "block") {
                menu_items.style.display = "none";
                // event.currentTarget.innerHTML = "keyboard_arrow_right";
                event.currentTarget.classList.add('close');
                event.currentTarget.classList.remove('add');
            }else {
                menu_items.style.display = "block";
                // event.currentTarget.innerHTML = "keyboard_arrow_down";
                event.currentTarget.classList.add('open');
                event.currentTarget.classList.remove('close');
            }
        });
    }
} 

// for setting list of folders and files
function setFolderView(current_dir) {
    // updating breadcrumb
    setBreadcrumb();
    //updating folder view
    let str = '';   
    if (current_dir.dirs.length == 0 && current_dir.files.length == 0) {
        str = `<div class = "loading-container gray">
            <i class="material-icons gray-text-lighten" style="font-size: 2rem">folder_open</i>

            <p class="gray-text-lighten" style="font-size: 1.5rem; padding: 0rem 1rem"> Folder Empty!!</hp>
            </div>`;
    }
    current_dir.dirs.forEach((dir) => {
    str += `<div class="list-item" onmouseenter="listItemEnter()" onmouseleave="listItemLeave()" onclick="openFolder()">
        <div class="item-check">
            <input onclick="listItemSelected()" type="checkbox" name="selected" id="">
            <i class="material-icons folder-icon">folder</i>
        </div>
            <div class="item-info">
                <div class="item-name">${dir.name}</div>
                <div class="item-size"> 214 KB </div>
                <div class="item-modified"> Aug 14, 2020 </div>
            </div>
            <i  class="material-icons more_button">more_horiz</i>
        </div>`;
    });

    current_dir.files.forEach((file) => {
    str += `<div class="list-item" onmouseenter="listItemEnter()" onmouseleave="listItemLeave()">
            <div class="item-check">
                <input onclick="listItemSelected()" type="checkbox" name="selected" id="">
                <i class="material-icons file-icon">description</i>
            </div>
                <div class="item-info">
                    <span class="item-name">${file}</span>
                    <span class="item-size">214 KB</span>
                    <span class="item-modified">Aug 14, 2020</span>
                </div>
                <i  class="material-icons more_button">more_horiz</i>
            </div>`;
    });

    document.getElementById("list").innerHTML = str;
}

// list-item click next folder
function openFolder() {
    if(event.target.classList.contains("more_button") || event.target instanceof HTMLInputElement) {
        return;
    }

    let folderToFetch = CURRENT_FOLDER + event.currentTarget.getElementsByClassName("item-name")[0].innerHTML + "/";
    folderToFetch = decodeInnerHTML(folderToFetch);
    fetctFolderView(folderToFetch);
}

//fetching folders and files for given folder
function fetctFolderView(folderToFetch) {
    document.getElementById("list").innerHTML = `
    <div class="loading-container">
        <div class="loading">
            <div class="circle"></div>
            <div class="circle"></div>
            <div class="circle"></div>
        </div>
    </div>`;
    setTimeout(() => {
    fetch(FILES_API_PATH + folderToFetch)
        .then(res => {
            if (res.ok) {
                console.log('open folder success!');
            } else {
                console.log('open folder Not Successful');
            }
            return res.json()
        })
        .then(files => {
            // console.log(files)
            CURRENT_FOLDER = folderToFetch;
            setFolderView(files);
        });}, 2000);
}

function backFolder() {
    // console.log("cfo: " + CURRENT_FOLDER);
    let strs = CURRENT_FOLDER.split('/');
    strs.pop();
    strs.pop();
    // console.log("strs: " + strs);
    let new_path = strs.join('/')
    if(new_path != "")
        new_path += "/";
    CURRENT_FOLDER = new_path;
    // console.log("new path: "+new_path);
    fetch(FILES_API_PATH + new_path)
    .then(res =>{
        if(res.ok) {
            console.log('back folder success!');
        } 
        else {
            console.log('back folder Not Successful');
        }
        return res.json()
    })
    .then(files => {
        console.log(files)
        setFolderView(files);   
    });
}

//setting the breadcrumbs
function setBreadcrumb() {
    let element = document.getElementById("filepath");
    folder_path = CURRENT_FOLDER.split('/');
    folder_path.pop();
    // console.log(folder_path);
    let s = '';
    if(folder_path.length == 0){
        s = '<li class="bc-item purple-text">My Drive</li>';
    }
    else {
        s = '<li class="bc-item gray-text" onclick="changeFolder()">My Drive</li>';
    }

    folder_path.forEach((folder, i) => {
        if(i == folder_path.length-1) {
            s += `<i class="material-icons">keyboard_arrow_right</i> <li class="bc-item purple-text">${folder}</li>`;
        }
        else {
            s += `<i class="material-icons">keyboard_arrow_right</i> <li class="bc-item gray-text" onclick="changeFolder()">${folder}</li>`;
        }
    });

    element.innerHTML = s;
}

//Breadcrumb click handling
function changeFolder() {
    let element = document.getElementById("filepath");
    let clicked_folder = event.currentTarget;
    let new_path = '';
    for(let i = 0; i < element.children.length; i+=2){
        let folder = element.children[i];
        if(i != 0)
            new_path += decodeInnerHTML(folder.innerHTML) + '/';
        if(folder === clicked_folder){
                break;
        }
    };
    // CURRENT_FOLDER = new_path;
    console.log("bc path: " + FILES_API_PATH + new_path);
    // fetch(API_PATH + new_path)
    // .then(res =>{
    //     if(res.ok) {
    //         console.log('change folder success!');
    //     } 
    //     else {
    //         console.log('change folder Not Successful');
    //     }
    //     return res.json()
    // })
    // .then(files => {
    //     // console.log(files)
    //     setFolderView(files);   
    // });
    fetctFolderView(new_path);
}

//ListItem enter functions
function listItemEnter() {
    let element = event.currentTarget;
    if (!element.querySelector("input").checked) {
        element.style.backgroundColor = "rgba(108,117,125,.0627451)";
    } 
    else {
        //  element.style.backgroundColor = "rgba(0,123,255,.627451);";
    }
    element.getElementsByClassName("item-name")[0].classList.add("blue-text");
    element.getElementsByClassName("material-icons")[1].style.border = "1px solid rgba(108,117,125,.6)";
} 

//ListItem leave functions
function listItemLeave() {
    let element = event.currentTarget;
    if (!element.querySelector("input").checked) {
        element.style.backgroundColor = "transparent";
        // element.style.border = "1px solid rgba(0, 123, 255, 0.4)";
    }
    element.getElementsByClassName("item-name")[0].classList.remove("blue-text");
    element.getElementsByClassName("material-icons")[1].style.border = "1px solid transparent";
}

//list-item select function (checkbox handler) 
function listItemSelected() {
    let element = event.currentTarget.parentElement.parentElement;
    if(event.target.checked)
        element.style.backgroundColor = "rgba(0,123,255,.127451)";
    else 
         element.style.backgroundColor = "rgba(108,117,125,.0627451)";
}

//list-item more button open
function open_more_options() {
    let top = event.clientY;
    let left = event.clientX;
    console.log(`(${top}, ${left})`);
    let element = document.getElementById("more_option_folder");
    element.style.top = `${top}px`;
    element.style.left = `${left}px`;
    element.style.display = "block";
}

//list-item more button close or click handler
function handle_more_options() {
    let element = document.getElementById("more_option_folder");
    if(event.target.id === "more_options_folder") {
        element.style.display = "block";
    }
    else if(event.target.classList.contains("more_button")){
        let {top, right, bottom, left} = event.target.getBoundingClientRect();
        let bodyRect = document.body.getBoundingClientRect();
        element.style.top = `${bottom}px`;
        element.style.right = `${bodyRect.right - right}px`;
        if(element.style.display === "block"){
            element.style.display = "none";
            FILE_NAME_CLICKED = "";
        }
        else {
            element.style.display = "block"; 
            let encoded_val = event.target.parentElement.getElementsByClassName("item-name")[0].innerHTML;
            FILE_NAME_CLICKED = decodeInnerHTML(encoded_val);
            console.log(`File cliked: ${FILE_NAME_CLICKED}`);
        }
    }
    else{
        element.style.display = "none";
    } 
}

//api calling for creation of new folder
function createNewFolder() {
    // document.getElementsByClassName("modal-container")[0].style.display = "flex";
    let folder_name = document.getElementById("folder-name").value;
    console.log(folder_name);
    fetch(FILES_API_PATH+CURRENT_FOLDER, {
        method: 'POST',
        headers: {
            'Content-Type': 'applications/json'
        },
        body: JSON.stringify({
            name: folder_name
        })
    }).then(res => {
        return res.json()
    })
    .then(data => {
        console.log(data);
        fetctFolderView(CURRENT_FOLDER);
        closeCreateModal();
    })
    .catch(error => console.log(error))

    // fetch(API_PATH + CURRENT_FOLDER)
    // .then(res =>{
    //     if(res.ok) {
    //         console.log('open folder success!');
    //     } 
    //     else {
    //         console.log('open folder Not Successful');
    //     }
    //     return res.json()
    // })
    // .then(files => {
    //     // console.log(files)
    //     setFolderView(files); 
    //     closeCreateModal();  
    // });
}

//open new folder modal
function openCreateModal() {
    document.getElementById("create-folder-modal").style.display = "flex";
    document.getElementById("folder-name").focus();
}

//close new folder Create Modal
function closeCreateModal() {
    document.getElementById("folder-name").value = "";
    document.getElementById("create-folder-modal").style.display = "none";
}

//api calling for deletion of file or folder
function deleteFolderOrFile() {
    console.log(FILE_NAME_CLICKED);
    fetch(FILES_API_PATH + CURRENT_FOLDER + FILE_NAME_CLICKED, {
        method: 'DELETE'
    })
    .then(res => {
        return res.json()
    })
    .then(data => {
        console.log(data);
        fetctFolderView(CURRENT_FOLDER);
        closeDeleteModal();
    })
    .catch(error => console.log(error))

    // fetch(API_PATH + CURRENT_FOLDER)
    // .then(res =>{
    //     if(res.ok) {
    //         console.log('open folder success!');
    //     } 
    //     else {
    //         console.log('open folder Not Successful');
    //     }
    //     return res.json()
    // })
    // .then(files => {
    //     // console.log(files)
    //     setFolderView(files); 
    //     closeDeleteModal();  
    // });
}

//opening the delete modal
function openDeleteModal() {
    let element = document.getElementById("delete-modal");
    console.log(element);
    document.getElementById("file-to-delete").innerHTML = FILE_NAME_CLICKED;
    element.style.display = "flex";
}

//closing the delete modal
function closeDeleteModal() {
    document.getElementById("delete-modal").style.display = "none";
}

//api call for renaming the folder or file
function renameFolderOrFile() {
    let folder_name = document.getElementById("folder-rename").value;
    console.log(folder_name);
    fetch(FILES_API_PATH + CURRENT_FOLDER + FILE_NAME_CLICKED, {
        method: 'PUT',
        headers: {
            'Content-Type': 'applications/json'
        },
        body: JSON.stringify({
            name: folder_name
        })
    }).then(res => {
        return res.json()
    })
    .then(data => {
        console.log(data);
        fetctFolderView(CURRENT_FOLDER);
        closeRenameModal();
    })
    .catch(error => console.log(error))

    // fetch(API_PATH + CURRENT_FOLDER)
    // .then(res =>{
    //     if(res.ok) {
    //         console.log('Rename folder success!');
    //     } 
    //     else {
    //         console.log('open folder Not Successful');
    //     }
    //     return res.json()
    // })
    // .then(files => {
    //     // console.log(files)
    //     setFolderView(files); 
    //     closeRenameModal();  
    // });
}

//closing the rename modal
function openRenameModal() {
    let element = document.getElementById("rename-modal");
    document.getElementById("file-to-rename").innerHTML = FILE_NAME_CLICKED;
    element.style.display = "flex";
    let inp = document.getElementById("folder-rename");
    let [name, ext] = FILE_NAME_CLICKED.split(".");
    inp.focus();
    inp.value = FILE_NAME_CLICKED;
    inp.setSelectionRange(0, name.length);
}

//closing the rename modal
function closeRenameModal() {
    document.getElementById("folder-rename").value = "";
    document.getElementById("rename-modal").style.display = "none";
}

//upload button click handler 
function selectFile() {
    let file_input = document.getElementById("upload-file");
    file_input.click();
}

// on input value change handler
function uploadFile() {
    let file_input = document.getElementById("upload-file");
    if (file_input.value) {
        const files = file_input.files;
        console.log(file_input)
        console.log(files);
        const fileData = new FormData();
        // fileData.append('dirPath', CURRENT_FOLDER);
        for (let i = 0; i < files.length; i++){
            fileData.append(`newFile${i}`, files[i]);
        };

        fetch(UPLOAD_API_PATH + CURRENT_FOLDER, {
            method: 'POST',
            body: fileData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                fetctFolderView(CURRENT_FOLDER);
            })
            .catch(error => {
                console.error(error)
            })
        
        // fetch(API_PATH + CURRENT_FOLDER)
        //     .then(res => {
        //         if (res.ok) {
        //             console.log('Reload  after upload success!');
        //         } else {
        //             console.log('open folder Not Successful');
        //         }
        //         return res.json()
        //     })
        //     .then(files => {
        //         // console.log(files)
        //         setFolderView(files);
        //     });
    }

}

//download button handler
function downloadFile() {
    var downloadUrl = DOWNLOAD_API_Path + CURRENT_FOLDER + FILE_NAME_CLICKED;
    console.log(`Download URL: ${downloadUrl}`)
    document.getElementById("file-download").src = downloadUrl;
    setTimeout(() => { document.getElementById("file-download").src = ""; }, 500);
}

//upload progress 
const sendHttpRequest = (method, url, data, id) => {
    const promise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);

        xhr.responseType = 'json';
        let progress_circle = document.getElementById(id).getElementsByClassName("progress-circle-value")[0];
        console.log("progress circle: ");
        console.log(progress_circle);

        // if (data) {
        //     xhr.setRequestHeader('Content-Type', 'application/json');
        // }

        xhr.onload = () => {
            if (xhr.status >= 400) {
                progress_circle.style["stroke-dashoffset"] = `75`;
                document.getElementById(id).querySelector(".cancel").style.display = "none";
                document.getElementById(id).querySelector(".error").style.display = "block";
                reject(xhr.response);
            } else {
                progress_circle.style["stroke-dashoffset"] = `0`;
                document.getElementById(id).querySelector(".cancel").style.display = "none";
                document.getElementById(id).querySelector(".check").style.display = "block";
                resolve(xhr.response);
            }
        };

        xhr.onerror = () => {
            console.log("onerror");
            progress_circle.style["stroke-dashoffset"] = `75`;
            document.getElementById(id).querySelector(".cancel").style.display = "none";
            document.getElementById(id).querySelector(".error").style.display = "block";
            reject(xhr.response);
        };

        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                console.log(`making progress: ${event.loaded / event.total * 100}%`);
                var percent = (1 - (event.loaded / event.total)) * 75;
                progress_circle.style["stroke-dashoffset"]  = `${Math.round(percent)}`;
            }
        }
        xhr.upload.onloadstart = function (e) {
            // root.style.setProperty('--progress-completed', `75`);
            let el = document.getElementById("upload-card-body");
            let card = document.getElementById("upload-card");
            document.getElementById("upload-close").style.display = "none";
            card.style.display = "block";
            // el.classList.add("show");
            if(!el.classList.contains("show"))
                toggleUploadCardBody();
            let icon = document.getElementById(id).querySelector(".cancel");
            icon.addEventListener("click", updateAbort= ()=> {
                xhr.abort(); 
                event.target.style.display = "none";
                document.getElementById(id).querySelector(".error").style.display = "block";  
            });
            progress_circle.style["stroke-dashoffset"] = `75`;
        }
        xhr.upload.onloadend = function (e) {
            console.log("onloadend");
            // root.style.setProperty('--progress-completed', `0`);
            running_ajax_processes--;
            if(running_ajax_processes == 0) {
                document.getElementById("upload-close").style.display = "block";
            }
            let el = document.getElementById("upload-card-body");
            if(!el.classList.contains("show"))
                toggleUploadCardBody();
            // progress_circle.style["stroke-dashoffset"] = `0`;
        }

        xhr.send(data);
    });
    return promise;
};

//upload function AJAX
function uploadFileAJAX() {
    let file_input = document.getElementById("upload-file");
    if (file_input.value) {
        const files = file_input.files;
        console.log(file_input)
        console.log(files[0]);
        const fileData = new FormData();
        // fileData.append('dirPath', path);
        fileData.append('newFile0', files[0])
        let id = setUploadCard(files[0].name);
        file_input.value = null;
        running_ajax_processes++;
        sendHttpRequest('POST', UPLOAD_API_PATH + CURRENT_FOLDER, fileData, id)
            .then(responseData => {
                console.log("onthen");
                console.log(responseData);
                fetctFolderView(CURRENT_FOLDER);
            })
            .catch(err => {
                console.log("oncatch");
                console.log(err);
            });
    }
}

//create upload list-item 
function setUploadCard(name) {
    let html = `
        <div class="toast-icon"><i class="material-icons">folder</i></div>
        <div class="toast-content">
            <div class="toast-title">${name}</div>
            <div>
            <svg class="progress-circle">
                <circle />
                <circle class="progress-circle-value" />
            </svg>
            </div>
        </div>

        <div class="toast-cancel">
            <i class="material-icons cancel">cancel</i>
            <i class="material-icons error">error</i>
            <i class="material-icons check">check_circle</i>
        </div>`;

    let toast = document.createElement('DIV');
    toast.id = UPLOAD_TOAST_ID;
    UPLOAD_TOAST_ID++;
    toast.className = "toast";
    toast.innerHTML = html;
    document.getElementById("upload-card-body").appendChild(toast);
    console.log("appended child");
    return toast.id;
}
