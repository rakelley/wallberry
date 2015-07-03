(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var admin = {},
    utility = require('./lib/utility');


admin.init = function() {
    admin.backgroundForm('form[data-form_adddir]',
                         'input[data-form_adddir-target]');
    admin.backgroundForm('form[data-form_deldir]',
                         'input[data-form_deldir-target]');
};

admin.backgroundForm = function(formSelector, inputSelector) {
    var form = document.querySelector(formSelector),
        input = form.querySelector(inputSelector);

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var url = '/backgrounds/' + input.value,
            type = form.getAttribute('method');
        utility.simpleAjax(url, type).then(
            function() { location.reload(); },
            function() { location.reload(); }
        );
    });
};

admin.init();

},{"./lib/utility":2}],2:[function(require,module,exports){
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
