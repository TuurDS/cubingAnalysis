const fs = require("fs-extra");
require("string-format-js");
const { analyseData, logSingleResults } = require("./functions.js");

fs.readFile("./src/currentData/input.json", 'utf-8', (err, data) => {
    const input = {
        data: JSON.parse(data),
        start: process.env.npm_config_start,
        end: process.env.npm_config_end,
        subX: process.env.npm_config_subx,
        limit: process.env.npm_config_limit
    }
    logSingleResults(analyseData(input));
});
