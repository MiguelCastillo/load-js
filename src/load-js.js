function createLoadJS() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return false;
  }

  var cache = {};
  var head = document.getElementsByTagName("head")[0] || document.documentElement;

  function exec(options) {
    if (typeof options === "string") {
      options = {
        url: options
      };
    }

    var cacheId = options.id || options.url;
    var cacheEntry = cache[cacheId];

    if (cacheEntry) {
      console.log("load-js: cache hit", cacheId);
      return cacheEntry;
    }
    else if (options.allowExternal !== false) {
      var el = getScriptById(options.id) || getScriptByUrl(options.url);

      if (el) {
        var promise = Promise.resolve(el);

        if (cacheId) {
          cache[cacheId] = promise;
        }

        return promise;
      }
    }

    if (!options.url && !options.text) {
      throw new Error("load-js: must provide a url or text to load");
    }

    var pending = (options.url ? loadScript : runScript)(head, createScript(options));

    if (cacheId && options.cache !== false) {
      cache[cacheId] = pending;
    }

    return pending;
  }

  function runScript(head, script) {
    head.appendChild(script);
    return Promise.resolve(script);
  }

  function loadScript(head, script) {
    return new Promise(function(resolve, reject) {
      // Handle Script loading
      var done = false;

      // Attach handlers for all browsers.
      //
      // References:
      // http://stackoverflow.com/questions/4845762/onload-handler-for-script-tag-in-internet-explorer
      // http://stevesouders.com/efws/script-onload.php
      // https://www.html5rocks.com/en/tutorials/speed/script-loading/
      //
      script.onload = script.onreadystatechange = function() {
        if (!done && (!script.readyState || script.readyState === "loaded" || script.readyState === "complete")) {
          done = true;

          // Handle memory leak in IE
          script.onload = script.onreadystatechange = null;
          resolve(script);
        }
      };

      script.onerror = reject;

      head.appendChild(script);
    });
  }

  function createScript(options) {
    var script = document.createElement("script");
    script.charset = options.charset || "utf-8";
    script.type = options.type || "text/javascript";
    script.async = !!options.async;
    script.id = options.id || options.url;
    script.loadJS = "watermark";

    if (options.url) {
      script.src = options.url;
    }

    if (options.text) {
      script.text = options.text;
    }

    return script;
  }

  function getScriptById(id) {
    var script = id && document.getElementById(id);

    if (script && script.loadJS !== "watermark") {
      console.warn("load-js: duplicate script with id:", id);
      return script;
    }
  }

  function getScriptByUrl(url) {
    var script = url && document.querySelector("script[src='" + url + "']");

    if (script && script.loadJS !== "watermark") {
      console.warn("load-js: duplicate script with url:", url);
      return script;
    }
  }

  return function load(items) {
    return items instanceof Array ?
      Promise.all(items.map(exec)) :
      exec(items);
  }
}

module.exports = createLoadJS();
module.exports.create = createLoadJS;
