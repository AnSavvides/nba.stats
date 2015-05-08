module.exports = function(grunt) {

    "use strict";

    var browserifyFiles = {
        "./dist/build.js": "./src/*.js"
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        browserify: {
            prod: {
                files: browserifyFiles
            }
        }
    });

    grunt.loadNpmTasks("grunt-browserify");

    grunt.registerTask("build", ["browserify:prod"]);
};