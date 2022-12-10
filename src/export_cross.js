const fs = require("fs-extra");

//aggregate all the date from the sessions folder into one file in cross-sessionsExport.json
//get all the files in the folder
let files = fs.readdirSync("./src/Data/sessions");
//create an array to store all the data
let data = [];
//loop through all the files
for (let i = 0; i < files.length; i++) {
    //get the current file
    let file = files[i];
    //read the file
    let fileData = fs.readFileSync(`./src/Data/sessions/${file}`, 'utf-8');
    //parse the file
    fileData = JSON.parse(fileData);
    //add every solve of the filData to the data array
    for (let j = 0; j < fileData.length; j++) {
        data.push(fileData[j]);
    }
}

//length
let sessionLength = data.length;
//convert to date
let date = new Date();
//get the session name to format DD_MM_YYYY_sizesessionLength.json
//make days less than 10 have a 0 in front use ternary operator
let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
let month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();
let year = date.getFullYear();
let sessionFileName = year + "_" + (month + 1) + "_" + day + "_size" + sessionLength + ".json";


//write the data to the cross-sessionsExport.json file
fs.writeFile(`./src/Data/cross-sessionsExports/${sessionFileName}`, JSON.stringify(data, null, 4), (err) => {
    if (err) throw err;
});

//write the date file to the .src/currentData/input.json file
fs.writeFile("./src/currentData/input.json", JSON.stringify(data, null, 4), (err) => {
    if (err) throw err;
});