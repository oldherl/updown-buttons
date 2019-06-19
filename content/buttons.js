(new function() {
    
    var up, dn, contentEl, options, display = true, beforeFullScreenDisplay = null;
    var container;
    var prevDocumentHeight = 0;
    var displayState = {up: null, dn: null};
    var buttonsActive = true;

    function getDocumentHeight() {
        return Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        ) - 1;
    }

    function hasScroll() {
        return getDocumentHeight() > window.innerHeight;
    }

    function scrollTo(element, to) {
        /*if (options.scroll === 'instant') {
            element.scrollTop = to;
            return;
        }*/

        element.scroll({
            top:      to,
            left:     element.scrollLeft,
            behavior: options.scroll // smooth || instant
        });
    }

    function isMobile() {
        return navigator.userAgent.match(/(android|iphone|ipad)/i);
    }

    function applyBtnOptions(buttonType, btn, options) {
        var style = {
            'opacity': ((100 - undInt(options.opacity))/100),
            'width':   options.size + 'px',
            'height':  options.size + 'px'
        };

        if (options.display === 'auto-hide') {
            display = false;
            style.display = 'none';
        }
        applyCss(btn, style);

        btn.className = 'pund-addon-play-btn pund-addon-play-side-' + options.position + (isMobile() ? ' ' : ' pund-addon-btn-hoverable');
    }

    function applyCss(dom, style) {
        for (var s in style) if (style.hasOwnProperty(s)) dom.style[s] = style[s];
    }

    function createButtonDOM(buttonType, options) {
        var btn = document.createElement('span');
        var getImgUrl = typeof browser !== 'undefined' ?
            browser.extension.getURL :
            chrome.runtime.getURL;

        btn.setAttribute('id', 'pund-addon-play-btn-' + buttonType);
        btn.style.backgroundImage = "url('" + getImgUrl("img/arrow-" + buttonType + ".svg") + "')";
        applyBtnOptions(buttonType, btn, options);
        container.appendChild(btn);
        return btn;
    }

    function createContainerDom(options) {
        container = document.createElement('span');
        container.setAttribute('id', 'pund-addon-container');

        applyContainerOptions(options);
        document.body.appendChild(container);

        return container;
    }

    function applyContainerOptions(options) {
        var sz  = undInt(options.size);
        var css = {
            'height': sz*2 + 1 + 'px',
            'width':  sz       + 'px',
            'right':  'auto',
            'left':   'auto',
            'top':    '40%',
            'bottom': 'auto',
            'margin-left': 0
        };

        if (options.position === 'left') {
            css['left']   = 0;
        } else if (options.position === 'bottom') {
            css['top']    = 'auto';
            css['bottom'] = 0;
            css['left']   = '50%';
            css['width']  = sz*2 + 3 + 'px';
            css['height'] = sz       + 'px';
            css['margin-left'] = -sz-2 + 'px';
        } else {
            // right
            css['right']  = 0;
        }

        container.setAttribute('data-w', css['width']);
        container.setAttribute('data-h', css['height']);

        applyCss(container, css);
        updateEdgeView();
    }

    function updateEdgeView() {
        var sz  = undInt(options.size);
        var css = {
            'padding-left':  0,
            'padding-right': 0,
            'padding-top':   0,
            'width':         container.getAttribute('data-w'),
            'height':        container.getAttribute('data-h')
        };
        if (!buttonsActive) {
            var edgeSpacer  = sz * 0.25 + 'px';
            var edgeHotSpot = sz / 2    + 'px';

            if (options.position === 'left') {
                css['padding-right'] = edgeSpacer;
                css['width']         = edgeHotSpot;
            } else if (options.position === 'bottom') {
                css['padding-top']   = edgeSpacer;
                css['height']        = edgeHotSpot;
            } else {
                // right
                css['padding-left'] = edgeSpacer;
                css['width']        = edgeHotSpot;
            }
        }
        applyCss(container, css);
    }

    function containerClicked() {
        if (options.display !== 'edge') return;
        buttonsActive = !buttonsActive;
        updateEdgeView();
    }

    function scrollButtonClicked(ev) {
        if (!buttonsActive) return;
        
        var scrollto = 0;
        var top_fixed_margin = 80;
        var window_height = window.innerHeight - top_fixed_margin;
        if (ev.target.getAttribute('id') === 'pund-addon-play-btn-up') {
       
            scrollto =  Math.max( 0, window.pageYOffset - window_height);
            scrollTo(window, scrollto)
            //scrollTo(window, 0);
        } else {
             scrollto =  Math.min(getDocumentHeight(), window.pageYOffset + window_height);
            //scrollTo(window, getDocumentHeight())
        }
        scrollTo(window,  scrollto)
    }

    function createButtons(options) {
        if(!window || !document || !document.body) return;

        setDisplayMode(options.display);

        container = createContainerDom(options);
        container.addEventListener('click', containerClicked, false);

        up = createButtonDOM('up', options);
        dn = createButtonDOM('dn', options);

        up.addEventListener('click', scrollButtonClicked, false);
        dn.addEventListener('click', scrollButtonClicked, false);

        window.addEventListener('scroll', onScroll);
        window.addEventListener('resize', onResize);
        setOnFullScreen();

        onScroll();
        setTimeout(function () {
            onResize();
            setInterval(checkDocHeight, 1000);
        }, 500);
    }

    function checkDocHeight() {
        var h = getDocumentHeight();
        if (h === prevDocumentHeight) return;
        prevDocumentHeight = h;
        onResize();
    }

    function setDisplayMode(mode) {
        buttonsActive = options.display !== 'edge';

        if (mode === 'auto-hide') window.addEventListener('mousemove', onMouseMove);
        else {
            window.removeEventListener('mousemove', onMouseMove);
            display = mode !== 'never';
        }
    }

    function controlsVisibility(showUp, showDn) {
        if (
            displayState.up === showUp &&
            displayState.dn === showDn
        ) return;

        up.style.display = showUp ? "block" : "none";
        dn.style.display = showDn ? "block" : "none";

        if (showDn) {
            var top   = 0;
            var left  = 0;
            if (options.position === 'bottom') {
                if (showUp) top = -options.size + 'px';
                left = undInt(options.size) + 3 + 'px';
            } else {
                top  = (showUp ? 1 : undInt(options.size) + 1) + 'px';
            }
            dn.style.margin = top + ' 0 0 ' + left;
        }

        if (!showUp && !showDn) container.style.display = 'none';
        else container.style.display = 'block';

        displayState.up = showUp;
        displayState.dn = showDn;
    }

    function onScroll() {
        var
            scrolled  = Math.round(window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop),
            heightDif = getDocumentHeight() - window.innerHeight;

        if (options.display === 'edge' && buttonsActive) {
            buttonsActive = false;
            updateEdgeView();
        }

        controlsVisibility(
            display && scrolled > 0,
            display && scrolled < heightDif
        );
    }

    function onResize() {
        contentEl = /CSS/.test(document.compatMode) ? document.documentElement : document.body;

        if (display && hasScroll()) {
            onScroll();
        } else {
            controlsVisibility(false, false);
        }
    }

    function onFullScreenChanged() {
        var full =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement;
        if (full && full.tagName === 'HTML' && full.baseURI && full.baseURI.indexOf('https://www.youtube.com') === 0) {
            beforeFullScreenDisplay = display;
            display = false;
        } else {
            display = beforeFullScreenDisplay;
        }
        onScroll();
    }

    function setOnFullScreen() {
        document.addEventListener("fullscreenchange",       onFullScreenChanged);
        document.addEventListener("webkitfullscreenchange", onFullScreenChanged);
        document.addEventListener("mozfullscreenchange",    onFullScreenChanged);
        document.addEventListener("MSFullscreenChange",     onFullScreenChanged);
    }

    function onMouseMove(event) {
        var w = 0, h = 0;
        var pos = '' + options.position;
        var sz  = undInt(options.size);

        switch (pos) {
            case 'right':  w = window.innerWidth  - sz - 50; break;
            case 'left':   w =                      sz + 50; break;
            case 'bottom': h = window.innerHeight - sz - 50; break;
        }

        var x = event.clientX;
        var y = event.clientY;

        if (
            (pos === 'right'  && (x >= w && !display || x <  w &&  display)) ||
            (pos === 'left'   && (x <= w && !display || x >  w &&  display)) ||
            (pos === 'bottom' && (y >= h && !display || y <  h &&  display))
        ) {
            display = !display;
            if (!up || !dn) return;
            onScroll();
        }
    }

    /**
     * remove previously created buttons
     * needed whe add-on get's reloaded
     */
    function removeOld() {
        var old = document.getElementById('pund-addon-container');
        if (old) old.parentNode.removeChild(old);

        old = document.body.getElementsByClassName('pund-addon-play-btn');
        if (!old || !old.length) return;
        for (var o = old.length-1; o >= 0; o--) {
            if (!old.hasOwnProperty(o)) continue;
            var el = old[0]; // TODO: Check if error "o" not "0"
            el.parentNode.removeChild(el);
        }
    }

    function listenToTheOptionsUpdates() {
        var browser = browser || chrome;
        browser.storage.onChanged.addListener(function(changes, area) {
            if (area !== 'local') return;

            var update = false;
            for(var c in changes ) if (
                changes.hasOwnProperty(c) &&
                options.hasOwnProperty(c)
            ) {
                options[c] = changes[c].newValue;
                update = true;
            }

            if (update) {
                displayState = {up: null, dn: null};
                setDisplayMode(options.display);
                applyContainerOptions(options);
                applyBtnOptions('up', up, options);
                applyBtnOptions('dn', dn, options);
                onScroll();
            }
        });
    }

    this.runIt = function(){
        if (window.self !== window.top) return; // skip iFrames
        removeOld();
        undOptionsStorage.load(function(savedOptions){
            options = savedOptions;
            createButtons(savedOptions);
            listenToTheOptionsUpdates();
        });
    };

    return this;

}).runIt();
