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
