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
