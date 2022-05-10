/* AUTHOR: TIFFANY YOUNG S22 
   server for ecommerce website*/
/*referenced assignment 2 code examples, reece nagaoka F21, momoka michimotoF21, lab 12
 (and looked at li xinfeiF21 & joshua chun for inspiration)*/

/*load product data*/
var products = require(__dirname + '/products.json');
var express = require('express');
var app = express();
var fs = require('fs')

/* Initialize QueryString package
const qs = require('query-string'); */

//get session
var session = require('express-session');
app.use(session({ secret: "MySecretKey", resave: true, saveUninitialized: true }));

//get cookie
var cookieParser = require('cookie-parser');
const { request } = require('http');
app.use(cookieParser());

//node mailer
var nodemailer = require('nodemailer');

//user data file
var filename = 'user_data.json';

//store the data from purchase 
var qty_data_obj = {};

/*user logged out
var logged_in = false;*/

//lab 13 ex2b
if (fs.existsSync(filename)) {
   var data = fs.readFileSync(filename, 'utf-8');
   var users = JSON.parse(data);
} else {
   console.log(`${filename} doesn't exist :(`);
}

//get the body
app.use(express.urlencoded({ extended: true }));

/*                 LOGIN                     */
app.post("/process_login", function (request, response) {
   var errors = {};
   //login form info from post
   var user_email = request.body['email'].toLowerCase();
   var the_password = request.body['password']

   //check if username exists, then if entered password matches, lab 13 ex3-4
   if (typeof users[user_email] != 'undefined') {
      //check if entered password matches the stored password
      if (users[user_email].password == the_password) { //copied from momoka F20, changed the contents in the cookie
         var user_cookie = { "email": user_email, "fullname": users[user_email]['name'] };
         response.cookie('user_cookie', JSON.stringify(user_cookie), { maxAge: 900 * 1000 }); // expires in 15 mins
         // back to the products
         response.redirect('./shop.html');
         return;
      } else {
         //doesn't match
         errors['login_err'] = `Wrong Password`;
      }
   } else {
      //email doesn't exist
      errors['login_err'] = `Wrong Email`;
   }
   //redirect to login with error message
   let params = new URLSearchParams(errors);
   params.append('email', user_email); //put email into params
   response.redirect(`./login.html?` + params.toString());
});

/*               REGISTER USERS PAGE                 */
//regex from assignment 2 resources
app.post("/register", function (request, response) {
   var registration_errors = {};
   //check email
   var reg_email = request.body['email'].toLowerCase();

   //check email x@y.z
   if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(request.body.email)) {

   } else {
      registration_errors['email'] = 'Please enter a valid email address';
   }
   // check if email box is empty
   if (reg_email.length == 0) {
      registration_errors['email'] = `Enter an email`;
   }
   //check if email is unique
   if (typeof users[reg_email] != 'undefined') {
      registration_errors['email'] = `This email has already been registered`;
   }

   //check password > 8 
   if (request.body.password.length < 8) {
      registration_errors['password'] = `Minimum 8 characters`;
   } else if (request.body.password.length == 0) { //nothing entered
      registration_errors['password'] = `Enter a password`;
   }

   //check repeated password for matches
   if (request.body['password'] != request.body['repeat_password']) {
      registration_errors['repeat_password'] = `The passwords do not match`;
   }

   //full name validation
   if (/^[A-Za-z, ]+$/.test(request.body['fullname'])) {
      //check if the fullname is correct   
   } else {
      registration_errors['fullname'] = `Please enter your full name`;
   }
   //check if fullname is less than 30 characters
   if (request.body['fullname'].length > 30) {
      registration_errors['fullname'] = `Please enter less than 30 characters`;
   }

   //assignment 2 code examples         Need to change this to route to login, also HOW TO GO TO Cart (checkout) => Login => INVOICE
   //save new registration data to user_data.json
   if (Object.keys(registration_errors).length == 0) {
      console.log('no registration errors')//store user data in json file
      users[reg_email] = {};
      users[reg_email].password = request.body.password;
      users[reg_email].name = request.body.fullname;

      fs.writeFileSync(filename, JSON.stringify(users), "utf-8");

      response.redirect('./login.html'); //all good! => to invoice w/data
   } else {
      request.body['registration_errors'] = JSON.stringify(registration_errors);
      let params = new URLSearchParams(request.body);
      response.redirect("./registration.html" + params.toString());
   }
});

