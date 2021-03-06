//remember timed perturbation

// Lite version of ion channels with 3 charges, membrane column, and ion
// exchange.

import {js_clock} from "./clocks.js"
import {create_rect_fn,create_path_fn, setColor} from "./utils.js"
import {bittorio} from "./boundary.js"

import {start1, start2, start3, start4, start5, start6, start} from "./starting_config.js"



var n = 18;
var side = 10;

var gridn = 10;

var canvas = document.getElementById( 'svgCanvas' );
var pW = canvas.clientWidth;
var pH = canvas.clientHeight;

console.log(pW + "  " + pH);

var percentPerturb = 0.1;
var percentCA = 0.1;
var pertOn = 0;
var starting_config = [];
// max 5 steps for now.
var backward_computation = []; //stores the state of CA, and state of perturbing environment.

var pWidth = pW - pW%n
var pHeight = pH - pH%n

var t = 0; //as time

console.log(pWidth + "  " + pHeight);

// 40 * 40 grid
var scale_w = Math.floor(pWidth/n);
var scale_h = Math.floor(pHeight/n);

var create_rect = create_rect_fn(scale_w, scale_h, canvas);
var create_path = create_path_fn(scale_w, scale_h, canvas);

var cellularAutomaton = bittorio( create_rect, create_path, scale_w, n );

var ca2Perturb = [];
var rafId = null;

var store_config = "";
var st = 0, end = 80;

// create_rect(0,0, pWidth, pHeight, "red");

var cells = [];

// inititalize envrionment cells
for (var i = 0; i < n; i++) {

    cells[i] = [];
    for(var j = 0; j< n; j++){

        cells[i][j] = {}

        cells[i][j].rect = create_rect(i,j,side, side, "#ffffff");
        cells[i][j].state = 0;

        if (  j == n/2){
            cells[i][j].rect.setAttributeNS(null, "opacity", 0);
        }
    }
}

for(var col = 0; col< n; col++){

    cells[col][0].state = 0;
    setColor(cells[col][0]);
    starting_config[col] = cells[col][0].state;
}


//var ca1 = cellularAutomaton( 1, side );

var ca2 = cellularAutomaton( n/2, side );

// var starting_config = ca2.getState();

var starting_config = start.split("").map((s) => {return parseInt(s)});

store_config = start5;

console.log(starting_config);
console.log(starting_config.length);

ca2.reconfigure(starting_config);
ca2Perturb = starting_config;

// for(var col = 0; col< n; col++){
//     cells[col][0].state = starting_config[col];
//     setColor(cells[col][0]);
// }


// row = gridn + 1;
// // inititalize envrionment cells
// for (var i = 0; i < n; i++) {

//     cells[i] = []
//     for(var j = gridn+1; j< n; j++){

//         cells[i][j] = {}

//         if( boundary[i].state == 1){
//             cells[i][j].rect = create_rect(i,j,side, side, "#ffffff");
//             cells[i][j].state = 1;
//         }
//         else{
//             cells[i][j].rect = create_rect(i,j,side, side, "#000000");
//             cells[i][j].state = 0;
//         }
//     }
// }


//display after every action
var display = js_clock(40, 600);
var sense = js_clock(20, 200);
var t = 0;


//console.log(cells)

