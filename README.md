# Basap

[![wercker status](https://app.wercker.com/status/4b7cdf23d9e4dd3173b3c5acd563a1cf/m "wercker status")](https://app.wercker.com/project/bykey/4b7cdf23d9e4dd3173b3c5acd563a1cf)

Below is the basic info to get going hower you should install the project so that you 
can run the server and view the example documentation as well as see a working app.

Often it's easier to follow something already working.

### Installing

```sh
    $ npm install basap
```

### Serving Project

```sh
    $ gulp serve
```

### Building Project Dist

```sh
    $ gulp build   
```

### Importing Basap

To use the output files within dist the easiest way is the install using jspm specifying the repository from
which to install. The below will install basap from the current build on our repository. If you download and run
the demo directly and/or fork and make changes, you need only change the repo owner and repo name as show below to
install from your repository which will contain your changes.

```sh
    $ jspm install github:origin1tech/basap
```

To import into your actual ES6 file do the following:

```js
    import basap from 'origin1tech/basap'; // again change the names here if you've imported from an alt repo.
```

### Setup Html

To load the basap module in your project you will need a couple scripts. I would strongly suggest reading up on
SystemJS and the module loader in general to understand the various ways you can load your project. Basap contains
a dist folder which has already built all the different bundles for loading in various ways. Probably the easiest in
production is to use the file with the extension .sfx. 

.js - standard bundle requries config.js
.runtime.js - self executable file that includes the runtime as well (you will only need this file)
.sfx.js - self executing modules that expect system.js to have already been loaded.

```html
    <script src="./jspm_packages/system.js"></script>
    <script src="./config.js"></script>
    <script>
        System.import('js/app');
    </script>
```

### Creating Your App

```js
    var app = basap('app', 
            [ /* your dependeinces like ngRoute */ ], 
            { /* your initialization options */ }
        );
```

### Creating an Area

```js
    var area = app.area('user', [ /* dependencies */ ], { /* options */ });
```

### Creating a Route

```js
    area.when('/user', { templateUrl: '/path/to/user.html', controller: 'MyController' });
```

### Continued Documentation

There is much more documentation in the project demo. I suggest you install and run it as there are many more
features not cited here.

### License

see: LICENSE.md