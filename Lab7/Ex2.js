require("./products_data.js");

var num_products = 5;
var counter = 0
while(counter < num_products) {
    counter++;
    if(counter > num_products/2){
        console.log("Don’t ask for anything else!");
        process.exit(); //break
    }
    if(counter > 0.25*num_products && counter < 0.75*num_products){
        console.log(`Item #${counter} is sold out!`);
        continue; //breaks one iteration in the loop and continues on
}
console.log(`${counter}. ${eval('name' + counter)}`);
}
console.log("That's all we have!")