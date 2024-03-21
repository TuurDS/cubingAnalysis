const fs = require("fs-extra");
const part1 = () => {
    //read the file
    const f = fs.readFileSync("C:/Users/Tuur/projects/cubingAnalysis/src/Data/cross-sessionsExports/2024_02_21_size67217.json", "utf8"); 
    const json = JSON.parse(f);

    //read the file text.json
    const f2 = fs.readFileSync("text.json", "utf8");
    const json2 = JSON.parse(f2);

    const caculateAverage = (start, end) => {
    //caculate the average time for each object in this file that is between the start and end date
    //the objects in this json file look like this:

    //[
    //...
    // {
    //     "time": 10.29,
    //     "scramble": "L' B D2 B' U' R' F' U' R2 L2 D2 B' D2 B2 U2 B U2 L2 B' U L'",
    //     "date": 1704380789
    // },
    //...
    //]
        let times = [];
        //loop over each object in the json file
        for (const { time, date } of json) {
            //parse the date to an integer
            const d = Number(date);
            //check if the date is between the start and end date
            if (d >= start && d <= end) {
                //put the time in an array
                times.push(time);
                }
            }

        //remove the best and worst time
        times = times.sort((a, b) => a - b).slice(1, -1);
        //calculate the average
        return times.reduce((a, b) => a + b * 1000, 0) / times.length;
    }

    //{
    //...
    // "476": {
    //       "name": "1.4 333",
    //       "opt": {},
    //       "rank": 476,
    //       "stat": [
    //         100,
    //         0,
    //         9340
    //       ],
    //       "date": [
    //         1704378622,
    //         1704381170
    //       ]
    //     }
    //...
    //}

    //this is the format of the json file
    //loop over each key in the json object
    for (const key in json2) {
        const { name, opt, rank, stat, date } = json2[key];

        // if (null != stat[2]) {  
        //     continue;
        // }

        //get the start and end date and parse them to an integer
        const [start, end] = date.map(Number);
        // const avr = caculateAverage(start, end);
        //generate the same object with the average time added and the start and end date parsed to a number
        // json2[key] = { name, opt, rank, stat: [stat[0],stat[1],avr], date: [start, end] };
        json2[key] = { name, opt, rank, stat: stat, date: [start, end] };
    }
    // write to textnew.json
    fs.writeFileSync("textnew.json", JSON.stringify(json2));
}
//done part 1
const part2 = () => {
    //iterate over all the files in cross-sessionsExports
    const files = fs.readdirSync("C:/Users/Tuur/projects/cubingAnalysis/src/Data/cross-sessionsExports");

    for (const file of files) {
        //read the file
        const f = fs.readFileSync(`C:/Users/Tuur/projects/cubingAnalysis/src/Data/cross-sessionsExports/${file}`, "utf8");
        const json = JSON.parse(f);
        //iterate over each key in the json object
        for (const key in json) {
            const obj = json[key];
            //update the time obj
            json[key] = { ...obj, date: Number(obj.date) };
        }
        //write the file
        fs.writeFileSync(`C:/Users/Tuur/projects/cubingAnalysis/src/Data/cross-sessionsExports/${file}`, JSON.stringify(json, null, 2));
    }
}

const part3 = () => {
    const file = fs.readFileSync("C:/Users/Tuur/projects/cubingAnalysis/src/currentData/cstimerExport.json")    

    const json = JSON.parse(file);
    const lastI = 538;
    //loop over over each property named "sessionI" where I is a number between 0 and lastI
    for (let i = 1; i <= lastI; i++) {
        try {
            const session = json[`session${i}`];
            //loop over all elements in the array
            for (const obj of session) {
                //update the time which is the 4th element in the sub array
                obj[3] = Number(obj[3]);
            }
        } catch (error) {
            console.log(error);   
        }
    }
    //write the file
    fs.writeFileSync("C:/Users/Tuur/projects/cubingAnalysis/src/currentData/cstimerExport.json", JSON.stringify(json, null, 2));
}


part1();
part2();
part3();