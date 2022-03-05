function download(url, callBack) {
    setTimeout(() => {
        // script to download the picture here
        console.log(`Downloading ${url} ...`);
        picture_data = "image data:XOXOXO";
    }, 3* 1000);
    callBack(picture_data);
}

function process(picture) {
    console.log(`Processing ${picture}`);
}

let url = 'https://www.example.com/big_pic.jpg';
download(url, process);