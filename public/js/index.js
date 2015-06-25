(function() {
"use strict";

var module = {},
    timeModule = {},
    bgModule = {},
    extModule = {};


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
    bgModule.getFile().then(
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
        bgModule.hideBackground();
        bgModule.updateImage(file);
    } else {
        bgModule.hideBackground();
        bgModule.updateVideo(file, type);
    }
};

bgModule.getFile = function() {
    return new Promise(function(resolve, reject) {
        var url = 'next',
            requestType = 'get',
            responseType = 'json';

        var req = new XMLHttpRequest();
        req.open(requestType, url, true);
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");

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

bgModule.hideBackground = function() {
    bgModule.imageTarget.classList.remove('show');
    bgModule.imageTarget.classList.add('hide');
    bgModule.videoTarget.classList.remove('show');
    bgModule.videoTarget.classList.add('hide');
};

bgModule.updateImage = function(file) {
    bgModule.imageTarget.src = file;
    bgModule.imageTarget.classList.remove('hide');
    bgModule.imageTarget.classList.add('show');
};

bgModule.updateVideo = function(file, type) {
    bgModule.videoTarget.children[0].setAttribute('src', file);
    bgModule.videoTarget.children[0].setAttribute('type', type);
    bgModule.videoTarget.load();
    bgModule.videoTarget.classList.remove('hide');
    bgModule.videoTarget.classList.add('show');
    bgModule.videoTarget.play();
};


extModule.init = function(selector, delay) {
    selector = selector || '.info_bar-w_exterior';
    delay = delay || 1000;

    extModule.target = document.querySelector(selector);

    extModule.updateWeather();
    window.setInterval(extModule.updateWeather, delay * 1000);
}

extModule.updateWeather = function() {
    extModule.getApi().then(
        function(response) { extModule.processApi(response); },
        function() { return; }
    );
}

extModule.getApi = function() {
    return new Promise(function(resolve, reject) {
        var url = 'http://api.openweathermap.org/data/2.5/weather?zip=60503,us&units=imperial',
            requestType = 'get',
            responseType = 'json';

        var req = new XMLHttpRequest();
        req.open(requestType, url, true);

        req.onload = function() {
            if (req.status === 200 && req.responseText) {
                resolve(JSON.parse(req.responseText));
            } else {
                reject();
            }
        }

        req.send();
    });
}

extModule.processApi = function(responseObject) {
    if (!responseObject || typeof responseObject.main == undefined ||
        !responseObject.main
    ) {
        return;
    } else {
        var temp = Math.round(responseObject.main.temp),
            description = responseObject.weather[0].description;
    }

    extModule.target.innerHTML = description + ' ' + temp;
}


module.init = function() {
    timeModule.init();
    bgModule.init();
    extModule.init();
};

module.init();

}());
