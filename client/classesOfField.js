var letter=["A","B","C","D","E","F","G","H","I","J"];
//массив arr кораблей
var arrShips={
    arr:[],
    getShip: (function (cell) {
        for (var i = 0; i < this.arr.length; i++)
            for (var j = 0; j < this.arr[i].coords.length; j++)
                if (this.arr[i].coords[j][0] == cell.coords[0] && this.arr[i].coords[j][1] == cell.coords[1])
                    return this.arr[i];
        return undefined;
    }),
    addShip: (function(ship){
        this.arr[this.arr.length]=(ship);
    }),
    deleteShip: (function(ship){
        this.arr.splice(this.arr.indexOf(ship),1);
    }),
    getPossibleLen: (function() {
        var arrLen = [];
        for (l = 1; l <= 4; l++) {
            var ch=0;
            for (i = 0; i < this.arr.length; i++)
                if (this.arr[i].getLen() == l) ch++;
            if (ch<(5-l)) arrLen[arrLen.length]=l;
        }
        return arrLen;
    }),
    getNumShips: (function(){
        return this.arr.length;
    }),
    getNumShipsOfL: (function(){
        var ch=[];
        for (var l=1; l<=4; l++){
            var ch1=0;
            for (var i = 0; i < this.arr.length; i++)
                if (this.arr[i].getLen() == l) ch1++;
            ch[ch.length]=ch1;
        }
        return ch;
    }),
    getSuperiorNum:(function(len){
        var chL=this.getNumShipsOfL();
        chL[len-1]++;
        chL[len-2]--;
        var s=0;
        for (var i=0, l=1; i<4; i++, l++)
            if ((5-l)-chL[i]<0) s+=(chL[i]-(5-l));
        return s;
    }),
    getLeft: (function () {
        var chL=this.getNumShipsOfL();
        var s=[0,0,0,0];
        for (var i=0, l=1; i<4; i++, l++)
            if ((5-l)-chL[i]>0) s[i]=-(chL[i]-(5-l));
        return s;
    }),
    getNumLeft: (function(len){
        var left=this.getLeft();
        left[len-1]++;
        left[len-2]--;
        var s=0;
        for (var i=0; i<4; i++) s+=left[i];
        return s;
    })
};
//двумерный массив arr
var arrCells= {
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

function CreateField(table, arrCell, event) {

    var rowLetters = document.createElement("tr");

    var thEmpty = document.createElement("th");
    thEmpty.classList.add('cellHead');
    rowLetters.appendChild(thEmpty);

    for (i = 0; i < 10; i = i + 1) {
        var th = document.createElement("th");
        th.innerHTML = letter[i];
        th.classList.add('cellHead');
        rowLetters.appendChild(th);
    }
    table.appendChild(rowLetters);

    for (i = 0; i < 10; i++) {
        var row = document.createElement("tr");

        var th = document.createElement("th");
        th.innerHTML = (i+1);
        th.classList.add('cellHead');
        row.appendChild(th);

        var rowCells=[];
        for (j = 0; j < 10; j++) {
            var td = document.createElement("td");
            td.id=letter[j]+(i+1);
            td.onclick=(function (){
                event(CreateCell(this));
            });

            td.classList.add("cellEmpty");

            row.appendChild(td);

            rowCells[rowCells.length]=CreateCell(td);
        }
        arrCell.arr[arrCell.arr.length]=rowCells;
        table.appendChild(row);
    }
}
//td, coords, status
function CreateCell(td){
    var let=td.id.substr(0,1);
    var j=letter.indexOf(let);
    var i=Number(td.id.substr(1,td.id.length))-1;

    var cell={td:td, coords: [i,j], status: "empty"};
    return cell;
}
//массив координат
function CreateShip(cell){
    var ship = {
        coords: [cell.coords],
        getLen: (function(){
            return this.coords.length;
        })
    };
    return ship;
}