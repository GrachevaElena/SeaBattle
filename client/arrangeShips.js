
var socket = io();

function CreateMainField(){
    var table=document.getElementById("field");
    CreateField(table, arrCells, CellClick);
}

function CheckAndCreateShip(cell){
    function MakeNewShip(ship) {

        var bool = false;
        if (ship.coords.length > 1) {
            var dirX = Math.abs(ship.coords[ship.coords.length - 1][0] - ship.coords[0][0]);
            var dirY = Math.abs(ship.coords[ship.coords.length - 1][1] - ship.coords[0][1]);
            var dirX2 = Math.abs(cell.coords[0] - cell1.coords[0]);
            var dirY2 = Math.abs(cell.coords[1] - cell1.coords[1]);
            if (dirX == dirX2 || dirY == dirY2) bool = true;
        } else bool = true;

        if (bool) {
            ship.coords[ship.coords.length] = cell.coords;
            return ship;
        }

        return undefined;
    };
    function FindNumShipsNear() {
        var shipFoundNear=0;
        for (var i = -1; i <= 1; i++)
            for (var j = -1; j <= 1; j++)
                if (i != 0 || j != 0) {
                    cell1 = JSON.parse(JSON.stringify(cell));
                    cell1.coords[0] += i;
                    cell1.coords[1] += j;
                    ship = arrShips.getShip(cell1);
                    if (ship != undefined)
                        shipFoundNear += 1;
                }
        return shipFoundNear;
    };
    function ContinueShip(){
        for (var j=-1; j<=1; j+=2) {
            cell1 = JSON.parse(JSON.stringify(cell));
            cell1.coords[1] += j;
            ship = arrShips.getShip(cell1);
            if (ship != undefined && CanContinue(ship.getLen()+1)) {
                if (MakeNewShip(ship) != undefined) return ship;
                return undefined;
            }
        }
        for (var i=-1; i<=1; i+=2) {
            cell1 = JSON.parse(JSON.stringify(cell));
            cell1.coords[0] += i;
            ship = arrShips.getShip(cell1);
            if (ship != undefined && CanContinue(ship.getLen()+1)) {
                if (MakeNewShip(ship) != undefined ) return ship;
                return undefined;
            }
        }
    };
    function CanContinue(len){
        //если не больше 10 будет
        if (len>4) return false;
        if (arrShips.getNumShips()==10 && len==1) return false;
        if (arrShips.getNumShips()>10) return false;

        //есть ли корабли большей или равной длины
        var arrLen=arrShips.getPossibleLen();
        var bool=false;
        for (var i=0; i<arrLen.length; i++)
            if (arrLen[i]>=len) bool=true;
        if (bool==false) return false;

        //превышение<=нехватки
        if (arrShips.getSuperiorNum(len)<=arrShips.getNumLeft(len)) return true;

        return false;
    };

    var ship=undefined;
    var cell1;
    var shipFoundNear=FindNumShipsNear();

    //можно поставить однопалубник
    if (shipFoundNear==0 && CanContinue(1)) {
        return CreateShip(cell);
    }

    //можно продолжить корабль, вокруг пусто
    if (shipFoundNear==1) {
        return ContinueShip();
    }

    return undefined;
}

function CellClick(cell){

    var ship=arrShips.getShip(cell);
    if (ship!=undefined){
        arrShips.deleteShip(ship);
        arrCells.setCells(ship.coords, "empty");
    }
    else {
        var ship = CheckAndCreateShip(cell);
        if (ship!=undefined) {
            if (ship.coords.length == 1) arrShips.addShip(ship);
            arrCells.setCells(ship.coords, "ship");
            RefreshShips();
        }
    }

}

function RefreshShips(){
    var arrLeft=arrShips.getNumShipsOfL();
    for (var i=0, l=1; i<4; i++, l++)
        arrLeft[i]=(5-l)-arrLeft[i];

    var l1=document.getElementById("one");
    l1.innerHTML=arrLeft[0];
    var l2=document.getElementById("two");
    l2.innerHTML=arrLeft[1];
    var l3=document.getElementById("three");
    l3.innerHTML=arrLeft[2];
    var l4=document.getElementById("four");
    l4.innerHTML=arrLeft[3];
}

function StartGame(){
    var l1=document.getElementById("one");
    if (Number(l1.innerHTML)!=0) return;
    var l2=document.getElementById("two");
    if (Number(l2.innerHTML)!=0) return;
    var l3=document.getElementById("three");
    if (Number(l3.innerHTML)!=0) return;
    var l4=document.getElementById("four");
    if (Number(l4.innerHTML)!=0) return;

    var l=document.getElementById("wait");
    l.innerHTML="please, wait for your enemy";

    socket.emit("finishedArrange", JSON.stringify(arrShips));
}

socket.on("begin", function(name){
    document.location.href = "http://localhost:8081/begin";
});
