var assert = require('assert');
var fs = require('fs')
var gutil = require('gulp-util');
import * as path from 'path';
import * as Metrics from './index';
import {IMetricsModel} from 'tsmetrics-core/index';

describe('gulp-tsmetrics', function () {
    it('parse result should be logged to console', function (done) {
        var sampleFile = new gutil.File({
            path: path.join(__dirname, 'fixture/fixture.ts'),
            contents: new Buffer(0)
        });
        var oldConsole = console.log;
        var loggedToConsole = false;
        console.log = (str) => {
            console.log = oldConsole;
            loggedToConsole = true;
        };
        var myMetrics = Metrics.create(1 /* ES5 */);
        myMetrics.write(sampleFile);
        myMetrics.once('data', function (result: string) {
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
        console.log = (str) => {
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
            assert.ok((<IMetricsModel>parseResult.metrics).children[0].children[0].children[0].complexity == 10);
            done();
        });
    });
    it('should only show method metrics if configured like that', function (done) {
        var sampleFile = new gutil.File({
            path: path.join(__dirname, 'fixture/fixture.ts'),
            contents: new Buffer(0)
        });

        var myMetrics = Metrics.create(1 /* ES5 */, false, {
            MetricsForArrowFunctionsToggled: false,
            MetricsForClassDeclarationsToggled: false,
            MetricsForConstructorDescriptionsToggled: false,
            MetricsForEnumDeclarationDescriptionsToggled: false,
            MetricsForFunctionDeclarationsToggled: false,
            MetricsForFunctionExpressionsToggled: false,
            MetricsForMethodDeclarationsToggled: true /* only for methods*/
        });
        myMetrics.write(sampleFile);
        myMetrics.once('data', function (result) {
            var parseResult = JSON.parse(result.contents.toString());
            assert.ok((<IMetricsModel>parseResult.metrics).children[0].complexity == 1);
            done();
        });
    });
    it('parse should work for multiple files as well', function (done) {
        var myMetrics = Metrics.create(1 /* ES5 */, true);

        var files = [
            "fixture/fixture.ts",
            "fixture/fixture.2.ts"
        ]

        files.forEach(f => {
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