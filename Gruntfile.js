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
        },
        watch: {
            scripts: {
                files: ["src/*.js"],
                tasks: ["build"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("build", ["browserify:prod"]);
};