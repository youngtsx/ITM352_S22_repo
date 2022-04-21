var express = require('express');
var app = express();
const fs = require('fs');

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var session = require('express-session');
app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));

var filename = 'user_data.json';

app.get('/set_cookie', function(request, response) {
    //sends cookie 
var myName = 'Tiff Young';
response.cookie('users_name', myName);
response.send(`Cookie has been sent for ${myName}`);
});

app.get('/expire_cookie', function(request, response) {
    //sends cookie 
var myName = 'Tiff Young';
response.cookie('users_name', '', {expire: 0});
response.send(`Cookie has been sent for ${myName}`);
});

app.get('/use_cookie', function(request, response) {
    //gets name cookie
    console.log(request.cookie);
    response.send(`Welcome to the Use Cookie page ${request.cookie[users_name]}`);
});

app.get('/use_session',function(response, request){
    console.log(request.session);
    response.send(`Welcome, your session ID is ${request.session.id}`);
});

if (fs.existsSync(filename)) {
    var data = fs.readFileSync(filename, 'utf-8');
    var users = JSON.parse(data);

    var file_stats = fs.statSync(filename);

} else {
    console.log(`${filename} doesn't exist :(`);
}

app.use(express.urlencoded({ extended: true }));

app.get("/login", function (request, response) {
    // Give a simple login form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="usernames" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

app.post("/login", function (request, response) {
console.log(request.body);
// Process login form POST and redirect to logged in page if ok, back to login page if not
let login_username = request.body['usernames'];
let login_password = request.body['password'];

    if (typeof users[login_username] != 'undefined') {
        //username exists so get stored password and check if it is correct
        if (users[login_username]['password'] == login_password) {
            response.send(`${login_username} is logged in`);
            return;
        } else {
        response.send(`Incorrect password for ${login_username}`)
        } 
    }
    else {
        response.send(`${login_username} does not exist`);
    }
});

app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

 app.post("/register", function (request, response) {
    // process a simple register form
console.log(request.body);
    let username = request.body['username'];
    users['username'] = {};
    users['username']['password'] = request.body['password'];
    users['username']['email'] = request.body['email'];

    fs.writeFileSync(filename, JSON.stringify(users));
 });

app.listen(8080, () => console.log(`listening on port 8080`));