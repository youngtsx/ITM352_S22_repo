var express = require('express');
var app = express();
const fs = require('fs');

var filename = 'user_data.json';

if (fs.existsSync(filename)) {
    var data = fs.readFileSync(filename, 'utf-8');
    var user_data_obj = JSON.parse(data);
    console.log(user_data_obj);

    var file_stats = fs.statSync(filename);
    console.log(`${filename} has ${file_stats.size} characters`);

} else {
    console.log(`${filename} doesn't exist :(`);
}

app.use(express.urlencoded({ extended: true }));

app.get("/login", function (request, response) {
    // Give a simple login form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    let login_username = request.body['username'];
    let login_password = request.body['password'];

    if (typeof user_data_obj[login_username == 'undefined']) {
        if (typeof user_data_obj[login_username]["password"] == login_password) {
            response.send(`${login_username} is logged in`);
        } else {
        response.send(`Incorrect password for ${login_username}`)
        } 
    }
    else {
        response.send(`${login_username} does not exist`);
    }
    response.send('processing login', JSON.stringify(request.body));
});

app.listen(8080, () => console.log(`listening on port 8080`));