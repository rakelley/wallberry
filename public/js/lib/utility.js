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
