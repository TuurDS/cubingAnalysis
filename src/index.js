const fs = require("fs-extra");
require("string-format-js");

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
        console.log("%3d".format(key) + ": " + "%5d ".format(value) + formatBars(value, max));
    })
}

starttime = performance.now()

fs.readFile("./src/input.txt", 'utf-8', (err, data) => {
    let arr = data.split("\n");

    arr = arr.filter((value) => {
        if (isNaN(value) || value.trim() === "") return false;
        return true;
    })

    //-- START --//
    //-- START --//
    //-- START --//

    // use "oldest" or "newest" keyword or number as the position to start/end with

    // example 1 getting the last 1000 lines
    // var start = "newest - 1000";
    // var end = "newest";

    // example 2 getting line 2000 to 3000
    // var start = 2000;
    // var end = 3000;

    // explanation array is 4876 lines long
    // oldest will be the first line or index 0
    // newest will be the last line or index 4875

    var start = "oldest";
    var end = "newest";
    let subX = 10;
    const limit = 10000;

    //-- END --//
    //-- END --//
    //-- END --//


    start = start.replaceAll("oldest", 0)
    end = end.replaceAll("oldest", 0)

    start = start.replaceAll("newest", arr.length)
    end = end.replaceAll("newest", arr.length)

    start = eval(start)
    end = eval(end)

    let amtSolves = 0;
    const test = arr.slice(start, end).reduce((reduceObj, currentValue, index, arr) => {
        if (index < arr.length - limit) return reduceObj;
        if (isNaN(currentValue) || currentValue === "") return reduceObj;

        amtSolves++;

        reduceObj.total += parseFloat(currentValue);

        if (currentValue > subX) return { ...reduceObj, current: reduceObj.current + 1 };

        reduceObj.subXArr.push(reduceObj.current + 1)
        if (reduceObj.min === null) {
            return {
                ...reduceObj,
                current: 0,
                min: reduceObj.current + 1,
                max: reduceObj.current + 1,
                subXArr: reduceObj.subXArr
            }
        } else {
            return {
                ...reduceObj,
                current: 0,
                min: reduceObj.current + 1 < reduceObj.min ? reduceObj.current + 1 : reduceObj.min,
                max: reduceObj.current + 1 > reduceObj.max ? reduceObj.current + 1 : reduceObj.max,
                subXArr: reduceObj.subXArr
            }
        }
    }, { total: 0, current: 0, min: null, max: null, subXArr: [] })


    console.log("solves: " + amtSolves);
    console.log("avg: " + (test.total / amtSolves).toFixed(2));
    console.log();
    console.log(`sub ${subX} solves: ` + test.subXArr.length);
    console.log(`sub ${subX} %: ` + (test.subXArr.length / amtSolves * 100).toFixed(2));
    console.log();
    console.log(`||||| consecutive solves before sub ${subX} solve |||||`);
    console.log(`min:` + test.min);
    console.log(`max:` + test.max);
    console.log();
    console.log("avr:" + test.subXArr.reduce((a, b) => a + b, 0) / test.subXArr.length);
    console.log("median:" + test.subXArr.sort(function (a, b) { return a - b })[Math.round(test.subXArr.length / 2)]);
    console.log();
    findDuplicates("diviation:", test.subXArr);

    endtime = performance.now()
    console.log("\nexecution time: " + (endtime - starttime) + " ms");
}
)


