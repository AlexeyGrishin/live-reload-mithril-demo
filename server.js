var http = require('http');
var nodeStatic = require('node-static');
var file = new nodeStatic.Server('./public');

http.createServer(function(req, res) {
    file.serve(req, res);
}).listen(3000);

console.log('Server running on port 3000');