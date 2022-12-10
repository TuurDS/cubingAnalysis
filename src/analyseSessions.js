const fs = require("fs-extra");
require("string-format-js");
const { analyseData, logSingleResults, logSingleSession } = require("./functions.js");

const analyseDataWrap = (startPercentage, files) => {
    let currentSession = 1;
    let sessionResults = [];

    for (let i = 0; i < files.length; i++) {
        let data = JSON.parse(fs.readFileSync(`./src/Data/sessions/${files[i]}`, { encoding: 'utf-8' }));

        //filter data with length less than X
        if (data.length < 10) continue;

        let start = Math.floor(data.length * startPercentage);
        let end = -start;
        //must be a string
        const input = {
            data: data,
            start: start.toString(),
            end: end.toString(),
            subX: process.env.npm_config_subx,
            limit: process.env.npm_config_limit
        }
        const result = analyseData(input);
        sessionResults.push(result);
        logSingleSession({ session: `\x1b[32msession \x1b[33m${currentSession} \x1b[36mremoved \x1b[33m${startPercentage * 100}%`, ...result });
        currentSession++;
    }
    return sessionResults;
}

//read every file in the session folder and loop through them
let files = fs.readdirSync("./src/Data/sessions");

const percentages = {
    "0%": 0,
    "25% ": 0.25,
}
const resultArrays = {};

for (const percentage in percentages) {
    resultArrays[percentage] = [];
    resultArrays[percentage] = analyseDataWrap(percentages[percentage], files);
}

//show a graph of the results result.subXPercent and result.avrTime
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: 1200, height: 600, plugins: {
        modern: ['chartjs-plugin-trendline'],
    }
});

(async () => {

    // add a trendline to the graph
    const configurationSubXPercent = {
        type: 'line',
        data: {
            labels: resultArrays["0%"].map((result, index) => index + 1),
            datasets: []
        }
    };
    //colors
    const colors = [
        'rgba(255, 99, 132)',
        'rgba(54, 162, 235)',
        'rgba(255, 206, 86)',
        'rgba(75, 192, 192)',
        'rgba(153, 102, 255)',
        'rgba(255, 159, 64)'
    ];

    //do the same as the example above but with colors
    for (const percentage in percentages) {
        //add a dataset to the graph
        configurationSubXPercent.data.datasets.push({
            label: percentage,
            data: resultArrays[percentage].map((result, index) => result.subXPercent),
            fill: false,
            borderColor: colors[Object.keys(percentages).indexOf(percentage)],
            tension: 0.1,
            trendlineLinear: {
                lineStyle: "dotted",
                width: 2
            }
        });
    }



    const configurationAvrTime = {
        type: 'line',
        data: {
            labels: resultArrays["0%"].map((result, index) => index + 1),
            datasets: []
        }
    };

    //for each percentage
    for (const percentage in percentages) {
        //add a dataset to the graph
        configurationAvrTime.data.datasets.push({
            label: percentage,
            data: resultArrays[percentage].map((result, index) => result.avrTime),
            fill: false,
            borderColor: colors[Object.keys(percentages).indexOf(percentage)],
            tension: 0.1,
            trendlineLinear: {
                lineStyle: "dotted",
                width: 2
            }
        });
    }

    const imageSubXPercent = await chartJSNodeCanvas.renderToBuffer(configurationSubXPercent);
    const imageAvrTime = await chartJSNodeCanvas.renderToBuffer(configurationAvrTime);

    fs.writeFileSync('./src/Data/graphs/sessions/SubXPercent.png', imageSubXPercent);
    fs.writeFileSync('./src/Data/graphs/sessions/AvrTime.png', imageAvrTime);
})();