/*             Changing register users' data            */
app.post("/newpw", function (request, response) { //form and nested if statement(line 148) modified from joshua chun
   var reseterrors = {};

   let login_email = request.body['email'].toLowerCase();
   let login_password = request.body['password'];

   if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(login_email) == false) {
      reseterrors['email'] = `Please enter a valid email`;
   } else if (login_email.length == 0) {
      reseterrors['email'] = 'Please enter an email';
   }
   //check repeated password for matches
   if (request.body['newpassword'] != request.body['repeatnewpassword']) {
      reseterrors['repeatnewpassword'] = `The new passwords do not match`;
   }

   if (typeof users[login_email] != 'undefined') {
      if (users[login_email].password == login_password) {
         //Require a minimum of 8 characters
         if (request.body.newpassword.length < 8) {
            reseterrors['newpassword'] = 'Password must have a minimum of 8 characters.';
         }//check if correct password for account
         if (users[login_email].password != login_password) {
            reseterrors['password'] = 'Incorrect password';
         }
         //Confirm that both passwords were entered correctly
         if (request.body.newpassword != request.body.repeatnewpassword) {
            reseterrors['repeatnewpassword'] = 'Both passwords must match';
         }//new password cant be same as old
         if (request.body.newpassword && request.body.repeatnewpassword == login_password) {
            reseterrors['newpassword'] = `New password cannot be the same as the old password`;
         }
      } else { //doesn't match
         reseterrors['password'] = `Incorrect Password`;
      }
   } else { //email doesn't exist
      reseterrors['email'] = `Email has not been registered`;
   }
   //If errors is empty | modified from register section which was taken from momoka michimoto,reece nagaoka
   // let params = new URLSearchParams(request.query);
   if (Object.keys(reseterrors).length == 0) {
      //Write data and send to invoice.html
      //users[login_email] = {}; commented out bc this overwrites the entire object
      users[login_email].password = request.body.newpassword

      //Writes user information into file
      fs.writeFileSync(filename, JSON.stringify(users), "utf-8");

      response.redirect('./login.html'); //all good! => to invoice w/data
      return;
   } else {
      //If there are errors, send back to page with errors
      request.body['reseterrors'] = JSON.stringify(reseterrors);
      let params = new URLSearchParams(request.body);
      response.redirect(`./update_info.html?` + params.toString());
   }
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
   // make session cart at any request
   // anytime it's used
   if (typeof request.session.cart == 'undefined') {
      request.session.cart = {};
   }
   next();
});

/*                        add to cart                            */
// process purchase request (validate quantities, check quantity available)
app.post('/add_to_cart', function (request, response, next) {

   //assume no errors or no quantity
   var products_key = request.body['products_key'];
   var errors = {};
   var check_quantities = false;
   //var no_quantities = true;
   //check for NonNegInt
   for (i in products[products_key]) {
      var quantities = request.body['quantity'];
      if (isNonNegInt(quantities[i]) == false) { //check i quantity
         errors['quantity_' + i] = `Please choose a valid quantity for ${products[products_key][i].item}.`;
      }
      if (quantities[i] > 0) { //check if any quantity is selected
         check_quantities = true;
      }
      if (quantities[i] > products[products_key][i].quantity_available) { //check if quantity is available
         errors['quantity_available' + i] = `We don't have ${(quantities[i])} ${products[products_key][i].item} available.`;
      }
   }
   /* Check to see if quantity is selected */
   if (!check_quantities) {
      errors['no_quantities'] = `Please select a quantity`;
   }
   let params = new URLSearchParams();
   params.append('products_key', products_key);
   //ask if the object is empty or not
   if (Object.keys(errors).length > 0) {//if i have errors, take the errors and go back to products_display.html

      params.append('errors', JSON.stringify(errors));
      response.redirect('./shop.html?' + params.toString());
      return;
   }
   else {
      if (!request.session.cart) { //create shopping cart
         request.session.cart = {};
      }
      if (typeof request.session.cart[products_key] == 'undefined') {//make array for each product category
         request.session.cart[products_key] = [];
      }
      var quantities = request.body['quantity'].map(Number); // Get quantities from the form post and convert strings from form post to numbers
      request.session.cart[products_key] = quantities; // store the quantities array in the session cart object with the same products_key. 
      response.redirect('./cart.html');
      console.log(request.session.cart);
   }
});

