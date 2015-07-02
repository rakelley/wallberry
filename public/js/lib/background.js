var backgrounds = {},
    utility = require('./utility');

backgrounds.init = function(videoSelector, imageSelector, delay) {
    videoSelector = videoSelector || ".bg-video";
    imageSelector = imageSelector || ".bg-image";
    delay = delay || 60;

    backgrounds.imageTarget = document.querySelector(imageSelector);
    backgrounds.videoTarget = document.querySelector(videoSelector);

    backgrounds.updateBackground();
    window.setInterval(backgrounds.updateBackground, delay * 1000);
};

backgrounds.updateBackground = function() {
    backgrounds.videoTarget.pause();
    utility.simpleAjax('backgrounds', 'get').then(
        function(response) { backgrounds.processFile(response); },
        function() { return; }
    );
};

backgrounds.processFile = function(responseObject) {
    if (!responseObject || typeof responseObject.file == undefined ||
        !responseObject.file
    ) {
        return;
    } else {
        var file = responseObject.file;
    }

    var type = backgrounds.getFileType(file);
    if (!type) {
        return;
    } else if (type === 'image') {
        backgrounds.updateImage(file);
    } else {
        backgrounds.updateVideo(file, type);
    }
};

backgrounds.getFileType = function(file) {
    var regex = /(?:\.([^.]+))?$/,
        videoTypes = ['mp4', 'webm', 'ogg'],
        imageTypes = ['jpg', 'jpeg', 'png', 'gif'];

    var type = regex.exec(file)[1];
    if (videoTypes.indexOf(type) > -1) {
        return 'video/' + type;
    } else if (imageTypes.indexOf(type) > -1) {
        return 'image';
    } else {
        return;
    }
};

backgrounds.updateImage = function(file) {
    backgrounds.imageTarget.src = file;
    utility.hide(backgrounds.videoTarget);
    utility.show(backgrounds.imageTarget);
};

backgrounds.updateVideo = function(file, type) {
    backgrounds.videoTarget.children[0].setAttribute('src', file);
    backgrounds.videoTarget.children[0].setAttribute('type', type);
    backgrounds.videoTarget.load();
    utility.hide(backgrounds.imageTarget);
    utility.show(backgrounds.videoTarget);
    backgrounds.videoTarget.play();
};


module.exports = backgrounds.init;
