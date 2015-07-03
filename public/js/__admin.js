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
