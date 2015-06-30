/**
 * Http
 * trivial class for making XMLHttpRequests
 */
class Http {

    /**
     * Constructs Http
     * @constructor
     * @param options - base options for making requests.
     * @returns {Http}
     */
    constructor(options) {

        // options should be provided
        // in camel case they will be
        // broken out hyphenated.
        var defaults = {
            async: true,
            headers: {
                xRequestedWith: 'XMLHttpRequest',
                contentType: 'application/json'
            },
            username: undefined,
            password: undefined
        };

        // merge options.
        this.options = this.extend({}, defaults, options);

        return this;
    }

    /**
     * Simple options extend method.
     * @param args
     * @returns {object}
     */
    extend(...args) {
        var out = {};
        // new replaces current
        // unless its undefined.
        function compare(c,n){
            if(c === undefined)
                return n;
            if(n === undefined)
                return c;
            return n;
        }
        // iterate array of objects
        // where newer values replace
        // older values.
        args.forEach( obj => {
            // if out is undefined
            // set first obj.
            obj = obj || {};
            if(!Object.keys(out).length)
                return out = obj;
            Object.keys(obj).forEach( key => {
                out[key] = compare(out[key], obj[key]);
            });
        });
        return out;
    }

    /**
     * Expands camelcase property key.
     * ex: contentType becomes Content-Type.
     * @param key
     * @returns {string}
     */
    expandKey(key) {
        return key.replace(/([a-z](?=[A-Z]))/g, '$1-').toUpperCase();
    }

    /**
     * Builds query string from params object.
     * @param obj - the object of params.
     * @returns {string}
     */
    buildQuery(obj){
        var val = '',
            encode = encodeURIComponent;
        for(let key in obj){
            if(obj.hasOwnProperty(key))
                val += '&' + encode(key) +
                    '=' + encode(obj[key]);
        }
        return val.slice(1);
    }

    /**
     * Test/parse JSON data.
     * @param res
     * @returns {*}
     */
    tryParseJSON(res){
        try {
            if(typeof res.response === 'string')
                return JSON.parse(res.response);
            return res.response;
        } catch(ex){
            return res.responseText;
        }
    }

    /**
     * Normalize get, post, put & del arguments.
     * @param type - the type of args to normalize.
     * @param args - the arguments.
     * @returns {*[]}
     */
    normalize(type, ...args) {

        var options = {},
            url,
            cb;

        if(typeof args[0] === 'object'){
            options = args.shift();
            cb = args.shift();
        } else {
            url = args.shift();
            if(typeof args[0] === 'function'){
                options.url = url;
                cb = args.shift();
            }
            else {
                if(type === 'get' || type === 'del'){
                    options.params = args.shift();
                    cb = args.shift();
                }
                else {
                    if(args.length === 3){
                        options.params = args.shift();
                        options.data = args.shift();
                        cb = args.shift();
                    } else {
                        options.data = args.shift();
                        cb = args.shift();
                        options.params = undefined;
                    }
                }
            }
        }
        return this.req(options, cb);
    }

    /**
     * Performs the XMLHttpRequest.
     * @param options - options containing method, url, headers, data & params.
     * @param [cb] - callback on state change.
     */
    req(options, cb) {

        var self = this,
            req, params, data;

        // extend options.
        options = this.extend({}, this.options, options);

        params = options.params;
        if(params){
            params = this.buildQuery(params);
            options.url += ('?' + params);
        }

        data = options.data ? JSON.stringify(options.data) : '';

        if(options.method === 'del')
            options.method = 'DELETE';

        // build array of params for open.
        // accepts: method, url, async, username, password.
        var arr = [options.method, options.url, options.async, options.username, options.password];

        function parseResponse(res) {
            var parsed = self.tryParseJSON(res),
                obj;
            obj = {
                status: res.status,
                statusText: res.statusText,
                url: res.responseURL,
                data: parsed
            };
            return obj;
        }

        return new Promise(function (resolve, reject) {

            // get request
            req = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');

            // open the connection.
            req.open.apply(req, arr);

            // iterate and set headers.
            Object.keys(options.headers).forEach(h => {
                let val = options.headers[h];
                let key = self.expandKey(h);
                req.setRequestHeader(key, val);
            });

            // listen for ready state change.
            req.onreadystatechange = function onreadystatechange() {
                if(req.readyState > 3){
                    var result = parseResponse(req);
                    if(req.status === 200 || req.status === 201){
                        if(typeof cb === 'function')
                            return cb(result);
                        resolve(result);
                    } else {
                        if(typeof cb === 'fucntion')
                            return cb(result);
                        reject(result);
                    }
                }
            };

            // send the request.
            req.send(data);

        });

    }

    /**
     * Http GET request.
     * @param url - the url endpoint.
     * @param params - the params to be passed as querystring.
     * @param [cb] - optional callback.
     */
    get(url, params, cb) {
        return this.normalize('get', url, params, cb);
    }

    /**
     * Http POST request.
     * @param url - the url endpoint.
     * @param [params] - the params to be passed as querystring.
     * @param data - body data to be posted.
     * @param [cb] - optional callback.
     */
    post(url, data, params, cb) {
        return this.normalize('post', url, data, params, cb);
    }

    /**
     * Http PUT request.
     * @param url - the url endpoint.
     * @param [params] - the params to be passed as querystring.
     * @param data - the body data to be posted.
     * @param [cb] - optional callback.
     */
    put(url, data, params, cb) {
        return this.normalize('put', url, data, params, cb);
    }

    /**
     * Http DELETE request.
     * @param url - the url endpoint.
     * @param params - the params to be passed as querystring.
     * @param [cb] - optional callback.
     */
    del(url, params, cb) {
        return this.normalize('del', url, data, params, cb)
    }


}

export default Http;