(function() {
    var body = document.getElementsByTagName('body')[0],
        output = document.getElementById('output');

    function logger(type, oldLog) {
        oldLog = oldLog || function() { };

        return function() {
            var isScrolled = (body.scrollTop ===
                (body.scrollHeight - body.offsetHeight));

            var message = Array.prototype.join.call(arguments, ' ');
            oldLog(message);

            var node = document.createElement('pre');
            node.className = type;
            node.appendChild(document.createTextNode(message));
            output.appendChild(node);
            output.appendChild(document.createTextNode('\r\n'));

            // Scroll to bottom if it was previously scrolled to the bottom
            if (isScrolled) {
                body.scrollTop = body.scrollHeight - body.offsetHeight;
            }
        };
    }

    var console = window.console || (window.console = {});
    console.log = logger('log', console.log);
    console.debug = logger('debug', console.debug);
    console.info = logger('info', console.info);
    console.warn = logger('warn', console.warn);
    console.error = logger('error', console.error);
})();
