/* eslint prefer-rest-params: 0 no-var: 0 */
function bindConsole() {
  var container = document.getElementById('container');
  var output = document.getElementById('output');
  var console = window.console || (window.console = {});

  function bind(func, context) {
    if (typeof func.bind === 'function') {
      // ES5 browsers
      return func.bind(context);
    }

    if (typeof func.apply === 'function') {
      // Pre-ES5 browsers
      return function logExec() {
        func.apply(context, arguments);
      };
    }

    // Old IE doesn't care about context
    // and has no `.apply` on native functions
    return func;
  }

  function noop() {}

  function logger(type, oldLog) {
    var boundLogger = bind(oldLog || noop, console);

    return function consoleLog() {
      var node = document.createElement('pre');
      var isScrolled = container.scrollTop === container.scrollHeight - container.offsetHeight;
      var message = Array.prototype.join.call(arguments, ' ');

      boundLogger(message);

      node.className = type;
      node.appendChild(document.createTextNode(message));
      output.appendChild(node);
      output.appendChild(document.createTextNode('\r\n'));

      // Scroll to bottom if it was previously scrolled to the bottom
      if (isScrolled) {
        container.scrollTop = container.scrollHeight - container.offsetHeight;
      }
    };
  }

  console.log = logger('log', console.log);
  console.debug = logger('debug', console.debug);
  console.info = logger('info', console.info);
  console.warn = logger('warn', console.warn);
  console.error = logger('error', console.error);
}

bindConsole();
