'use strict';

var path = require('path'),
    app = require('./node_modules/gulp-live-server/node_modules/connect')(),
    lr = require('./node_modules/gulp-live-server/node_modules/connect-livereload')(),
    _static = require('./node_modules/gulp-live-server/node_modules/serve-static'),
    host = '0.0.0.0',
    port = 3000;

/*
 * Simple hack to always return the
 * index page since this is a Single
 * Page Application or SPA.
 */
app.use(function(req, res, next) {
    if(/\.[0-9a-z]+$/.test(req.url))
        return next();
    req.url = '/';
    next();
});
app.use(lr);
app.use(_static(__dirname));

app.listen(port, host, function () {
    console.log('custom server listening at http://%s:%s', host, port);
});