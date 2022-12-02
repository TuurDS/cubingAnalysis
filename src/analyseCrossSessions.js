const fs = require("fs-extra");
require("string-format-js");
const { analyseData, logSingleSession } = require("./functions.js");

const chunks = (arr, size) => {
    const chunked_arr = [];
    let copied = [...arr];
    const numOfChild = Math.ceil(copied.length / size);
    for (let i = 0; i < numOfChild; i++) {
        chunked_arr.push(copied.splice(0, size));
    }
    return chunked_arr;
}

const analyseDataWrap = (chunksize) => {
    let currentSession = 1;
    let sessionResults = [];

    //read the latest export in the cross-sessionsExports directory
    //the date is the first 10 characters of the file name
    let files = fs.readdirSync("./src/Data/cross-sessionsExports");
    let latestFile = files[files.length - 1];
    let crossData = fs.readFileSync(`./src/Data/cross-sessionsExports/${latestFile}`, { encoding: 'utf-8' });

    const ChunkedData = chunks(JSON.parse(crossData), chunksize);

    for (let i = 0; i < ChunkedData.length; i++) {
        let data = ChunkedData[i];

        //filter data with length less than X
        if (data.length < 10) continue;

        //must be a string
        const input = {
            data: data,
            start: "0",
            end: "0",
            subX: process.env.npm_config_subx,
            limit: process.env.npm_config_limit
        }
        const result = analyseData(input);
        sessionResults.push(result);
        logSingleSession({ session: `\x1b[32mchunk \x1b[33m${currentSession} \x1b[36mchunks of \x1b[33m${chunksize}`, ...result });
        currentSession++;
    }
    return sessionResults;
}

const exportBothGraphs = async (resultArray, chunksize) => {

    const configurationSubXPercent = {
        type: 'line',
        data: {
            labels: resultArray.map((result, index) => index + 1),
            datasets: [{
                label: chunksize,
                data: resultArray.map((result, index) => result.subXPercent),
                fill: false,
                borderColor: "rgba(255, 99, 132)",
                tension: 0.1,
                trendlineLinear: {
                    lineStyle: "dotted",
                    width: 2
                }
            }]
        }
    };

    const configurationAvrTime = {
        type: 'line',
        data: {
            labels: resultArray.map((result, index) => index + 1),
            datasets: [{
                label: chunksize,
                data: resultArray.map((result, index) => result.avrTime),
                fill: false,
                borderColor: "rgba(54, 162, 235)",
                tension: 0.1,
                trendlineLinear: {
                    lineStyle: "dotted",
                    width: 2
                }
            }]
        }
    };

    const imageSubXPercent = await chartJSNodeCanvas.renderToBuffer(configurationSubXPercent);
    const imageAvrTime = await chartJSNodeCanvas.renderToBuffer(configurationAvrTime);

    //create a folder named after the chunksize
    //if it doesn't exist
    if (!fs.existsSync(`./src/Data/graphs/cross-sessions/${chunksize}`)) {
        fs.mkdirSync(`./src/Data/graphs/cross-sessions/${chunksize}`);
    }
    fs.writeFileSync(`./src/Data/graphs/cross-sessions/${chunksize}/SubXPercent.png`, imageSubXPercent);
    fs.writeFileSync(`./src/Data/graphs/cross-sessions/${chunksize}/AvrTime.png`, imageAvrTime);
};


/* START CODE */
//show a graph of the results result.subXPercent and result.avrTime
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: 800, height: 600, plugins: {
        modern: ['chartjs-plugin-trendline'],
    }
});

const chunksizes = {
    "chunks of 100": 100,
    "chunks of 500": 500,
    "chunks of 1000": 1000
}

fs.emptyDirSync("./src/Data/graphs/cross-sessions");

for (const chunksize in chunksizes) {
    const result = analyseDataWrap(chunksizes[chunksize]);
    exportBothGraphs(result, chunksize);
}

