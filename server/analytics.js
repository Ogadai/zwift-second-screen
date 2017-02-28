const fs = require('fs');

module.exports = function insertAnalytics(htmlPath, settings) {
    const html = fs.readFileSync(htmlPath, { encoding: 'utf8' });
    const scriptIndex = html.indexOf('<script');
    const analyticsCode = getAnalyticsCode(settings.trackingId);

    return `${html.substring(0, scriptIndex)}${analyticsCode}${html.substring(scriptIndex)}`;
}

function getAnalyticsCode(trackingId) {
    return `<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga.trackingId = '${trackingId}'

  ga('create', '${trackingId}', 'auto');
  ga('send', 'pageview');

</script>`;
}