System.config({
  "baseURL": "/",
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js"
  }
});

System.config({
  "map": {
    "alexei/sprintf.js": "github:alexei/sprintf.js@1.0.2",
    "angular": "github:angular/bower-angular@1.3.15",
    "angular-route": "github:angular/bower-angular-route@1.3.15",
    "angular-ui-router": "github:angular-ui/ui-router@0.2.14",
    "angular/router": "github:angular/router@0.5.3",
    "traceur": "github:jmcriffey/bower-traceur@0.0.87",
    "traceur-runtime": "github:jmcriffey/bower-traceur-runtime@0.0.87",
    "github:angular/bower-angular-route@1.3.15": {
      "angular": "github:angular/bower-angular@1.3.15"
    }
  }
});

