var options;

function onLoad() {
    setInputsEvents();
    document.getElementById('reset').addEventListener('click', reset);
    hideDeviceOptions();
    loadOptions();
}

function isMobile() {
    return navigator.userAgent.match(/(android|iphone|ipad)/i);
}

function hideDeviceOptions() {
    var hideClass = 'hide-on-' + (isMobile() ? 'mobile' : 'desktop');
    var elements  = document.getElementsByClassName(hideClass);
    for (var e in elements) {
        if (elements.hasOwnProperty(e)) elements[e].style.display = 'none';
    }
}

function setInputsEvents() {
    var inputs = document.getElementsByTagName('input');
    for (var i in inputs) {
        if (!inputs.hasOwnProperty(i)) continue;

        var input = inputs[i];

        if (typeof input !== 'object') continue;

        if (input.type === 'range') {
            input.addEventListener('input',  rangeChanged);
        }

        input.addEventListener('change', saveOptions);
    }
}

function rangeChanged(ev) {
    var range   = ev.target;
    var valNode = document.getElementById( range.getAttribute('id') + '-val' );
    valNode.innerText = range.value;

    options[range.name] = range.value;
    updatePreview();
}

function updatePreview() {
    var preview = document.getElementsByClassName('preview')[0];

    var style = {
        'opacity': (undInt(options.opacity))/100,
        'width':   options.size + 'px',
        'height':  options.size + 'px',
        'visibility':  'visible',
        'line-height':  options.size + 'px',
        'font-size':  options.size * 0.8 + 'px',
    };
    for (var s in style) if (style.hasOwnProperty(s)) preview.style[s] = style[s];
}

function saveOptions() {
    updateOptionsFromInputs();
    updatePreview();
    undOptionsStorage.save(options);

    document.getElementById('apply-msg').style.display       = 'block';
    document.getElementById('msg-placeholder').style.display = 'none';
}

function loadOptions() {
    undOptionsStorage.load(updateOptionsInputs);
}

function updateOptionsFromInputs() {
    for(var o in options) {
        if (!options.hasOwnProperty(o)) continue;

        var els  = document.getElementsByName(o);
        if (!els.length) continue;

        for(var e in els) {
            if (!els.hasOwnProperty(e)) continue;

            var el = els[e];
            if (typeof el !== 'object') continue;

            if (el.type === 'radio') {
                if (el.checked) options[o] = el.value;
            } else {
                options[o] = el.value;
            }
        }
    }
}

function updateOptionsInputs(newOptions) {
    options = newOptions;
    for (var o in options) {
        if (!options.hasOwnProperty(o)) continue;

        var els = document.getElementsByName(o);
        var val = options[o];

        if (!els.length) continue;

        for(var e in els) {
            if (!els.hasOwnProperty(e)) continue;

            var el = els[e];
            if (typeof el !== 'object') continue;

            if (el.type === 'radio') {
                if (el.value === val) el.checked = true;
            } else {
                el.value = val;
                if (el.type === 'range') rangeChanged({target: el});
            }
        }
    }
    updatePreview();
}

function reset() {
    var options = undOptionsStorage.getDefaultOptions();
    updateOptionsInputs(options);
    saveOptions();
}

document.addEventListener("DOMContentLoaded", onLoad);
