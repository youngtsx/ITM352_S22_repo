/*load product data*/ 
var products= require(__dirname + '/products.json');

products.forEach( (prod,i) => {prod.total_sold = 0});
var express = require('express');
var app = express();

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

});

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));