module.exports = function template(data) {
    return `<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
        ${ !data.noConsole ? `<style>${data.style}</style>` : ''}
    </head>
    ${ !data.noConsole ? `
        <div id="container">
            <input id="log-filter" type="checkbox" checked><label for="log-filter">Log</label>
            <input id="debug-filter" type="checkbox" checked><label for="debug-filter">Debug</label>
            <input id="warning-filter" type="checkbox" checked><label for="warning-filter">Warning</label>
            <input id="error-filter" type="checkbox" checked><label for="error-filter">Errors</label>

            <div id="output"></div>
        </div>

        <script>${data.consoleScript}</script>
    ` : '' }
    <script src="script.js"></script>
</html>`;
}