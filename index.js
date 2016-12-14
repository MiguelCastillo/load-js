(function(global, factory) {
  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    // CommonJS support
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    // Do AMD support
    define(["loadJS"], factory);
  } else {
    // Do browser support
    global.loadJS = factory();
  }
})(this, function() {
  function loadScript(url, id) {
    var head   = document.getElementsByTagName("head")[0] || document.documentElement;
    var script = document.createElement("script");

    script.setAttribute("async",   "true");
    script.setAttribute("charset", "utf-8");
    script.setAttribute("type",    "text/javascript");
    script.setAttribute("src",     url);

    if (id) {
      script.id = id;
    }

    //
    // Code from:
    // http://stackoverflow.com/questions/4845762/onload-handler-for-script-tag-in-internet-explorer
    // http://stevesouders.com/efws/script-onload.php
    //

    return new Promise(function(resolve) {
      // Handle Script loading
      var done = false;

      // Attach handlers for all browsers
      script.onload = script.onreadystatechange = function() {
        if (!done && (!this.readyState ||
              this.readyState === "loaded" ||
              this.readyState === "complete")) {
          done = true;

          // Get the module id that just finished and load it up!
          // var loadedSrc = script.getAttribute("src");

          // Handle memory leak in IE
          script.onload = script.onreadystatechange = null;
          if (head && script.parentNode) {
            head.removeChild(script);
          }

          resolve();
        }
      };

      head.appendChild(script);
    });
  }

  return loadScript;
});
