function undInt(value) {
    if (typeof value === 'number') return value;
    return parseInt(value);
}

var undOptionsStorage = new function(){

    var options = {};
    var defaultOptions = {
        opacity:  60,
        size:     36,
        scroll:   'smooth',
        display:  'always',
        position: 'right'
    };

    this.save = function(newOptions) {
        for(var o in options) {
            if (
                !options.hasOwnProperty(o) ||
                typeof newOptions[o] === 'undefined'
            ) continue;
            options[o] = newOptions[o];
        }

        if (typeof browser !== 'undefined') {
            browser.storage.local.set(options);
        } else {
            chrome.storage.local.set(options);
        }
    };

    this.load = function(onLoad) {
        for (var o in defaultOptions) if (defaultOptions.hasOwnProperty(o)) options[o] = defaultOptions[o];

        function onError(error) {
            console.log("Options load error: " + error);
            onLoad(options);
        }

        function onGot(loadedOptions) {
            if (!loadedOptions) {
                onLoad(options);
                return;
            }

            if (typeof loadedOptions[0] !== 'undefined') loadedOptions = loadedOptions[0];

            // migrate old version option. this can be removed in next versions (added: 20.11.17)
            if (
                loadedOptions['speed'] &&
                !loadedOptions['scroll']
            ) loadedOptions['scroll'] = loadedOptions['speed'] === 'instant' ? 'instant' : 'smooth';

            for (var o in loadedOptions) {
                if (
                    !loadedOptions.hasOwnProperty(o) ||
                    typeof options[o] === 'undefined'
                ) continue;
                options[o] = loadedOptions[o];
            }
            onLoad(options);
        }

        if (typeof browser !== 'undefined') { // firefox way
            var get = browser.storage.local.get();
            get.then(onGot, onError);
        } else { // chrome way
            var keys = [];
            for (var k in defaultOptions) if (defaultOptions.hasOwnProperty(k)) keys.push(k);
            chrome.storage.local.get(keys, onGot);
        }
    };

    this.getDefaultOptions = function() {
        var ops = {};
        for (var o in defaultOptions) if (defaultOptions.hasOwnProperty(o)) ops[o] = defaultOptions[o];
        return ops;
    };

    return this;

};