//runs simulation of cellular autonmaton
var drawLoop = function(){

    var now = Date.now();

    sense(now, function(){

        //only for second CA
        if( t >= n/2){

            //to know places of perturbation
            //activate the second CA
            let perturbRow = []
            for( var col = 0; col < n; col++ ){
                perturbRow[col] = cells[col][n/2+1].state; //immediate next state
            }
            ca2.sense(pertOn, perturbRow);
            //ca2.sense( pertOn, ca2Perturb);
        }
    })();

    //displays every 250 ms
    display(now, function(){

        //Hold off from saving state yet
        // if( backward_computation.length >= 10){
        //     backward_computation.shift();
        // }
        // else{
        //     var env = [];
        //     row = gridn-1;
        //     for(col = 0; col < n; col++){
        //         env[col] = cells[col][row].state;
        //     }

        //     var last_ca = [];
        //     row = n-1;
        //     for(col = 0; col < n; col++){
        //         last_ca[col] = cells[col][row].state;
        //     }

        //     backward_computation.push({ "ca":  boundary.map(function(f){return f.state}),
        //                                 "env": env,
        //                                 "last_ca": last_ca
        //                               });
        // }


        // 4. fall off the edge before ca2
        // inititalize envrionment cells
        for (var i = 0; i < n; i++) {
            for(var j = 0; j < n/2; j++){
                cells[i][j].state = cells[i][j+1].state;
                setColor(cells[i][j]);
            }
        }

        // 5. copy current state into last state
        var ca2state = ca2.getState();
        for (var i = 0; i < n; i++) {
            cells[i][n/2-1].state = ca2state[i];
            setColor(cells[i][n/2-1]); //start
        }


        // 2. reconfigure 2nd CA for perturbation and activate next states
        if( pertOn == 1){

            let perturbRow = []
            for( var col = 0; col < n; col++ ){
                perturbRow[col] = cells[col][n/2+1].state; //immediate next state
            }
            //ca2.sense(pertOn, perturbRow);
            ca2.reconfigure(perturbRow);
        }
        else{

            //do not reconfigure with perturbation
            // i.e, let self-dynamics run
            // compenste for perturbation
            ca2.change_state(); //move to the next state;

        }

        //check_cycle( store_config );

        // var perturbRow = [];
        // //original dynamics
        // for (var col = 0; col < n; col++) {
        //     perturbRow[col] = cells[col][n/2-1].state;
        // }
        // ca2.reconfigure(perturbRow);
        // no change in state

        // var ca2state = ca2.getState();
        // // reconfigure the perturbation to the row (no perturbation)
        // //no random perturbations between timezones, CA continues with selforiganized dynamics
        // for (var col = 0; col < n; col++) {
        //     ca2Perturb[col] = ca2state[col];
        // }

        // 5. recompute and populate n next states
        var ca2state = ca2.getState();

        //3. fall off the edge before end of line
        // inititalize envrionment cells
        for (var row = n/2+1; row < n; row++) {
            ca2state = ca2.nextState(ca2state); //compute next state for future visualiation
            for(var col = 0 ; col < n; col++){
                //console.log(cells[col][row])
                //console.log(ca2state[col])
                cells[col][row].state = ca2state[col];
                setColor(cells[col][row]);
            }
        }


        //3. static state
        //3. copy perturbation

        //4. next state
        // ca1.nextState();
        // ca2.nextState();

        // 4. copy state to perturbation to nullify perturbation effect
        //var ca2state = ca2.getState()


        //copy to ensure that there is not perturbation without user interference

        t++;

        //5. shift existing environment
        // var row = gridn-1;
        // // inititalize envrionment cells
        // for (var i = 0; i < n; i++) {

        //     for(var j = row; j> 0; j--){
        //         cells[i][j].state = cells[i][j-1].state;
        //         setColor(cells[i][j])
        //     }
        // }

        // //6. initaite new environment
        // for(var i = 0; i< n; i++){

        //     if( Math.random() < percentPerturb){
        //         cells[i][0].state = 1;
        //     }
        //     else{
        //         cells[i][0].state = 0;
        //     }
        //     setColor(cells[i][0])
        // }

        //continue

    })();

    rafId = requestAnimationFrame(drawLoop);

}




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


document.getElementById("reset").addEventListener("click",function(e){

    for( var row = 0; row < n; row++){
        for(var col = 0; col <n; col++){
            cells[col][row].state = 0;
            if( cells[col][row].path){
                var parent = cells[col][row].path.parentNode
                parent.removeChild(cells[col][row].path);
                cells[col][row].path = null
            }
            setColor(cells[col][row]);
        }
    }
    ca2.reconfigure(starting_config);


});

document.getElementById("stop").addEventListener("click",function(e){

    cancelAnimationFrame(rafId);
		rafId = null;
});

document.getElementById("start").addEventListener("click",function(e){
    drawLoop();
});

document.getElementById("clear").addEventListener("click",function(e){

    var perturbRow = []
    for(var col = 0 ; col < n; col++){
        perturbRow[col] = 0
    }
    // ca1.reconfigure(perturbRow)
    // ca1.clear();
    ca2.reconfigure(perturbRow)
    ca2.clear();
});

// n perturbation
document.getElementById("nP").addEventListener("click",function(e){

    //later control proportion of white and black
    //ca2.setPerturbed();

    var ploc = document.getElementById("ploc").value;
    //with a certain pertangage flip the digits
    gen_perturbation(ploc);

});

document.getElementById("restart").addEventListener("click",function(e){

    //later control proportion of white and black
    //generate new random sequence
    var perturbRow = []
    percentCA = Math.random(); // between 0.2 and 0.8

    for(var i = 0; i< n; i++){

        if( Math.random() < percentCA){
            perturbRow[i] = 1;
        }
        else{
            perturbRow[i] = 0
        }
    }
    ca2.reconfigure(perturbRow);
});


// document.getElementById("back").addEventListener("click", function(e){

//     if( backward_computation.length == 0){
//         //do not pop
//     }
//     else{

