# LA Metro Map

<a href="https://u8k.github.io/la-metro-map/">LIVE LINK</a>

This is a project for Udacity's FullStack NanoDegree program.

To run your own instance of this code simply open the 'index.html' in a web browser.

-----------------------

The initial idea, was to make calls to LA Metro's API to load in all the station data. But I quickly realized that was silly, as the locations of metro stations aren't exactly subject to frequent changes. Pinging api.metro.net at every single refresh to collect the exact same data every single time is unnecesary. The displayed data is still provided by Metro, but I've saved a local copy. Their <a href="http://developer.metro.net/">API</a> is lovely, btw.

The little text blurb descriptions on each stop are via <a href="https://www.mediawiki.org/wiki/API:Main_page">Wikipedia</a>.
