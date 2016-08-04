"use strict";
var assert = require('assert');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var Metrics = require('./index');
describe('gulp-tsmetrics', function () {
    it('parse result should be logged to console', function (done) {
        var sampleFile = new gutil.File({
            path: path.join(__dirname, 'fixture/fixture.ts'),
            contents: new Buffer(0)
        });
        var oldConsole = console.log;
        var loggedToConsole = false;
        console.log = function (str) {
            console.log = oldConsole;
            loggedToConsole = true;
        };
        var myMetrics = Metrics.create(1 /* ES5 */);
        myMetrics.write(sampleFile);
        myMetrics.once('data', function (result) {
            console.log = oldConsole;
            assert.ok(loggedToConsole);
            done();
        });
    });
    it('parse should not log anything', function (done) {
        var sampleFile = new gutil.File({
            path: path.join(__dirname, 'fixture/fixture.ts'),
            contents: new Buffer(0)
        });
        var oldConsole = console.log;
        console.log = function (str) {
            console.log = oldConsole;
            throw new Error("logged to console");
        };
        var myMetrics = Metrics.create(1 /* ES5 */, true);
        myMetrics.write(sampleFile);
        myMetrics.once('data', function (result) {
            var parseResult = JSON.parse(result.contents.toString());
            assert.notEqual(parseResult, undefined);
            console.log = oldConsole;
            done();
        });
    });
    it('parse should provide json as output in the form of MetricsModel', function (done) {
        var sampleFile = new gutil.File({
            path: path.join(__dirname, 'fixture/fixture.ts'),
            contents: new Buffer(0)
        });
        var myMetrics = Metrics.create(1 /* ES5 */, true);
        myMetrics.write(sampleFile);
        myMetrics.once('data', function (result) {
            var parseResult = JSON.parse(result.contents.toString());
            assert.ok(parseResult.file && parseResult.metrics);
            done();
        });
    });
    it('parse configuration should be possible to pass in', function (done) {
        var sampleFile = new gutil.File({
            path: path.join(__dirname, 'fixture/fixture.ts'),
            contents: new Buffer(0)
        });
        var myMetrics = Metrics.create(1 /* ES5 */, true, {
            FunctionExpression: 10
        });
        myMetrics.write(sampleFile);
        myMetrics.once('data', function (result) {
            var parseResult = JSON.parse(result.contents.toString());
            assert.ok(parseResult.metrics.children[1].children[5].children[5].complexity == 10);
            done();
        });
    });
    it('parse should work for multiple files as well', function (done) {
        var myMetrics = Metrics.create(1 /* ES5 */, true);
        var files = [
            "fixture/fixture.ts",
            "fixture/fixture.2.ts"
        ];
        files.forEach(function (f) {
            var file = new gutil.File({
                path: path.join(__dirname, f),
                contents: new Buffer(0)
            });
            myMetrics.write(file);
        });
        var counter = 0;
        myMetrics.on('data', function (result) {
            counter++;
            if (counter == 2) {
                done();
            }
        });
    });
});
//# sourceMappingURL=test.js.map