var socket = io();

var myArrCells= {
    arr: [],
    getCell: (function (coords) {
        return this.arr[coords[0]][coords[1]];
    }),
    setCells: (function (coords, status) {
        for (i=0; i<coords.length; i++) {
            this.arr[coords[i][0]][coords[i][1]].status = status;
            this.arr[coords[i][0]][coords[i][1]].td.classList.remove("cellEmpty");
            this.arr[coords[i][0]][coords[i][1]].td.classList.remove("cellShip");
            this.arr[coords[i][0]][coords[i][1]].td.classList.remove("cellSkip");
            this.arr[coords[i][0]][coords[i][1]].td.classList.remove("cellGot");
            this.arr[coords[i][0]][coords[i][1]].td.classList.remove("cellKilled");
            if (status=="empty")
                this.arr[coords[i][0]][coords[i][1]].td.classList.add("cellEmpty");
            if (status=="killed")
                this.arr[coords[i][0]][coords[i][1]].td.classList.add("cellKilled");
            if (status=="skip")
                this.arr[coords[i][0]][coords[i][1]].td.classList.add("cellSkip");
            if (status=="ship")
                this.arr[coords[i][0]][coords[i][1]].td.classList.add("cellShip");
            if (status=="got")
                this.arr[coords[i][0]][coords[i][1]].td.classList.add("cellGot");
        }
    })
};
var enemyArrCells= {
    arr: [],
    getCell: (function (coords) {
        return this.arr[coords[0]][coords[1]];
    }),
    setCells: (function (coords, status) {
        for (i = 0; i < coords.length; i++) {
            this.arr[coords[i][0]][coords[i][1]].status = status;
            this.arr[coords[i][0]][coords[i][1]].td.classList.remove("cellEmpty");
            this.arr[coords[i][0]][coords[i][1]].td.classList.remove("cellShip");
            this.arr[coords[i][0]][coords[i][1]].td.classList.remove("cellSkip");
            this.arr[coords[i][0]][coords[i][1]].td.classList.remove("cellGot");
            this.arr[coords[i][0]][coords[i][1]].td.classList.remove("cellKilled");
            if (status == "empty")
                this.arr[coords[i][0]][coords[i][1]].td.classList.add("cellEmpty");
            if (status == "killed")
                this.arr[coords[i][0]][coords[i][1]].td.classList.add("cellKilled");
            if (status == "skip")
                this.arr[coords[i][0]][coords[i][1]].td.classList.add("cellSkip");
            if (status == "ship")
                this.arr[coords[i][0]][coords[i][1]].td.classList.add("cellShip");
            if (status == "got")
                this.arr[coords[i][0]][coords[i][1]].td.classList.add("cellGot");
        }
    })
};

var l;

function CreateFields(){
    var table1=document.getElementById("myField");
    CreateField(table1, myArrCells, Empty);
    var table2=document.getElementById("enemyField");
    CreateField(table2, enemyArrCells, MakeStep);

    l=document.getElementById("info")
    GetShips();
}

function GetShips(){
    $.ajax({
        url: "/getField",
        type: "POST",
        data: JSON.stringify({}),
        dataType: "json",
        success: SetShips,
        error: (function () {
            alert("ajax authentication failed");
        }),
        contentType: 'application/json'
    });
}

function SetShips(player){
    for (var i=0; i<player.shipsField.arr.length; i++)
        myArrCells.setCells(player.shipsField.arr[i].coords, "ship");

    DetStep(player.name);
}

function DetStep(name) {
    if (name=="player1") {
        l.innerHTML="your step";
    }
    if (name=="player2") {
        l.innerHTML="wait for your enemy's step...";
    }
}

function ChangeInfo(){
    if(l.innerHTML=="your step") l.innerHTML="wait for your enemy's step...";
    if(l.innerHTML=="wait for your enemy's step...") l.innerHTML="your step";
}

function Empty(cell) {
}

function MakeStep(cell) {
    if (l.innerHTML=="wait for your enemy's step...") return;
    socket.emit('step', JSON.stringify(cell));
}

var mych=0;
var enemych=0;
socket.on('parseRes', function(res){
    res=JSON.parse(res);
    if(l.innerHTML=="your step") {
        enemyArrCells.setCells([res.cell.coords], res.action);
        if (res.action=="skip") l.innerHTML="wait for your enemy's step...";
        if (res.action=="got" || res.action=="killed" ) enemych++;
        if (enemych==20) Win();
    }
    else if(l.innerHTML=="wait for your enemy's step...") {
        myArrCells.setCells([res.cell.coords], res.action);
        if (res.action=="skip") l.innerHTML="your step";
        if (res.action=="got" || res.action=="killed" ) mych++;
        if (mych==20) Lose();
    }
});

function Lose(){
    alert("You lose");
    //GameOver();
}

function Win(){
    alert("You win");
}

function GameOver(){
    $.ajax({
        url: "/writedb",
        type: "POST",
        error: (function () {
            alert("ajax write db failed");
        })
    });
}