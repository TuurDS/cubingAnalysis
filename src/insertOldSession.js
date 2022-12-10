const fs = require("fs-extra");
const moment = require('moment');
const Cube = require('cubejs');
Cube.initSolver();

//read first file in ./src/old
let files = fs.readdirSync("./src/old");
let data = fs.readFileSync(`./src/old/${files[0]}`, { encoding: 'utf-8' });
let arr = data.split("\r\n");

//devide the arr in chunks of random range between 30 and 250
let chunkSize = Math.floor(Math.random() * 220) + 30;
let chunks = [];
let currentChunk = [];
for (let i = 0; i < arr.length; i++) {
    currentChunk.push(arr[i]);
    if (currentChunk.length === chunkSize) {
        chunks.push(currentChunk);
        currentChunk = [];
        chunkSize = Math.floor(Math.random() * 220) + 30;
    }
}
if (currentChunk.length > 0) {
    chunks.push(currentChunk);
}
//log the chunks
console.log(chunks.length);

// "session1": [
//     [
//       [
//         0,
//         12266
//       ],
//       "L2 F' R' B2 U D R2 L F R' F2 U2 L U2 L F2 U2 L D2 B2 L'",
//       "",
//       1660464627
//     ],
//     ...
//   ],

//make an array the size of the arr with string of Cube.scramble() in it
let scrambles = [];
let startTime = Date.now();
let groupTime = startTime;
for (let i = 0; i < 10; i++) {
    scrambles.push(Cube.scramble());
    //log each 500 scrambles and how muc time it took
    if (i % 100 === 0) {
        let newStartTime = Date.now();
        console.log(`\x1b[33m${i}\x1b[36m | \x1b[32m${(newStartTime - groupTime) / 1000}\x1b[36m seconds | \x1b[32m${(newStartTime - startTime) / 1000}\x1b[36m seconds`);
        groupTime = newStartTime;
    }
}


let newObj = {
    "properties": {
        "sessionData": "",
        "color": "u",
        "col-back": "#002233",
        "col-board": "#003344",
        "col-button": "#bb8800",
        "col-font": "#ffffff",
        "col-link": "#2288dd",
        "col-logo": "#667788",
        "col-logoback": "#003344",
        "sessionN": 0,
        "timeU": "u",
        "disPrec": "3",
        "toolsfunc": "[\"hugestats\",\"stats\",\"cross\",\"distribution\"]",
        "tools": true,
        "session": 0
    }
};

//make the above format for each chunk
let sessionData = {};

for (let i = 0; i < chunks.length; i++) {
    let session = [];
    //make the date = i amount of days before 16_04_2022 00:00:00 And give it a random time max is 21:59:59
    let SessionStartDate = moment.utc("2022-04-16").subtract(i, 'days')
        //generate hour between 9 and 21
        .add(Math.floor(Math.random() * 12) + 9, 'hours')
        .add(Math.floor(Math.random() * 59), 'minutes')
        .add(Math.floor(Math.random() * 60), 'seconds')
        .format("X");
    let previousDate = SessionStartDate;
    for (let j = chunks[i].length - 1; j >= 0; j--) {
        let originalTime = chunks[i][j];
        let time = parseFloat(originalTime * 1000 + Math.floor(Math.random() * 10));
        //the currentDate is the previousDate + random between 15-45 seconds
        let currentDate = moment.utc(previousDate, "X").add(Math.floor(Math.random() * 30) + 15, 'seconds').format("X");
        //let scramble = scrambles.pop();
        //random scramble from the scrambles array
        let scramble = scrambles[Math.floor(Math.random() * scrambles.length)];
        let sessionData = [[0, time], scramble, "", currentDate];
        session.push(sessionData);
        previousDate = currentDate;
    }

    const sessionNumber = chunks.length - i;
    //make the above format for the session
    let sessionObj = {
        "name": moment.utc(SessionStartDate, "X").format("M.DD") + " 333",
        "opt": {},
        "rank": sessionNumber,
        "stat": [chunks[i].length, 0, Math.floor(chunks[i].reduce((a, b) => a + b, 0) / chunks[i].length)],
        "date": [SessionStartDate, previousDate]
    }

    newObj[`session${sessionNumber}`] = session;
    sessionData[sessionNumber] = sessionObj;
}

//set the sessionData to the newObj
newObj.properties.sessionData = JSON.stringify(sessionData);

//set the sessionN and session to the amount of sessions
newObj.properties.sessionN = chunks.length;
newObj.properties.session = chunks.length;

let crossData = JSON.parse(fs.readFileSync(`./src/currentData/csTimerExport.json`, { encoding: 'utf-8' }));

let oldSessionData = JSON.parse(crossData.properties.sessionData);
//increase the keys of the oldSessionData by the amount of sessions and the value.rank by the amount of sessions
//loop from the back

for (let i = Object.keys(oldSessionData).length; i > 0; i--) {
    let key = i;
    let newKey = parseInt(key) + chunks.length;
    oldSessionData[newKey] = oldSessionData[key];
    oldSessionData[newKey].rank = oldSessionData[key].rank + chunks.length;
    //if the old name is just a number do the below
    const test = oldSessionData[key].name;
    if (!isNaN(oldSessionData[key].name)) {
        //make sure the name is the startdate of the session in this format M.DD 333
        oldSessionData[newKey].name = moment.utc(oldSessionData[newKey].date[0], "X").format("M.DD") + " 333";
    }
    delete oldSessionData[key];
}
//add the new sessionData to the oldSessionData
let newSessionData = JSON.parse(newObj.properties.sessionData);
for (let key in newSessionData) {
    oldSessionData[key] = newSessionData[key];
}

//loop reverse order and set the sessionData to the oldSessionData
for (let i = Object.keys(crossData).length; i > 0; i--) {
    let key = Object.keys(crossData)[i - 1];
    if (key.startsWith("session")) {
        let newKey = parseInt(key.replace("session", "")) + chunks.length;
        crossData[`session${newKey}`] = crossData[key];
        delete crossData[key];
    }
}

//add the sessions from the newObj into crossData
for (let key in newObj) {
    if (key.startsWith("session")) {
        crossData[key] = newObj[key];
    }
}

//increase the sessionN and session by the amount of sessions
crossData.properties.sessionN = parseInt(crossData.properties.sessionN) + chunks.length;
crossData.properties.session = parseInt(crossData.properties.session) + chunks.length;

//set the oldSessionData the the sessionData of crossData
crossData.properties.sessionData = JSON.stringify(oldSessionData);

//write the newObj to a file in ./src/old formatted
fs.writeFileSync("./src/old/combined.json", JSON.stringify(crossData, null, 4));

