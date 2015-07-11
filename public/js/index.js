(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var index = {},
    timeModule = require('./lib/datetime'),
    bgModule = require('./lib/background'),
    extModule = require('./lib/exterior'),
    intModule = require('./lib/interior');


index.init = function() {
    timeModule();

    bgModule();

    var exteriorTarget = extModule();

    var interiorActive = intModule();

    if (interiorActive) {
        exteriorTarget.classList.remove('info_bar-item-large');
    } else {
        exteriorTarget.classList.add('info_bar-item-large');
    }
};

index.init();

},{"./lib/background":2,"./lib/datetime":3,"./lib/exterior":4,"./lib/interior":5}],2:[function(require,module,exports){
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
    utility.simpleAjax('random', 'get').then(
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

},{"./utility":6}],3:[function(require,module,exports){
var timeModule = {};

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


module.exports = timeModule.init;

},{}],4:[function(require,module,exports){
var exterior = {},
    utility = require('./utility');

exterior.init = function(selector, delay) {
    selector = selector || '.info_bar-w_exterior';
    delay = delay || 1000;

    exterior.target = document.querySelector(selector);

    exterior.updateWeather();
    window.setInterval(exterior.updateWeather, delay * 1000);

    return exterior.target;
};

exterior.updateWeather = function() {
    utility.simpleAjax('exterior', 'get').then(
        function(response) { exterior.processApi(response); },
        function() { return; }
    );
};

exterior.processApi = function(responseObject) {
    if (!responseObject || typeof responseObject.main == undefined ||
        !responseObject.main
    ) {
        return;
    } else {
        var temp = Math.round(responseObject.main.temp),
            description = utility.escapeStr(responseObject.weather[0].description);
    }

    exterior.target.innerHTML = description + ' ' + temp;
};


module.exports = exterior.init;

},{"./utility":6}],5:[function(require,module,exports){
var interior = {},
    utility = require('./utility');

interior.init = function(selector, delay) {
    selector = selector || '.info_bar-w_interior';
    delay = delay || 300;

    interior.target = document.querySelector(selector);

    interior.updateTemperature();
    window.setInterval(interior.updateWeather, delay * 1000);
    return interior.active;
};

interior.active = false;

interior.updateTemperature = function() {
    utility.simpleAjax('interior', 'get').then(
        function(response) { interior.processTemp(response); },
        function() { return; }
    );
};

interior.processTemp = function(responseObject) {
    if (!responseObject || typeof responseObject.temp == undefined ||
        !responseObject.temp
    ) {
        interior.active = false;
        utility.hide(interior.target);
    } else {
        var temp = Math.round(responseObject.temp);
        interior.target.innerHTML = temp;
        utility.show(interior.target);
        interior.active = true;
    }
};


module.exports = interior.init;

},{"./utility":6}],6:[function(require,module,exports){
var utility = {};

utility.simpleAjax = function(url, type) {
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

utility.escapeStr = function(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

utility.hide = function(el) {
    el.classList.remove('show');
    el.classList.add('hide');
};

utility.show = function(el) {
    el.classList.remove('hide');
    el.classList.add('show');
};


module.exports = utility;

},{}]},{},[1]);
