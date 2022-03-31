const fs = require('fs');

var filename = 'user_data.json';

if (fs.existsSync(filename)) {
    var data = fs.readFileSync(filename, 'utf-8');
    var user_data_obj = JSON.parse(data);
    if (typeof user_data_obj["dport"] != 'undefined') {
    console.log(user_data_obj["dport"]["password"]);
    }
} else {
    console.log(`${filename} not found booo :(`);
}