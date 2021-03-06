goog.provide('plt.wescheme.topKeymap');
goog.require('plt.wescheme.BrowserDetect');


//FIXME: depends on global variable myEditor at toplevel.


//The following is a global keyhandler that's intended to be attached
//to the document body, so it should see all key events.
plt.wescheme.topKeymap = function(e) {
	var F5_KEYCODE = 116
	var BACKSPACE_KEYCODE = 8;
	var SAVE_KEYCODE = 83;

	if (e.keyCode === SAVE_KEYCODE &&
			(plt.wescheme.BrowserDetect.OS==="Mac" ? e.metaKey : e.ctrlKey)) {
		myEditor.save();
		e.cancelBubble = true;
		if (e.stopPropagation) { e.stopPropagation(); }
		e.returnValue = false;
		if (e.preventDefault) { e.preventDefault(); }
		if (! e.preventDefault) {
			// IE-specific hack.
			e.keyCode = 0;
		}
		return false;
	}

	if (e.keyCode === F5_KEYCODE) {
		myEditor.run();
		e.cancelBubble = true;
		if (e.stopPropagation) { e.stopPropagation(); }
		e.returnValue = false;
		if (e.preventDefault) { e.preventDefault(); }
		if (! e.preventDefault) {
			// IE-specific hack.
			e.keyCode = 0;
		}
		return false;
	}

	// Special case: we want to intercept all backspaces that hit the
	// document body, and prevent us from going back in history.
	if (e.target === document.body) {
		if (e.keyCode === BACKSPACE_KEYCODE) {
			e.cancelBubble = true;
			if (e.stopPropagation) { e.stopPropagation(); }
			e.returnValue = false;
			if (e.preventDefault) { e.preventDefault(); }
			return false;
		}
	}

	return true;
}



