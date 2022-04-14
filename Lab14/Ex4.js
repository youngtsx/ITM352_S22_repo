
var express = require('express');
var app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.send(
        `<form action="/process_form" method="POST">
            Name1: <input name="name1" id="name1"><br>
            Name2: <input name="name2" id="name2"><br>
            <input type="submit" name="Submit" id="Submit" value="Send POST Request">
        </form>`
    );
});

app.post('/process_form', function (req, res) {
        if (req.body['name1'].value == "Tyler") {
            res.send("Found him!");
            if (req.body['name2'].value == "Tyler") {
                res.send("Found him!");
            }
        } else {
            res.send("I couldn't find Tyler :(");
            console.log(req.body['name1'].value);
        }
        return;
});

app.listen(8080, () => console.log(`listening on port 8080`));