import sprintf from 'alexei/sprintf.js';
import Http from './http';

/**
 * Logger
 * simple wrapper to console with the added
 * conveniece of piping to server when
 * enabled...nothing earth shattering.
 * @class
 */
class Logger {

    constructor(conf) {

        if(Logger.instance)
            return Logger.instance;

        // enabled just accept defaults.
        if(conf === true)
            conf = {};

        // supported levels: 'error', 'warn', 'info', 'debug'.
        var defaults = {
            console:        undefined,         // when NOT false messages are logged to the console.
            remote:         false,             // when true logs are posted to server, if false console only.
            level:          'info',            // current log level.
            method:         'POST',            // method to use to post to server.
            url:            '/api/log/client'  // the server endpoint for client logging.
        }, httpConf;

        // maps level name to number
        // used in determining whether
        // to log the message.
        this.map = {
            error:  3,
            warn:   2,
            info:   1,
            log:    0,
            debug:  0
        };

        // save our options.
        var options = {};
        for(var prop in defaults){
            if(defaults.hasOwnProperty(prop))
                options[prop] = conf[prop] || defaults[prop];
        }
        this.options = options;

        // get instance of Http.
        this.http = new Http(this.options);

        // set log level
        this.level = this.options.level;

        return this;

    }

    /**
     * Base method other log levels call.
     * @param args - message, string substitutions type and metadata to log.
     * @returns {Logger}
     */
    by(...args) {

        var type = args.shift(),
            msg = args.shift(),
            clone = args.slice(0),
            sublen = (msg.match(/%/g) || []).length,
            conf = this.options,
            activeLevel = this.map[this.level],
            http = this.http,
            reqLevel;

        // check if we should log.
        reqLevel = this.map[type];

        if(reqLevel < activeLevel)
            return this;

        // try to get http we
        // call it here because Logger
        // is initialized before the
        // angular app hence we check
        // if can be loaded.
        //http = this.http();

        // check substitution chars
        // if length format message
        // trim args.
        if(sublen)
            clone.splice(0, sublen);

        // check for string substitution.
        msg = vsprintf(msg, args);
        clone.unshift(msg);

        // post to server.
        if(this.options.remote && this.options.url && http){
            conf.data = { message: msg };
            conf.data.metadata = clone;
            http.post(conf);
        }

        // log to the console.
        if(this.options.console !== false && console){
            let log = console[type];
            // if type is not valid fallback
            // to console.log.
            if(!log)
                log = console.log;
            if(log)
                log.apply(console, clone);
        }

        return this;

    }

    /**
     * Log error.
     * @param args - message, string substitutions type and metadata to log.
     * @returns {Logger}
     */
    error(...args) {
        args.unshift('error');
        return this.by.apply(this, args);
    }

    /**
     * Log warn.
     * @param args - message, string substitutions type and metadata to log.
     * @returns {Logger}
     */
    warn(...args) {
        args.unshift('warn');
        return this.by.apply(this, args);
    }

    /**
     * Log info.
     * @param args - message, string substitutions type and metadata to log.
     * @returns {Logger}
     */
    info(...args) {
        args.unshift('info');
        return this.by.apply(this, args);
    }

    /**
     * Log debug (console.log).
     * @param args - message, string substitutions type and metadata to log.
     * @returns {Logger}
     */
    debug(...args) {
        args.unshift('debug');
        return this.by.apply(this, args);
    }

}

Logger.instance = undefined;

export default Logger;