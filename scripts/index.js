// let el = document.getElementById("upload-card-body");

function toggleUploadCardBody() {
    let card = document.getElementById("upload-card");
    let el = document.getElementById("upload-card-body");
    let more = document.querySelector(".upload-card-header .material-icons");
    let title = document.getElementById("upload-title");
    let cls = document.getElementById("upload-close");
    console.log(more);
    if (el.classList.contains("show")) {
        // card.style.width = "15rem";
        el.classList.remove("show");
        more.classList.remove("close-more");
        more.classList.add("open-more");
        title.style.display = "none";
        cls.style.display = "none";
        // el.style.display = "block";
    }
    else {
        // card.style.width = "4.5rem";
        el.classList.add("show");
        more.classList.remove("open-more");
        more.classList.add("close-more");
        // el.style.display = "none";
        title.style.display = "block";
        
        if(running_ajax_processes == 0) {
           cls.style.display = "block";
        }
    }
}

function hideUploadCard() {
    let el = document.getElementById("upload-card-body");
    let card = document.getElementById("upload-card");
    el.innerHTML = "";
    card.style.display = "none";
}