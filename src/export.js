const fs = require("fs-extra");

fs.readFile("./src/currentData/csTimerExport.json", 'utf-8', (err, data) => {
    if (err) throw err;
    let sessions = JSON.parse(data);

    //empty the sessions folder
    fs.emptyDirSync("./src/Data/sessions");


    //sessions is an object
    //filter out sessions.properties
    let { properties, ...rest } = sessions;
    let sessionData = JSON.parse(properties.sessionData);
    sessions = { ...rest };

    //structure of sessionData
    // {
    //   "1": {
    //     "name": 1,
    //     ...
    //   },
    //   ...
    // }

    // sessions sturcture
    // {
    //   "session1":[
    //     ...
    //   ],
    //   ...
    // }

    //filter an object and filter out the keys that are not in the filternameArr
    let filternameArr = ["f2l", "cross", "oll", "pll"]
    sessions = Object.entries(sessions).filter((value) => {
        return !filternameArr.includes(sessionData[value[0].slice(7)].name)
    }).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
    }, {});

    //create a file for each session
    for (let session in sessions) {

        let sessionData = sessions[session];

        //length
        let sessionLength = sessionData.length;
        //date
        let sessionDate = sessionData[0][3];
        //convert to date
        let date = new Date(sessionDate * 1000);
        //get the session name to format DD_MM_YYYY_sizesessionLength.json
        //make days less than 10 have a 0 in front use ternary operator
        let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        let month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();
        let year = date.getFullYear();
        let sessionFileName = year + "_" + month + "_" + day + "_size" + sessionLength;

        //covert the object to {
        // "time": 12.27,
        // "scramble": "L2 F' R' B2 U D R2 L F R' F2 U2 L U2 L F2 U2 L D2 B2 L'",   
        // "date": 1660464627
        //}

        let sessionDataFormatted = [];
        for (let i = 0; i < sessionLength; i++) {
            let time = Math.floor(sessionData[i][0][1] / 10) / 100;
            let scramble = sessionData[i][1];
            let date = sessionData[i][3];
            sessionDataFormatted.push({
                "time": time,
                "scramble": scramble,
                "date": date
            });
        }

        fs.writeFile(`./src/Data/sessions/${sessionFileName}.json`, JSON.stringify(sessionDataFormatted, null, 4), (err) => {
            if (err) throw err;
        })
    }
});