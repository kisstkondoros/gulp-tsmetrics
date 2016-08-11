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

function collect(model: IMetricsModel, metricsConfiguration: IMetricsConfiguration, silent: boolean, level: string, filteredOutput: IMetricsModel) {
    if (model) {
        const complexity = model.getSumComplexity();
        if (!silent && model.visible && complexity >= metricsConfiguration.CodeLensHiddenUnder) {
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

        if (model.children.length > 0 || complexity >= metricsConfiguration.CodeLensHiddenUnder) {
            const copyOfModel = model.clone();
            filteredOutput.children.push(copyOfModel);
            model.children.forEach(element => {
                collect(element, metricsConfiguration, silent, level + "  ", copyOfModel);
            });
        }
    }
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