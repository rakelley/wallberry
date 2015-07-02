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
