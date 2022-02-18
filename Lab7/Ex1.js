require("./products_data.js");

var num_products = 5;
var counter = 1
while(counter <= (num_products/2)) {
   counter++;
   console.log(`${counter}. ${eval('name' + counter)}`);
}
console.log("That's all we have!")