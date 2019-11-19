

// Lite version of ion channels with 3 charges, membrane column, and ion
// exchange.


import {js_clock} from "./clocks.js"
import {create_rect_fn} from "./utils.js"
import {create_cell, on_boundary} from "./cell_spec_lite.js"


var n = 14;
var side = 16;

var sodium = 1.5;
var potassium = 1;
var chloride = -1;
var neutral = 0;
var active = 1;
var inactive = 0;


var canvas = document.getElementById( 'svgCanvas' );
var pW = canvas.clientWidth;
var pH = canvas.clientHeight;


var pWidth = pW - pW%n
var pHeight = pH - pH%n

console.log(pWidth + "  " + pHeight);

// 40 * 40 grid
var scale_w = Math.floor(pWidth/n);
var scale_h = Math.floor(pHeight/n);

var create_rect = create_rect_fn(scale_w, scale_h, canvas);

//var rect = create_rect(0,0,pWidth,pHeight,"#add8e6");
// var rect2 = create_rect(0, pHeight/(2*scale_w), pWidth, pHeight/2, "#fadadd");


var rafId = null;

var yellow = "#ffffa1"
var green = "#98ee90"
var purple = "#e3daff"
var red = "#ff0000"; //active
var black = "#000000" //inactive

var scale = 0.9*Math.min(pWidth, pHeight);
var pi = Math.PI;

// var rect = create_rect(0,0,pWidth,pHeight/2,"#add8e6");
// var rect2 = create_rect(0, pHeight/(2*scale_w), pWidth, pHeight/2, "#fadadd");

var store_src = [];


var cells = [];

// inititalize envrionment cells
for (var i = 0; i < n; i++) {

    cells[i] = []

    for(var j = 0; j< n; j++){

        if ( j == n/2){

            cells[i][j] = create_cell(i,j,"env");
            cells[i][j].rect = create_rect(i, j, side, side, black);
            cells[i][j].state = neutral; //negative charge
            cells[i][j].rect.state = potassium
        }
        else{

            var renv = Math.random()

            if( renv <= 0.3){
                cells[i][j] = create_cell(i,j,"env");
                cells[i][j].rect = create_rect(i, j, side+8, side+8, purple);
                cells[i][j].state = potassium; //negative charge
                cells[i][j].rect.state = potassium
            }
            else if(renv > 0.3 && renv <= 0.6){
                cells[i][j] = create_cell(i,j,"env");
                cells[i][j].rect = create_rect(i, j, side+4, side+4, yellow);
                cells[i][j].state = chloride; //negative charge
                cells[i][j].rect.state = chloride
            }
            else {
                cells[i][j] = create_cell(i,j);
                cells[i][j].rect = create_rect(i,j,side, side, green);
                cells[i][j].state = sodium;
                cells[i][j].rect.state = sodium
            }


        }


        cells[i][j].xpos = i*scale_w
        cells[i][j].ypos = j*scale_h

    }

    // cells[i].vx = -7 + Math.floor(Math.random()*15)
    // cells[i].vy = -7 + Math.floor(Math.random()*15)
}



//initialize boundary row

var boundary = [];

var row = n/2;

for (var col = 0; col < n; col++) {

    boundary[col] = create_cell(col,row,"boundary");
    boundary[col].rect = create_rect(col, row, side, side, black);
    boundary[col].state = inactive; //negative charge
    boundary[col].rect.state = inactive

    boundary[col].rect.addEventListener("mouseover", function(e){

        this.state = this.state == 1?0:1;
        if( this.state == 1){
            this.setAttributeNS(null,"fill","red")
        }
        else{
            this.setAttributeNS(null,"fill","black")
        }
    });


}


var grid = [];

// inititalize envrionment cells
for (var i = 0; i < n; i++) {
    grid[i] = []
    for(var j = 0; j< n; j++){
        cells[i][j].assign_adj_cell(boundary, cells, n, n);
        grid[i][j] = 0;
    }
}

for (var col = 0; col < n; col++) {
    boundary[col].assign_adj_cell(boundary, cells, n, n)
}

//display after every action
var display = js_clock(10, 250);



