const fs = require("fs-extra");
const moment = require('moment');
require("string-format-js");
const { analyseData, logSingleSession } = require("./functions.js");

let files = fs.readdirSync("./src/Data/cross-sessionsExports");
let latestFile = files[files.length - 1];
let crossData = fs.readFileSync(`./src/Data/cross-sessionsExports/${latestFile}`, { encoding: 'utf-8' });
const data = JSON.parse(crossData);

//example how the date looks like
//[
//     {
//      ...
//      "date": "1662233191",
//      ...
//     },
//]

//sort the data by date
data.sort((a, b) => {
    return a.date - b.date;
});

function getFirstAndLastDayOfWeek(date) {
    let firstday = moment.utc(date).startOf('isoWeek').format("YYYY-MM-DD");
    let lastday = moment.utc(date).endOf('isoWeek').format("YYYY-MM-DD");
    return { firstday, lastday, label:firstday, labelLarge:`\x1b[33m${firstday}\x1b[36m | week` };
}

function getFirstAndLastDayOfMonth(date) {
    let firstday = moment.utc(date).startOf('month').format("YYYY-MM-DD");
    let lastday = moment.utc(date).endOf('month').format("YYYY-MM-DD");
    return { firstday, lastday, label:moment.utc(date).format("MMMM"), 
    labelLarge:`\x1b[33m${moment.utc(date).format("MMMM")}\x1b[36m | month` };
}

function getFirstAndLastDayOfYear(date) {
    let firstday = moment.utc(date).startOf('year').format("YYYY-MM-DD");
    let lastday = moment.utc(date).endOf('year').format("YYYY-MM-DD");
    return { firstday, lastday, label:moment.utc(date).format("YYYY"), 
    labelLarge:`\x1b[33m${moment.utc(date).format("YYYY")}\x1b[36m | year` };
}

function getFirstAndLastDayOfEveryPeriod(date,startday,days) {
    //startday is the first day of the entire data
    startday = moment.utc(startday).format("YYYY-MM-DD");
    //find between wich 2 multiples of the amount of days days from the first day of the entire data the date is
    let diff = moment.utc(date).diff(moment.utc(startday), 'days');
    let weeks = Math.floor(diff / days);
    let firstday = moment.utc(startday).add(weeks * days, 'days').format("YYYY-MM-DD");
    let lastday = moment.utc(startday).add((weeks + 1) * days, 'days').endOf('day').format("YYYY-MM-DD");
    return { firstday, lastday, label:`${firstday} - ${lastday}`,
    labelLarge: `\x1b[33m${firstday} \x1b[32m- \x1b[33m${lastday}\x1b[36m | ${days} days` };
}


function getPeriodFunc(period) {
    switch (period) {
        case "week": return getFirstAndLastDayOfWeek;
        case "month": return getFirstAndLastDayOfMonth;
        case "year": return getFirstAndLastDayOfYear;
        case "period": return getFirstAndLastDayOfEveryPeriod;
        default: return getFirstAndLastDayOfWeek;
    }
}

//make generic function divideIntoPeriods(data, period)
//period can be "week", "month", "year" use a switch statement
function divideIntoPeriods(data, period, days = 7) {
    const periodFunc = getPeriodFunc(period);

    //first day of entire data cannot use periodFunc
    let firstDay = moment.utc(data[0].date*1000).format("YYYY-MM-DD");

    let periods = [];
    let periodData = [];
    let { firstday: firstDayOfPeriod, lastday: lastDayOfPeriod, label, labelLarge } = periodFunc(data[0].date*1000,firstDay,days);

    for (let i = 0; i < data.length; i++) {
        if (periodFunc(data[i].date*1000,firstDay,days).firstday === firstDayOfPeriod) {
            periodData.push(data[i]);
        }
        else {
            periods.push({ date: firstDayOfPeriod, data: periodData, lastday:lastDayOfPeriod, label, labelLarge });
            periodData = [];
            periodData.push(data[i]);
            ({ firstday: firstDayOfPeriod, lastday: lastDayOfPeriod, label, labelLarge } = periodFunc(data[i].date*1000,firstDay,days));
        }
    }
    periods.push({ date: firstDayOfPeriod, data: periodData, lastday:lastDayOfPeriod, label, labelLarge });
    return periods;
}

function analyseDataWrap (period) {
    let data = period.data;
    let label = period.label;

    var results = [];
    for(let i = 0; i < data.length; i++){
        let week = data[i];

        const input = {
            data: week.data,
            start: "0",
            end: "0",
            subX: process.env.npm_config_subx,
            limit: process.env.npm_config_limit
        }

        let weekAnalysis = analyseData(input);
        results.push({label:week.label, ...weekAnalysis});
        logSingleSession({ session: week.label, ...weekAnalysis });
    }
    return {label,results};
}


const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: 800, height: 600, plugins: {
        modern: ['chartjs-plugin-trendline'],
    }
});

const show = async (result) => {

    // add a trendline to the graph
    const configurationSubXPercent = {
        type: 'line',
        data: {
            labels: result.results.map((result) => result.label),
            datasets: []
        }
    };


    //add a dataset to the graph
    configurationSubXPercent.data.datasets.push({
        label: result.label,
        data: result.results.map((result) => result.subXPercent),
        fill: false,
        borderColor: "rgba(255, 99, 132)",
        tension: 0.1,
        trendlineLinear: {
            lineStyle: "dotted",
            width: 2
        }
    });

    const configurationAvrTime = {
        type: 'line',
        data: {
            labels: result.results.map((result) => result.label),
            datasets: []
        }
    };

   //add a dataset to the graph
   configurationAvrTime.data.datasets.push({
        label: result.label,
        data: result.results.map((result) => result.avrTime),
        fill: false,
        borderColor: "rgba(54, 162, 235)",
        tension: 0.1,
        trendlineLinear: {
            lineStyle: "dotted",
            width: 2
        }
    });

    const imageSubXPercent = await chartJSNodeCanvas.renderToBuffer(configurationSubXPercent);
    const imageAvrTime = await chartJSNodeCanvas.renderToBuffer(configurationAvrTime);

    //if it doesn't exist
    if (!fs.existsSync(`./src/Data/graphs/date/${result.label}`)) {
        fs.mkdirSync(`./src/Data/graphs/date/${result.label}`);
    }

    fs.writeFileSync(`./src/Data/graphs/date/${result.label}/subXPercent.png`, imageSubXPercent);
    fs.writeFileSync(`./src/Data/graphs/date/${result.label}/avrTime.png`, imageAvrTime);
};

const weeks = divideIntoPeriods(data, "week");
const twoWeeks = divideIntoPeriods(data, "period", 14);
const months = divideIntoPeriods(data, "month");
const years = divideIntoPeriods(data, "year");

const periods = [
    {label:"weeks",data:weeks},
    {label:"twoWeeks",data:twoWeeks},
    {label:"months",data:months},
    {label:"years",data:years},
]

for(let i = 0; i < periods.length; i++){
    let period = periods[i];
    let periodAnalysis = analyseDataWrap(period);
    show(periodAnalysis);
}

console.log("test");