app.post("/update_cart", function (request, response) { 
      for (let pkey in request.session.cart) { //loop through cart products
         for (let i in request.session.cart[pkey]) { //loop through product's selected quantity
            if (typeof request.body[`qty_${pkey}_${i}`] != 'undefined') {
               // add/remove updated quantities from inventory in the textbox
               request.session.cart[pkey][i].quantity_available -= request.session.cart[pkey][i]; 
               // update cart data with new quantity
               request.session.cart[pkey][i] = Number(request.body[`qty_${pkey}_${i}`]);
               
            }
         }
      }
   response.redirect("./cart.html"); // goes to shopping cart
});

app.get("/checkout", function (request, response) {
   var errors = {};//check errors
   if (typeof request.cookie["email"] == 'undefined') { //check if logged in by checking for the cookie
      response.redirect(`./login.html`);
      return;
   }
   if (JSON.stringify(errors) === '{}') { //error object is empty => to invoice
      // send to invoice.html 
      let login_email = request.cookie['email'];
      //put their username and email in the URL/string
      let params = new URLSearchParams();
      params.append('fullname', users[login_email]['fullname']); //append fullname in order to get it for the personalization
      response.redirect(`./invoice.html?` + params.toString()); //direct to invoice
      console.log(user_cookie);
   } else {
      response.redirect(`./cart.html`);
   }
});
app.post("/get_fav_data", function (request, response) {//taken from assignment 3 code examples
   //response.json(request.session.fav);
});

app.post("/get_products_data", function (request, response) {//taken from assignment 3 code examples
   response.json(products);
});

app.post("/get_cart", function (request, response) {//taken from assignment 3 code examples
   response.json(request.session.cart);
   console.log(request.session.cart);
});

app.post("/complete_purchase", function (request, response) {//taken from assignment 3 code examples
// Generate HTML invoice string
var invoice_str = `Thank you for your order!<table border><th>Quantity</th><th>Item</th>`;
var shopping_cart = request.session.cart;
for(products_key in products) {
  for(i=0; i< products[products_key].length; i++) {
      if(typeof shopping_cart[products_key] == 'undefined') continue;
      qty = shopping_cart[products_key][i];
      if(qty > 0) {
        invoice_str += `<tr><td>${qty}</td><td>${products[products_key][i].name}</td><tr>`;
      }
  }
}
invoice_str += '</table>';
// Set up mail server. Only will work on UH Network due to security restrictions
var transporter = nodemailer.createTransport({
  host: "mail.hawaii.edu",
  port: 25,
  secure: false, // use TLS
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  }
});

var user_email = request.session.email;
var mailOptions = {
  from: 'tyoung24@hawaii.edu',
  to: user_email,
  subject: 'Your invoice from Tiffany\'s Boba shop',
  html: invoice_str
};

transporter.sendMail(mailOptions, function(error, info){
   if (error) {
      invoice_str += '<br>There was an error and your invoice could not be emailed :(';
  } else {
      invoice_str += `<br>Your invoice was mailed to ${user_email}`;
  }
  response.clearCookie("user_cookie"); //log out
  response.send(`<script>alert('Invoice has been sent'); location.href="/index.html"</script>`);
  request.session.destroy(); //clear cart
  
});

});

//logout button
app.get("/logout", function (request, response, next) {
   response.clearCookie("user_cookie");
   request.session.destroy(); 
   //redirect to the index.html page when user logs out
   response.send(`<script>alert('Logged Out'); location.href="/index.html"</script>`);
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