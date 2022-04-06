/*michimoto momoka, reece nagaoka, lab 12 */
/*load product data*/ 
var products= require(__dirname + '/products.json');
var express = require('express');
var app = express();
var fs = require('fs')
/* Initialize QueryString package */
const qs = require('query-string');

//user data file
var filename = 'user_data.json';

//store the data from purchase 
var qty_data_obj = {};

//lab 13 ex2b
if (fs.existsSync(filename)) {
   var file_stats = fs.statSync(filename);
   var data = fs.readFileSync(filename, 'utf-8');
   var users = JSON.parse(data);
} else {
   console.log(`${filename} doesn't exist :(`);
}

//get the body
app.use(express.urlencoded({ extended: true }));

/*LOGIN*/
app.post("/process_login", function (request, response) {
var errors = {};
//process login form from post

//check if username exists, then if entered password matches, lab 13 ex3-4

//direct to invoice page



});

/*REGISTER USERS PAGE*/
app.post("/register", function (request, response) {

//check email

//check password

//check repeated password for matches

//full name, only letters <=30 characters



//save new registration data to user_data.json

});

// Routing 
app.get("/products.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

/*PURCHASE*/ 
// process purchase request (validate quantities, check quantity available)
app.post('/process_form', function (request, response, next){
   var quantities = request.body['quantity'];
   //assume no errors or no quantity
   var errors = {};
   var check_quantities = false;
   //check for NonNegInt
   for (i in quantities) {
      if (isNonNegInt(quantities[i]) == false){ //check i quantity
         errors['quantity_' + i] = `Please choose a valid quantity for ${products[i].item}.`;
      }
      if (quantities[i] > 0 ) { //check if any quantity is selected
         check_quantities = true;
      }
      if (quantities[i] > products[i].quantity_available) { //check if quantity is available
         errors['quantity_available' + i] = `We don't have ${(quantities[i])} ${products[i].item} available.`;
      }
   }
   if (!check_quantities) { //check if no quantity selected
      errors['no_quantities'] = `Please select a quantity`;
   }

   let qty_obj = { "quantity": JSON.stringify(quantities)};
    //ask if the object is empty or not
    if (Object.keys(errors).length == 0) {
      // remove quantities purchased from inventory quantities
      for(i in products){
          products[i].quantity_available -= Number(quantities[i]);
      }
      //save quantity data for invoice *****change this to redirect to ./login.html
      response.redirect('./invoice.html?' + qs.stringify(qty_obj));
      } 
   else { //if i have errors, take the errors and go back to products_display.html
      let errs_obj = { "errors": JSON.stringify(errors) };
      console.log(qs.stringify(qty_obj));
      response.redirect('./shop.html?' + qs.stringify(qty_obj) + '&' + qs.stringify(errs_obj));
  }
});

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));

//is nonnegint function
function isNonNegInt(q, returnErrors = false) {
   errors = []; // assume no errors
   if (q == '') q = 0  //blank means 0
   if (Number(q) != q) errors.push('<font color="red">Not a number</font>'); //check if value is a number
   if (q < 0) errors.push('<font color="red">Negative value</font>'); // Check if it is non-negative
   if (parseInt(q) != q) errors.push('<font color="red">Not an integer</font>'); // Check if it is an integer

   return returnErrors ? errors : (errors.length == 0);
}