module.exports = function(grunt) {

    "use strict";

    var browserifyFiles = {
        "./dist/build.js": "./src/js/*.js"
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        browserify: {
            prod: {
                files: browserifyFiles,
                options: {
                    transform: [["babelify", { "stage": 0 }]]
                }
            }
        },
        watch: {
            scripts: {
                files: ["src/js/*.js"],
                tasks: ["build"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("build", ["browserify:prod"]);
};