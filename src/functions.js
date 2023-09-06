class analyseResult {
    constructor({
        amtSolves,
        amtAnalysed,
        AmountBeforesubXArr,
        totalTime,
        avrTime,
        minAmountBeforeSubX,
        maxAmountBeforeSubX,
        currentAmountAfterSubX,
        avrAmountBeforeSubX,
        medianAmountBeforeSubX,
        start,
        end,
        subX,
        subXPercent,
        limit,
        starttime,
        endtime
    }) {
        this.amtSolves = amtSolves;
        this.amtAnalysed = amtAnalysed;
        this.AmountBeforesubXArr = AmountBeforesubXArr;
        this.totalTime = totalTime;
        this.avrTime = avrTime;
        this.minAmountBeforeSubX = minAmountBeforeSubX;
        this.maxAmountBeforeSubX = maxAmountBeforeSubX;
        this.currentAmountAfterSubX = currentAmountAfterSubX;
        this.avrAmountBeforeSubX = avrAmountBeforeSubX;
        this.medianAmountBeforeSubX = medianAmountBeforeSubX;
        this.start = start;
        this.end = end;
        this.subX = subX;
        this.subXPercent = subXPercent;
        this.limit = limit;
        this.starttime = starttime;
        this.endtime = endtime;
    } 
}


const formatBars = (int, max, limit = 50) => {
    if (Math.round(int / max * limit) === 0) return "▌"
    let bar = ""
    for (let index = 0; index < Math.round(int / max * limit); index++) {
        bar += "█"
    }
    return bar;
}

const findDuplicates = (starttext, arr) => {
    const counts = {};
    arr.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
    console.log(starttext);

    const max = Math.max(...Object.entries(counts).map(([key, value]) => value));

    Object.entries(counts).forEach(([key, value]) => {
        console.log("\x1b[33m%3d".format(key) + ": " + "%5d \x1b[36m".format(value) + formatBars(value, max));
    })
}

const evalWrap = (input, arrayLength, defaultValue = null) => {
    try {
        if (!input || input == "") throw new Error("input is invalid");
        input = input.replaceAll("end", arrayLength);
        //why not use 0 in the first place then instead of start?? Oh well people tryna be difficult I guess.
        input = input.replaceAll("start", 0);
        return eval(input);
    } catch (error) {
        return defaultValue;
    }
}

