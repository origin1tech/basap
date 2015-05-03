# Basap

To view documentation please install the application.

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