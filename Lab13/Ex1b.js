//var user_reg_data = require('./user_data.json');
const fs = require('fs');

var filename = 'user_data.json';
var data = fs.readFileSync(filename, 'utf-8');
var user_data_obj = JSON.parse(data);
console.log(user_data_obj["dport"]["password"]);
