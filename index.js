"use strict";
var through2 = require('through2');
var path = require('path');
var chalk = require('chalk');
var gutil = require('gulp-util');
var MetricsParser_1 = require('tsmetrics-core/MetricsParser');
var MetricsConfiguration_1 = require('tsmetrics-core/MetricsConfiguration');
function mergeConfiguration(source, target) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
    return target;
}
function logRecursive(model, metricsConfiguration, level) {
    var complexity = model.getSumComplexity();
    if (model.visible) {
        var color = chalk.white;
        if (complexity > metricsConfiguration.ComplexityLevelExtreme) {
            color = chalk.red;
        }
        else if (complexity > metricsConfiguration.ComplexityLevelHigh) {
            color = chalk.yellow;
        }
        else if (complexity > metricsConfiguration.ComplexityLevelNormal) {
            color = chalk.green;
        }
        else if (complexity > metricsConfiguration.ComplexityLevelLow) {
            color = chalk.white;
        }
        gutil.log(color(model.toLogString(level)));
    }
    model.children.forEach(function (element) {
        logRecursive(element, metricsConfiguration, level + "  ");
    });
}
function create(target, silent, metricsConfiguration) {
    metricsConfiguration = mergeConfiguration(metricsConfiguration || {}, new MetricsConfiguration_1.MetricsConfiguration());
    var PLUGIN_NAME = "gulp-Metrics";
    var transform = function (file, encoding, callback) {
        if (file.isNull()) {
            throw new gutil.PluginError(PLUGIN_NAME, 'File was null!');
        }
        var filePath = path.normalize(file.path);
        filePath = filePath.replace(/\\/g, '/');
        var metricsForFile = MetricsParser_1.MetricsParser.getMetrics(filePath, metricsConfiguration, target);
        if (!silent) {
            gutil.log(metricsForFile.file);
            logRecursive(metricsForFile.metrics, metricsConfiguration, "");
        }
        var joinedFile = new gutil.File({
            cwd: file.cwd,
            base: file.base,
            path: filePath + '.json',
            contents: new Buffer(JSON.stringify(metricsForFile))
        });
        callback(null, joinedFile);
    };
    return through2.obj(transform);
}
exports.create = create;
//# sourceMappingURL=index.js.map