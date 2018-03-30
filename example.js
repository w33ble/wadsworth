/* eslint no-console: 0 */
(function example() {
  console.log('Test message');
  console.log('I am in ur browsers');
  console.error('Help! An error!');
  console.log('See Ma,', 'multiple', 'args!');
  console.warn('Warning!');
  console.debug('Debug message');

  let count = 0;
  function doLog() {
    if (count > 50) return;

    count += 1;

    console.log('Doing something', count);
    setTimeout(doLog, Math.random() * 1000);
  }

  doLog();
})();
