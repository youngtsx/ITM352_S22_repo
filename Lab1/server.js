var express = require('express');
var app = express();
app.all('*', function (request, response, next) {
    response.send(request.method + ' to path ' + request.path);
});
app.use(express.static(__dirname + '/static'));
app.listen(8080, () => console.log(`listening on port 8080`));