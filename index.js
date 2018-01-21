// index.js

var express    =    require('express');
var app        =    express();

require('./app/server')(app);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server     =    app.listen(2000,function(){
	console.log("Express is running on port 2000");
});