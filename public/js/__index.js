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
