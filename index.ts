import * as through2 from 'through2';
import * as path from 'path';
import * as chalk from 'chalk';
import * as gutil from 'gulp-util';
import * as ts from 'typescript';
import {IMetricsModel, IMetricsConfiguration} from 'tsmetrics-core';
import {MetricsParser} from 'tsmetrics-core/MetricsParser';
import {MetricsConfiguration} from 'tsmetrics-core/MetricsConfiguration';

function mergeConfiguration(source: IMetricsConfiguration, target: IMetricsConfiguration): IMetricsConfiguration {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key]
        }
    }
    return target;
}

function logRecursive(model: IMetricsModel, metricsConfiguration: IMetricsConfiguration, level: string) {
    const complexity = model.getSumComplexity();
    if (model.visible) {
        let color = chalk.white;
        if (complexity > metricsConfiguration.ComplexityLevelExtreme) {
            color = chalk.red;
        } else if (complexity > metricsConfiguration.ComplexityLevelHigh) {
            color = chalk.yellow;
        } else if (complexity > metricsConfiguration.ComplexityLevelNormal) {
            color = chalk.green;
        } else if (complexity > metricsConfiguration.ComplexityLevelLow) {
            color = chalk.white;
        }
        gutil.log(color(model.toLogString(level)));
    }
    model.children.forEach(element => {
        logRecursive(element, metricsConfiguration, level + "  ");
    });
}

export function create(target: ts.ScriptTarget, silent?: boolean, metricsConfiguration?: IMetricsConfiguration) {
    metricsConfiguration = mergeConfiguration(metricsConfiguration || {}, new MetricsConfiguration());
    var PLUGIN_NAME = "gulp-Metrics";
    var transform = function (file, encoding, callback) {
        if (file.isNull()) {
            throw new gutil.PluginError(PLUGIN_NAME, 'File was null!');
        }

        var filePath = path.normalize(file.path);
        filePath = filePath.replace(/\\/g, '/');
        var metricsForFile = MetricsParser.getMetrics(filePath, metricsConfiguration, target);
        if (!silent) {
            gutil.log(metricsForFile.file);
            logRecursive(metricsForFile.metrics, metricsConfiguration, "");
        }

        var joinedFile = new gutil.File({
            cwd: file.cwd,
            base: file.base,
            path: file.filePath + '.json',
            contents: new Buffer(JSON.stringify(metricsForFile))
        });
        callback(null, joinedFile);
    };
    return through2.obj(transform);
}