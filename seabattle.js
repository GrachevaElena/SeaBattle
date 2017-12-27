var express = require('express');
var app = express();
var http = require('http').Server(app);
var io=require("socket.io")(http);
var bodyParser = require("body-parser");
var ios = require('socket.io-express-session');
var session=require('express-session');
var cookie = require('cookie');
var cookieParser=require("cookie-parser");
var db=require("oracledb");
var connection=db.getConnection({
    host:"localhost",
    user:"system",
    password: "Qwerty123",
    database: "seaBattle"
},
    function (err) {
        if (err) {
            console.log("error db");
            return;
        }
        else console.log("created db connection");
    });

app.use(express.static(__dirname + "/client"));
app.use(bodyParser.json());
app.use(cookieParser());

var pl1={name:undefined, shipsField:undefined, readyPlay:false};
var pl2={name:undefined, shipsField:undefined, readyPlay:false};
var players=[pl1, pl2];


app.get('/', function(req, res) {
    pl1.readyPlay=false;
    pl2.readyPlay=false;
    res.sendFile(__dirname+'/client/startPage.html');
});

app.post("/db",function(req,res){
    connection.query("select * from games",
        function(err, rows){
            if (err){console.log(err);return;}
            res.end(JSON.stringify(rows));
        });
});

app.post("/writedb",function(req,res){
    connection.query("INSERT INTO games (time, winner) \n" +
        "    VALUES (?, ?);", [10,  'player 1'], function(err, rows){
        if (err){ console.log(err); return;}
    });
});

app.get('/arrange', function(req, res){
    res.sendFile(__dirname+'/client/arrangeShips.html');
});

app.get('/begin', function(req, res){
    res.sendFile(__dirname+'/client/game.html');
});

app.post('/authentication',function(req, res){
    res.writeHead(200, {
        "Set-Cookie":"name="+req.body.name,
        "Context-type":"text/plain"
    });
    res.end(JSON.stringify(req.body));
});

app.post('/getField',function(req, res){
    var name=req.cookies.name;
    if (name==pl1.name) {
        console.log(JSON.stringify(pl1.shipsField))
        res.end(JSON.stringify(pl1));
    }
    else if (name==pl2.name) {
        res.end(JSON.stringify(pl2));
    }
});

var sid1=undefined, sid2=undefined;
io.on('connection', function(socket){
    socket.on('startGame', function(json){
        pl1.name="player1";
        sid1=socket.id;
    });
    socket.on('joinGame', function(json){
        if (pl1.name==undefined) return;
        else {
            pl2.name="player2";
            sid2=socket.id;
            io.sockets.sockets[sid1].emit('authentication', pl1.name);
            io.sockets.sockets[sid2].emit('authentication', pl2.name);
        }
    });
    socket.on('finishedArrange', function (json) {
        var name=cookie.parse(socket.request.headers.cookie).name;
        console.log("got ships from "+name);
        console.log(name);
        if (name==pl1.name) {
            pl1.shipsField=JSON.parse(json);
            pl1.readyPlay=true;
            console.log(pl1.readyPlay);
            console.log(pl2.readyPlay);
            if (pl2.readyPlay==true)
                io.sockets.emit('begin');
        }
        else if (name==pl2.name) {
            pl2.shipsField=JSON.parse(json);
            pl2.readyPlay=true;
            console.log(pl1.readyPlay);
            console.log(pl2.readyPlay);
            if (pl1.readyPlay==true)
                io.sockets.emit('begin');
        }
    });
    socket.on('step', function (cell) {
        var name=cookie.parse(socket.request.headers.cookie).name;
        var arrShip, res={};
        cell=JSON.parse(cell);
        if (name==pl1.name) {
            arrShip=pl2.shipsField;
        }
        else if (name==pl2.name) {
            arrShip=pl1.shipsField;
        };
        res.action="skip";
        res.cell=cell;
        for(var i=0; i<arrShip.arr.length; i++)
            for (var j=0; j<arrShip.arr[i].coords.length; j++)
                if (arrShip.arr[i].coords[j][0]==cell.coords[0] && arrShip.arr[i].coords[j][1]==cell.coords[1]) {
                    arrShip.arr[i].coords[j].status = "got";
                    var bool=true;
                    for (var k=0; k<arrShip.arr[i].coords.length; k++)
                        if (arrShip.arr[i].coords[k].status != "got") bool=false;
                    if (bool) res.action="killed";
                    else res.action="got";
                }
        io.sockets.emit('parseRes', JSON.stringify(res));
    });
});


http.listen(8081);

console.log("started"+"\n");


