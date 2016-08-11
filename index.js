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
function collect(model, metricsConfiguration, silent, level, filteredOutput) {
    if (model) {
        var complexity = model.getSumComplexity();
        if (!silent && model.visible && complexity >= metricsConfiguration.CodeLensHiddenUnder) {
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
        if (model.children.length > 0 || complexity >= metricsConfiguration.CodeLensHiddenUnder) {
            var copyOfModel_1 = model.clone();
            filteredOutput.children.push(copyOfModel_1);
            model.children.forEach(function (element) {
                collect(element, metricsConfiguration, silent, level + "  ", copyOfModel_1);
            });
        }
    }
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
        }
        var filteredMetrics = metricsForFile.metrics.clone();
        collect(metricsForFile.metrics, metricsConfiguration, silent, "", filteredMetrics);
        var result = filteredMetrics.children[0];
        var joinedFile = new gutil.File({
            cwd: file.cwd,
            base: file.base,
            path: filePath + '.json',
            contents: new Buffer(JSON.stringify({ file: filePath, metrics: result }))
        });
        callback(null, joinedFile);
    };
    return through2.obj(transform);
}
exports.create = create;
//# sourceMappingURL=index.js.map