(function() {
"use strict";

var module = {},
    timeModule = {},
    bgModule = {},
    extModule = {},
    intModule = {},
    utilityModule = {};


utilityModule.simpleAjax = function(url, type) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open(type, url, true);

        req.onload = function() {
            if (req.status === 200 && req.responseText) {
                resolve(JSON.parse(req.responseText));
            } else {
                reject();
            }
        }

        req.send();
    });
};

utilityModule.escapeStr = function(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

utilityModule.hide = function(el) {
    el.classList.remove('show');
    el.classList.add('hide');
};

utilityModule.show = function(el) {
    el.classList.remove('hide');
    el.classList.add('show');
};


timeModule.init = function(selector, delay) {
    selector = selector || ".info_bar-clock";
    delay = delay || 5;
    var timeTarget = document.querySelector(selector);

    timeModule.updateTime(timeTarget);
    window.setInterval(timeModule.updateTime, delay * 1000, timeTarget);
};

timeModule.updateTime = function(target) {
    var current = new Date(),
        day = timeModule.convertDay(current.getDay()),
        hours = ('0'+current.getHours()).slice(-2),
        minutes = ('0'+current.getMinutes()).slice(-2);

    target.innerHTML = day + ' ' + hours + ':' + minutes;
};

timeModule.convertDay = function(key) {
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[key];
};


bgModule.init = function(videoSelector, imageSelector, delay) {
    videoSelector = videoSelector || ".bg-video";
    imageSelector = imageSelector || ".bg-image";
    delay = delay || 60;

    bgModule.imageTarget = document.querySelector(imageSelector);
    bgModule.videoTarget = document.querySelector(videoSelector);

    bgModule.updateBackground();
    window.setInterval(bgModule.updateBackground, delay * 1000);
};

bgModule.updateBackground = function() {
    bgModule.videoTarget.pause();
    utilityModule.simpleAjax('backgrounds', 'get').then(
        function(response) { bgModule.processFile(response); },
        function() { return; }
    );
};

bgModule.processFile = function(responseObject) {
    if (!responseObject || typeof responseObject.file == undefined ||
        !responseObject.file
    ) {
        return;
    } else {
        var file = responseObject.file;
    }

    var type = bgModule.getFileType(file);
    if (!type) {
        return;
    } else if (type === 'image') {
        bgModule.updateImage(file);
    } else {
        bgModule.updateVideo(file, type);
    }
};

bgModule.getFileType = function(file) {
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

bgModule.updateImage = function(file) {
    bgModule.imageTarget.src = file;
    utilityModule.hide(bgModule.videoTarget);
    utilityModule.show(bgModule.imageTarget);
};

bgModule.updateVideo = function(file, type) {
    bgModule.videoTarget.children[0].setAttribute('src', file);
    bgModule.videoTarget.children[0].setAttribute('type', type);
    bgModule.videoTarget.load();
    utilityModule.hide(bgModule.imageTarget);
    utilityModule.show(bgModule.videoTarget);
    bgModule.videoTarget.play();
};


extModule.init = function(selector, delay) {
    selector = selector || '.info_bar-w_exterior';
    delay = delay || 1000;

    extModule.target = document.querySelector(selector);

    extModule.updateWeather();
    window.setInterval(extModule.updateWeather, delay * 1000);
};

extModule.updateWeather = function() {
    utilityModule.simpleAjax('exterior', 'get').then(
        function(response) { extModule.processApi(response); },
        function() { return; }
    );
};

extModule.processApi = function(responseObject) {
    if (!responseObject || typeof responseObject.main == undefined ||
        !responseObject.main
    ) {
        return;
    } else {
        var temp = Math.round(responseObject.main.temp),
            description = utilityModule.escapeStr(responseObject.weather[0].description);
    }

    extModule.target.innerHTML = description + ' ' + temp;
};

extModule.makeLarge = function() {
    extModule.target.classList.add('info_bar-item-large');
};

extModule.makeSmall = function() {
    extModule.target.classList.remove('info_bar-item-large');
};


intModule.init = function(selector, delay) {
    selector = selector || '.info_bar-w_interior';
    delay = delay || 300;

    intModule.target = document.querySelector(selector);

    intModule.updateTemperature();
    window.setInterval(intModule.updateWeather, delay * 1000);
};

intModule.updateTemperature = function() {
    utilityModule.simpleAjax('interior', 'get').then(
        function(response) { intModule.processTemp(response); },
        function() { return; }
    );
};

intModule.processTemp = function(responseObject) {
    if (!responseObject || typeof responseObject.temp == undefined ||
        !responseObject.temp
    ) {
        extModule.makeLarge();
        utilityModule.hide(intModule.target);
    } else {
        var temp = Math.round(responseObject.temp);
        intModule.target.innerHTML = temp;
        extModule.makeSmall();
        utilityModule.show(intModule.target);
    }
};


module.init = function() {
    timeModule.init();
    bgModule.init();
    extModule.init();
    intModule.init();
};

module.init();

}());
