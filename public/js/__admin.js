var admin = {},
    utility = require('./lib/utility');


admin.init = function() {
    admin.adddirForm();
    admin.deldirForm();
};

admin.adddirForm = function(formSelector, inputSelector) {
    formSelector = formSelector || '.js-form_adddir';
    inputSelector = inputSelector || 'input[data-form_adddir-target]';

    var form = document.querySelector(formSelector);
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var url = '/backgrounds/' + form.querySelector(inputSelector).value,
            type = form.getAttribute('method');
        utility.simpleAjax(url, type).then(
            function() { location.reload(); },
            function() { location.reload(); }
        );
    });
};

admin.deldirForm = function(formSelector, inputSelector) {
    formSelector = formSelector || '.js-form_deldir';
    inputSelector = inputSelector || 'input[data-form_deldir-target]';

    var form = document.querySelector(formSelector);
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var url = '/backgrounds/' + form.querySelector(inputSelector).value,
            type = form.getAttribute('method');
        utility.simpleAjax(url, type).then(
            function() { location.reload(); },
            function() { location.reload(); }
        );
    });
};

admin.init();
