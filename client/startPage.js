var socket = io();

var Enemy=undefined;

function ButtonStartGame(){
    WaitingForEnemy(GetName());
}

function GetName(){
    var now = new Date();
    var name=now;
    return name;
}

function ButtonJoin(){
    GetEnemy(GetName());
}

function WaitingForEnemy(name){
    var labelInfo=document.getElementById("labelInfo");
    labelInfo.innerHTML="waiting for enemy...";

    socket.emit("startGame", JSON.stringify({login: name}));
}

function GetEnemy(name){
    socket.emit("joinGame", JSON.stringify({login: name}));
}

socket.on("authentication", function(name){
    var labelInfo=document.getElementById("labelInfo");
    labelInfo.innerHTML+=name+"    ";
    $.ajax({
        url: "/authentication",
        type: "POST",
        data: JSON.stringify({name:name}),
        dataType: "json",
        success: Arrange,
        error: (function () {
            alert("ajax authentication failed");
        }),
        contentType: 'application/json'
    });
});



function Arrange(){
    document.location.href = "http://localhost:8081/arrange";
}

function ShowGotGames(data){
    var p=document.getElementById("games");
    p.innerHTML=data;
}
function ShowGames(){
    $.ajax({
        url: "/db",
        type: "POST",
        data: JSON.stringify({}),
        dataType: "json",
        success: ShowGotGames,
        error: (function () {
            alert("ajax db failed");
        }),
        contentType: 'application/json'
    });
};