//         var last_state = backward_computation.pop();

//         console.log(last_state);

//         for(var col = 0 ; col < n; col++){
//             boundary[col].state = last_state.ca[col];
//             setColor( boundary[col]);
//         }

//         for( row = 0; row < gridn-1; row++){
//             for(col=0; col < n; col++){
//                 cells[col][row].state = cells[col][row+1].state
//                 setColor(cells[col][row]);
//             }
//         }

//         for(var col = 0 ; col < n; col++){
//             cells[col][gridn-1].state = last_state.env[col];
//             setColor( cells[col][gridn-1]);
//         }

//         for( row = gridn+1; row < n-1; row++){
//             for(col=0; col < n; col++){
//                 cells[col][row].state = cells[col][row+1].state
//                 setColor(cells[col][row]);
//             }
//         }

//         row = n-1;
//         for(col=0; col < n; col++){
//             cells[col][row].state = last_state.last_ca[col];
//             setColor(cells[col][row]);
//         }


//         for (var col = 0; col < boundary.length; col++) {

//             var prev = col -1, next = col + 1;

//             if( prev < 0 ){
//                 prev  = n - 1
//             }

//             if( next == n ){
//                 next = 0;
//             }

//             cells[col][gridn+1].state = next_state( boundary[prev].state, boundary[col].state, boundary[next].state, document.getElementById("carulebinary").value);
//             setColor(cells[col][gridn+1]);
//         }

//         for (var bcell = 0; bcell < n; bcell++) {

//             //sense perturbation
//             if ( boundary[bcell].state != cells[bcell][gridn-1].state){
//                 //boundary[bcell].rect.setAttributeNS(null,"fill","red")
//                 boundary[bcell].path.setAttributeNS(null, 'stroke', "#0000ff");
//                 boundary[bcell].path.setAttributeNS(null, 'stroke-width', 2);
//             }
//             else{
//                 //no change
//                 boundary[bcell].path.setAttributeNS(null, 'stroke', "#ff0000");
//                 boundary[bcell].path.setAttributeNS(null, 'stroke-width', 1);

//             }
//         }


//     }


// });



document.getElementById("percentCA").addEventListener("change",function(e){
    percentCA = parseFloat(e.target.value);
})

document.getElementById("percentPert").addEventListener("change",function(e){
    percentPerturb = parseFloat(e.target.value);
})

document.getElementById("pertOn").addEventListener("click",function(e){
    if( pertOn == 1){
        pertOn = 0
        e.target.value = "Perturbations are off"
    }
    else{
        pertOn = 1;
        e.target.value = "Perturbations are on"
    }
})


document.getElementById("store").addEventListener("click",function(e){
    st = parseInt(document.getElementById("st_pos").value);
    end = parseInt(document.getElementById("end_pos").value);
    store_config = ca2.getState().slice(st, end).join("");

});


function check_cycle( stored  ){

    var setCycle = 0;

    for(var row = n/2+1; row<n; row++){
        var cur = [];
        for(var col = st; col < end; col++){
            cur[col-st] = cells[col][row].state
        }
        var curStr = cur.join("");

        if( setCycle == 0 && stored == curStr ){

            for(var col = 0; col < n; col++){
                cells[col][row].path = create_path(col, row+0.5, side, side-2,  "#0000ff");
            }
            setCycle = 1;
        }
        else{
            for(var col = 0; col < n; col++){
                if(cells[col][row].path){
                    var parent = cells[col][row].path.parentNode
                    parent.removeChild(cells[col][row].path);
                    cells[col][row].path = null
                }
            }

        }
    }
}




function gen_perturbation( npos ){

    console.log(npos)
    var perturbArray = npos.split(",").map(function(s){ return parseInt(s)});
    console.log(perturbArray)

    // 1. get current ca next state
    // var ca2Perturb = []
    // for( col = 0; col < n; col++){
    //     ca2Perturb[col] = cells[col][n/2+1];
    // }

    // //2. select n distinct positions
    // var pos = []
    // var  i = 0;
    // while ( i < npos){
    //     var num = Math.floor( Math.random()*n);
    //     if( pos.indexOf(num) == -1){
    //         pos.push(num);
    //         i++;
    //     }
    // }

    // console.log(pos);

    //3. perturb those positions
    var row = n/2+1;
    for(var col = 0; col< perturbArray.length; col++){
        cells[perturbArray[col]][row].state = (cells[perturbArray[col]][row].state+1)%2;
        console.log(cells[perturbArray[col]][row])
    }

    for( col = 0; col < n; col++){
        setColor(cells[col][row]);
    }


}