//runs simulation of cellular autonmaton
var drawLoop = function(){

    var now = Date.now();

    //displays every 125,ms
    display(now, function(){

        for (var i = 0; i < boundary.length; i++) {

            if ( boundary[i].state != boundary[i].rect.state ){
                //console.log("updating boundary state");
                boundary[i].state = boundary[i].rect.state
            }

            //console.log(boundary.map(function(b){ return b.state }).join("-"));

            //like a perturbation
            // if( boundary[i].state == ){
            //     boundary[i].rect.setAttributeNS(null,"fill","red")
            // }
            // else{
            //     boundary[i].rect.setAttributeNS(null,"fill","black")
            // }
        }

        console.log("CA => " + boundary.map(function(f){return f.state}).join("-"));
        //console.log(boundary);

        for(i = 0; i< cells.length;i++){
            for( j=0; j< cells[i].length; j++){

                if( !on_boundary( cells[i][j].xind, cells[i][j].yind, boundary, boundary.length )){
                    //happens one by one, byt consistent

                    cells[i][j].act(boundary);

                    // cells[i][j].rect.state = cells[i][j].state

                    // if( cells[i][j].state == sodium ){
                    //     cells[i][j].rect.setAttributeNS(null,"fill",green)
                    //     cells[i][j].rect.setAttributeNS(null,"height",side)
                    //     cells[i][j].rect.setAttributeNS(null,"width",side)
                    // }
                    // else if( cells[i][j].state == potassium ){
                    //     cells[i][j].rect.setAttributeNS(null,"fill",purple)
                    //     cells[i][j].rect.setAttributeNS(null,"height",side+10)
                    //     cells[i][j].rect.setAttributeNS(null,"width",side+10)
                    // }
                    // else if(cells[i][j].state == chloride){
                    //     cells[i][j].rect.setAttributeNS(null,"fill",yellow)
                    //     cells[i][j].rect.setAttributeNS(null,"height",side+7)
                    //     cells[i][j].rect.setAttributeNS(null,"width",side+7)
                    // }
                    // else{
                    //     //no change
                    // }

                    // //update swap
                    // var adj = cells[i][j].adjacent
                    // for(var ad = 0; ad < adj.length; ad++){

                    //     adj[ad].rect.state = adj[ad].state

                    //     if( adj[ad].state == sodium ){
                    //         adj[ad].rect.setAttributeNS(null,"fill",green)
                    //         adj[ad].rect.setAttributeNS(null,"height",side)
                    //         adj[ad].rect.setAttributeNS(null,"width",side)
                    //     }
                    //     else if( adj[ad].state == potassium ){
                    //         adj[ad].rect.setAttributeNS(null,"fill",purple)
                    //         adj[ad].rect.setAttributeNS(null,"height",side+10)
                    //         adj[ad].rect.setAttributeNS(null,"width",side+10)
                    //     }
                    //     else if(adj[ad].state == chloride){
                    //         adj[ad].rect.setAttributeNS(null,"fill",yellow)
                    //         adj[ad].rect.setAttributeNS(null,"height",side+7)
                    //         adj[ad].rect.setAttributeNS(null,"width",side+7)
                    //     }
                    //     else{
                    //         //no change
                    //     }


                    //}

                }

            }
        }

        for(i = 0; i< cells.length;i++){
            for( j=0; j< cells[i].length; j++){

                // cells[i][j].state = grid[i][j]

                cells[i][j].rect.state = cells[i][j].state

                if( cells[i][j].state == sodium ){
                    cells[i][j].rect.setAttributeNS(null,"fill",green)
                    cells[i][j].rect.setAttributeNS(null,"height",side)
                    cells[i][j].rect.setAttributeNS(null,"width",side)
                }
                else if( cells[i][j].state == potassium ){
                    cells[i][j].rect.setAttributeNS(null,"fill",purple)
                    cells[i][j].rect.setAttributeNS(null,"height",side+8)
                    cells[i][j].rect.setAttributeNS(null,"width",side+8)
                }
                else if(cells[i][j].state == chloride){
                    cells[i][j].rect.setAttributeNS(null,"fill",yellow)
                    cells[i][j].rect.setAttributeNS(null,"height",side+4)
                    cells[i][j].rect.setAttributeNS(null,"width",side+4)
                }
                else{
                    //no change
                }
            }
        }

    })();

    rafId = requestAnimationFrame(drawLoop);
};


window.addEventListener("keypress", function(c){

    //need to have a state that prevents too quick key presses/holding

	  //console.log("char code" + c.keyCode + "timestamp" + c.timeStamp)

    if( c.keyCode == 115){
        drawLoop();
    }
    else if( c.keyCode == 114){
	      cancelAnimationFrame(rafId);
				rafId = null;
    }
});
