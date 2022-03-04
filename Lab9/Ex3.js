/*var attributes = "Tiffany;20;MIS";
name = "Tiffany";
age = 20;

var attributes = name + ";" + age + ";" + (age + 0.5) + (0.5-age);

var parts = attributes.split(";");

for(part of parts) {
    console.log(parts)
}*/

var attributes = "Tiffany;20;20.5;-19.5";
var parts_array = attributes.split(";");

/*for(let part of parts_array) {
    console.log(`part ${part} is a ${typeof part} `);
}*/

console.log(parts_array.join('-'));