const median = (arr) => {
    const mid = Math.floor(arr.length / 2),
        nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

const analyseData = ({ data, start, end, subX, limit }) => {

    starttime = performance.now();

    let arr = data;

    arr = arr.filter((value) => {
        if (isNaN(value.time)) return false;
        return true;
    })

    start = evalWrap(start, arr.length, 0)
    end = evalWrap(end, arr.length, 0)
    subX = evalWrap(subX, arr.length, 10)
    limit = evalWrap(limit, arr.length, 100000)

    //min is 0 else it will be the start
    if (start < 0) start = 0;
    // 0 for end is the same as the length of the array
    if (end === 0) end = arr.length;
    // - 50 for end is the same as the length of the array - 50
    else if (end < 0) end = arr.length + end;
    // if the end greater that 0 end is the stays the same
    // if it is greater than the length of the array we set the end to the length of the array
    else if (end > arr.length) end = arr.length;


    let amtSolves = 0;
    let amtAnalysed = 0;
    let AmountBeforesubXArr = [];
    let totalTime = 0;
    let minAmountBeforeSubX = null;
    let maxAmountBeforeSubX = null;
    let currentAmountAfterSubX = 0;

    for (let i = 0; i < arr.length; i++) {
        //get the current time
        const currentTime = arr[i].time;

        //validate that the current time is not empty and is a number else we continue to the next number
        if (isNaN(currentTime) || currentTime === "") continue;
        //update the total amount of solves
        amtSolves++;

        //check if we are in the range of start - end
        if (i < start || i >= end) continue;

        //check if we are past the limit;
        if (amtAnalysed >= limit) continue;


        //update the total amount of valid times(solves) that we are analysing
        //add those to the totalTime
        //and increase the current amount of solves needed to reach subX mark
        amtAnalysed++;
        totalTime += parseFloat(currentTime);
        currentAmountAfterSubX++;

        //if you have not reached the subX mark in this solve you dont need to add the currentAmountAfterSubX to the array or update the min/max so we continue;
        if (currentTime > subX) continue;

        //add the current amount of solves needed to get the the subX mark
        AmountBeforesubXArr.push(currentAmountAfterSubX)

        //set or reset min max values when needed
        if (minAmountBeforeSubX === null) {
            minAmountBeforeSubX = currentAmountAfterSubX;
            maxAmountBeforeSubX = currentAmountAfterSubX;
            currentAmountAfterSubX = 0;
        } else {
            minAmountBeforeSubX = currentAmountAfterSubX < minAmountBeforeSubX ? currentAmountAfterSubX : minAmountBeforeSubX;
            maxAmountBeforeSubX = currentAmountAfterSubX > maxAmountBeforeSubX ? currentAmountAfterSubX : maxAmountBeforeSubX;
            currentAmountAfterSubX = 0;
        }
    }

    endtime = performance.now();

    return new analyseResult({
        amtSolves,
        amtAnalysed,
        AmountBeforesubXArr,
        totalTime,
        avrTime: (totalTime / amtAnalysed).toFixed(2),
        minAmountBeforeSubX,
        maxAmountBeforeSubX,
        currentAmountAfterSubX,
        avrAmountBeforeSubX: (AmountBeforesubXArr.reduce((a, b) => a + b, 0) / AmountBeforesubXArr.length).toFixed(2),
        medianAmountBeforeSubX: median(AmountBeforesubXArr),
        start,
        end,
        subX,
        subXPercent: (AmountBeforesubXArr.length / amtAnalysed * 100).toFixed(2),
        limit,
        starttime,
        endtime
    })
}

const logSingleResults = ({
    amtSolves,
    amtAnalysed,
    AmountBeforesubXArr,
    totalTime,
    avrTime,
    minAmountBeforeSubX,
    maxAmountBeforeSubX,
    currentAmountAfterSubX,
    avrAmountBeforeSubX,
    medianAmountBeforeSubX,
    start,
    end,
    subX,
    subXPercent,
    limit,
    starttime,
    endtime
}) => {
    console.log(
        "\x1b[32mSolves: \x1b[33m" + amtSolves +
        "\x1b[32m Start: \x1b[33m" + start +
        "\x1b[32m End: \x1b[33m" + end +
        "\x1b[32m SubX: \x1b[33m" + subX +
        "\x1b[32m Limit: \x1b[33m" + limit);
    console.log(
        "\x1b[32mTotal analysed: \x1b[33m" + amtAnalysed +
        "\x1b[36m Avg: \x1b[31m" + avrTime);
    console.log(
        `\x1b[32msub ${subX} solves: \x1b[33m` + AmountBeforesubXArr.length +
        `\x1b[36m sub ${subX}%: \x1b[31m${subXPercent}%`);
    console.log(
        "\x1b[32mMin: \x1b[33m" + minAmountBeforeSubX +
        "\x1b[32m Max: \x1b[33m" + maxAmountBeforeSubX +
        "\x1b[32m avr: \x1b[33m" + avrAmountBeforeSubX +
        "\x1b[32m median: \x1b[33m" + medianAmountBeforeSubX);

    var toggle_deviation = process.env.npm_config_devi;
    if (toggle_deviation && !!parseInt(toggle_deviation)) {
        console.log();
        findDuplicates("\x1b[32mdiviation:\x1b[33m", AmountBeforesubXArr);
    }
    
    console.log();
    
    var toggle_timing = process.env.npm_config_time;
    if (toggle_timing && !!parseInt(toggle_timing)) {
        console.log("\x1b[32mexecution time: \x1b[33m" + (endtime - starttime) + " ms");
        console.log();
    }
}

const logSingleSession = (session, analyseResult) => {
    console.log("\x1b[33m" + session);

    logSingleResults(analyseResult);
}

module.exports = {
    logSingleResults,
    analyseData,
    logSingleSession
}