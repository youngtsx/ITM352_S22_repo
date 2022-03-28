/*michimoto momoka, reece nagaoka, lab 12 */
/*load product data*/ 
var products= require(__dirname + '/products.json');

products.forEach( (prod,i) => {prod.quantity_available = 52});
var express = require('express');
var app = express();

/* Initialize QueryString package */
const qs = require('query-string');

//get the body
app.use(express.urlencoded({ extended: true }));

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

// process purchase request (validate quantities, check quantity available)
app.post('/process_form', function (request, response, next){
   var quantities = request.body['quantity'];
   //assume no errors or quantity
   var errors = {};
   var check_quantities = false;
   //check for NonNegInt
   for (i in quantities) {
      if (isNonNegInt(quantities[i]) == false){
         errors['quantity_' + i] = `Please choose a valid quantity for ${products[i].item}.`;
      }
      if (quantities[i] > 0 ) {
         check_quantities = true;
      }
      if (quantities[i] > products[i].quantity_available) {
         errors['quantity_available' + i] = `We don't have ${(quantities[i])} ${products[i].item} available.`;
      }
   }
   if (!check_quantities) {
      errors['no_quantities'] = `Please select a quantity`;
   }

   let qty_obj = { "quantity": JSON.stringify(quantities)};
    //ask if the object is empty or not
    if (Object.keys(errors).length == 0) {
      // remove from inventory quantities
      for(i in products){
          products[i].quantity_available -= Number(quantities[i]);
      }
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