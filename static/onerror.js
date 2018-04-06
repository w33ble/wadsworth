/* eslint no-var: 0 prefer-template: 0 */
function windowOnError() {
  var output = document.getElementById('errors');

  function logError(message, source, lineno, colno) {
    const line = message + ' in ' + source + ', line ' + lineno + ':' + colno;
    const node = document.createElement('pre');
    node.appendChild(document.createTextNode(line));
    output.appendChild(node);
    output.appendChild(document.createTextNode('\r\n'));
  }

  window.onerror = logError;
}

windowOnError();
