function createWebSocket(path) {
    var host = window.location.hostname;
    var port = window.location.port;
    if(host == '') host = 'localhost';
    var uri = 'ws://' + host + ":" + port + path;
    var Socket = WebSocket           // "MozWebSocket" in window ? MozWebSocket : WebSocket;
    return new Socket(uri);
    connect("/",{
        "connect timeout": 36000,
        "reconnect": false
    });
}

var ws;
var users = [];
var ar = [];
var bool = [];
var createFunctions;
var createDom;
var createOperators;
var createDropboxes;
var createDrop1;
var createDrop2;
var timer;
var refreshDropboxes;
var populate;
var refresh;
var calc;
var sub1;
var sub2;

function MONAD() {
    'use strict';
    var prototype = Object.create(null);
    function unit(value) {
        var monad = Object.create(prototype);
        monad.val = value;
        monad.bind = function (func, args) {
            return func.apply(
                undefined,
                [value].concat(Array.prototype.slice.apply(args || []))
            );
        };
        return monad;
    }
    return unit;
}

var newData = function newData(x,y,z) {
  newVal = x;
  newVal[z] = y; 
  this.val = identity(newVal);
  return this;
}

var identity = MONAD();
var monad = identity([0,1,2,3,4,5,6,7,8,9,10,11,12]);

function newroll(name) { 
    return monad.bind(newData, [name, 10]).val;
}
rollM = newroll("6,6,12,20");

function newplayer(name) { 
    return monad.bind(newData, [name, 0]).val;
}
playerM = newplayer("Jack of Hearts");

function newimpossibleClicker(name) { 
    return monad.bind(newData, [name, 1]).val;
}
impossibleClickerM = newimpossibleClicker("a@F$Uy&impossible");

function newscoreClicker(name) { 
    return monad.bind(newData, [name, 2]).val;
}
scoreClickerM = newscoreClicker("a@F$Uy&score");
// scoreClicker = scoreClickerM.val[2];

function newgroup(name) { 
    return monad.bind(newData, [name, 3]).val;
}
groupM = newgroup("private");

function newrollText(name) { 
    return monad.bind(newData, [name, 4]).val;
}
rollTextM = newrollText("1,1,1,1");

function newd(num) { 
    return monad.bind(newData, [num, 5]).val;
}
dM = newd(-1);

function newgame(toggle) { 
    return monad.bind(newData, [toggle, 6]).val;
}
gameM = newgame("off");

function newgoal(name) { 
    return monad.bind(newData, [name, 7]).val;
}
goalM = newgoal(20);

function newgoal32(name) { 
    return monad.bind(newData, [name, 11]).val;
}
goal32M = newgoal32(20);

function MakeDS_ob() {
    this.t = -1,
    this.ar = [];
    this.bool = [];
    this.scoreFunc = function() {
        $("#countdown").html("");
        $("#a0").html("");
        if (playerM.val[0] === scoreClickerM.val[2]) {
            ws.send("CL#$42," + groupM.val[3] + "," + playerM.val[0] + "," + "place holder");
        }
        if ( playerM.val[0] === impossibleClickerM.val[1]) {
            ws.send("CM#$42,"+ groupM.val[3] + "," + playerM.val[0] + "," + "place holder");
        }
    }
}
var DS_ob = new MakeDS_ob();

refresh = function() {
    sub1.dispose();
    sub2.dispose();
    gameM = newgame("off");
    dM = newd(-1);
    impossibleClickerM = newimpossibleClicker("a@F$Uy&impossible");
    scoreClickerM = newscoreClicker("a@F$Uy&score");   
    DS_ob.ar = [];
    DS_ob.bool = [];
    $("#a0").html("");
    $("#a2").html("");
    $("#a4").html("");
    createDom();
    createOperators();
    createDropboxes();
    $('.drag').draggable({ revert: "invalid", zIndex: 2 });
    $('.dragNew').draggable({ revert: "invalid", zIndex: 2 });
    $('.drag2').draggable({ helper: "clone", revert: "invalid", zIndex: 2 });
    createDrop1();
    createDrop2();
    $("#result1").hide();
    $("#result2").hide();
    $("#result3").hide();
    $("#rollA").show();
    $("#scoreF").hide();
    $("#impossibleJ").hide();
    $("#newDisplay").hide();
    $("#countdown").html("");
    $(".dropx").hide();
    $(".drop2x").hide();
    $(".drop").show();
    $(".drop2").show();
};

$(document).ready(function () {
    $("#newgroup").hide();
    function assign (a, b, c, d, e, f) { 
        var res;
        $("#"+d).hide();
        $("#"+e).hide();
        $("#result" + f).show();
        switch (b) {
            case "+": res = parseFloat(a) + parseFloat(c);
            break;
            case "-": res = a - c;
            break;
            case "*": res = a * c;
            break;
            case "/": res = a / c;
            break;
            case "Concat": res = parseFloat(a+c);
            break;
        }
        $("#result" + f).html(res);
        $("#0").html(a);
        $("#1").html(b);
        $("#2").html(c);
    };
    function onMessage(event) {
        $("#go30").hide();
        $("#go60").hide();
        $("#stop30").hide();
        $("#stop60").show();
        var gameArray = event.data.split(",");
        var d2 = event.data.substring(0,6);
        var d3 = event.data.substring(2,6);
        var sendersGroup= gameArray[1];   // The sender's group.
        var sender = gameArray[2];
        var extra = gameArray[3];
        console.log(rollM.val[10])
        var ext4= gameArray[4];
        var ext5 = gameArray[5];
        var ext6 = gameArray[6];
        var ext7 = gameArray[7];
        var ext8 = gameArray[8];
        console.log(gameArray);
        var p = $(document.createElement('p')).text(event.data);
        if (((groupM.val[3] === gameArray[1]) && (groupM.val[3] !== "private")) || (playerM.val[0] === sender)) {   
            switch (d2) {
                case "CA#$42":               // Set up the next round of play.
                    refresh();
                    $(".dropx").hide();
                    $(".drop2x").hide();
                    $(".drop").show();
                    $(".drop2").show();
                    $("#impossibleJ").show();
                    $("#scoreF").show();
                    $("#info1").html("");
                    $(".erase").show();
                    $("#show").show();
                    $("#show2").show();
                    $("#solutions").show();
                    $("#iutions2").show();
                    $("#a0").html("");
                    var r = extra + "," + ext4 + "," + ext5 + "," + ext6;
                    rollTextM = newrollText(r);
                    dM = newd(-1);
                    populate(extra,ext4,ext5,ext6);
                    $("#a4").html(extra + " " + ext4 +  " " + ext5 + " " + ext6);
                break;

                case "CB#$42":
                    $("#users").html(event.data.substring(6));    // Refresh browser with server state.
                break;

                case "CC#$42":
                    // Prevents new player login data from defaulting to a chat message.
                break;

                case "CD#$42":       // Prevent new player login data from displaying as a chat message.
                    if (sender !== playerM.val[0]) {
                        $("#" + gameArray[3]).hide();
                        $("#" + gameArray[5]).val(gameArray[4]);
                        $("#" + gameArray[5]).html(gameArray[4]);
                    }
                break;

                case "CE#$42":
                    $("#a4").append(extra);  // Display computations.
                    $("#rollA").hide();
                    DS_ob.ar = [];
                break;

                case "CF#$42":
                    gameM = newgame("on");
                    $("#a2").append("<br>" + sender + " clicked 'SCORE'");
                    DS_ob.ar = [];
                    $("#rollA").hide();
                    $("#newDisplay").hide();
                    $("#impossibleJ").hide();
                    $("#scoreF").hide();
                    $('#go30').triggerHandler('click');
                    if (playerM.val[0] !==  scoreClickerM.val[2]) {
                        $("#a0").append(sender + " clicked SCORE and must make the " +
                            "number " + goalM.val[7] + " before time runs out.</h3>");
                        $(".dropx").show();
                        $(".drop2x").show();
                        $(".drop").hide();
                        $(".drop2").hide();
                    }
                break;

                case "CG#$42":
                    $("#stop30").triggerHandler('click');
                    $("#a0").html("");
                    $("#a2").append("<br>One point for " + sender);
                    $("#a1").prepend("<span style='font-size:75px; background:#000; color:#f00;'>" +
                        "Score!</span>");
                    $("#newDisplay").show();
                    $("#countdown").html("");
                break;

                case "CH#$42":
                    if (playerM.val[0] !== sender && gameM.val[6] === "on") {
                        assign (extra, ext4, ext5, ext6, ext7, ext8);
                    }

                break;

                case "CK#$42":       // Prevent new player login data from displaying as a chat message.
                    if (sender !== playerM.val[0]) {
                        $("#" + gameArray[3]).hide();
                        $("#1").val(gameArray[4]);
                        $("#1").html(gameArray[4]);
                    }
                break;

                case "CO#$42":
                    $("#b0").html(sender + " is now in group " + sendersGroup);
                break;

                case "CP#$42":

                break;

                case "CI#$42":
                    $("#a2").append("<br>deduct one point from " + sender + "'s score.");
                    $("#newDisplay").show();
                break;

                case "CJ#$42":
                    $("#impossibleJ").hide();
                    impossibleClickerM.val[1] = sender;
                    $("#a2").prepend("<br>" + sender + " clicked 'IMPOSSIBLE'");
                    $('#go60').triggerHandler('click');
                break;

                case "CL#$42":
                    $("#a2").append("<br>deduct one point from " + sender + "'s score.");
                    $("#newDisplay").show();
                    $("#stop60").triggerHandler('click');
                break;




                case "CS#$42":
                    $("#a2").append("The goal is " + extra);
                    goalM = newgoal(extra);
                    ws.send("CA#$42," + groupM.val[3] + "," + playerM.val[0] + "," + rollM.val[10]);
                break;

                case "CW#$42":
                    if ( sender == playerM.val[0] ) {
                        $("#show2").prepend(extra);
                    }
                break;                                                            






                case "CM#$42":
                    $("#a2").prepend("<br>Time's up and nobody found a solution");
                    $("#newDisplay").show();
                break;

                case "CQ#$42": 
                    rollM = newroll(extra + "," + ext4 + "," + ext5 + "," + ext6);
                break;

                case "CN#$42":
                    $("#stop30").triggerHandler('click');
                    $("#a2").append("<br>deduct two points from " + impossibleClickerM.val[1] +
                        "'s score. <br>A solution was found before 60 seconds had passed.");
                    $("#newDisplay").show();
                break;

                case "CR#$42":
                    refresh();
                break;



                case "CZ#$42":
                    $("#show").prepend("<br>" + extra);
                    $("#a2").prepend(sender + " clicked SOLUTIONS.<br><br>");
                break;

                case "EE#$42":

                break;

                default:
                    $('#messages').append(p);
                    $('#messages').animate({scrollTop: $('#messages')[0].scrollHeight});
                break;
            }
        }

        else if (d2 === "CB#$42") {
            $("#users").html(event.data.substring(6));
        }

        else if (d3 !== "#$42") {
            $('#messages').append(p);
            $('#messages').animate({scrollTop: $('#messages')[0].scrollHeight});
        }
    }

    createDom = function() {
        $("#a1").html( '<div id="numbers" style="width:100%; float:left;" ></div>' +
            '<div id="drag3" class="drag" >0</div>' +
            '<div id="drag5" class="drag" >0</div>' +
            '<div id="drag7" class="drag" >0</div>' +
            '<div id="drag9" class="drag" >0</div>' +
            '<div id="result1" name-"new" class="dragNew" name="new" >0</div>' +
            '<div id="result2" name-"new" class="dragNew" name="new" >0</div>' +
            '<div id="result3" name-"new" class="dragNew" name="new" >0</div>' +
            '<br><br><br><br><br><br>' +
            '<div id="operators" style="width:100%; float:left;" > </div>' +
            '<div id="dropBoxes" style="width:100%; float:left;" > </div>' +
            '<div style="width: 100%; float: left;> </div>'
        );
    };

    createOperators = function() {
        $("#operators").html(
            '<div id="drag11" class="drag2" >+</div>' +
            '<div id="drag13" class="drag2" >-</div>' +
            '<div id="drag15" class="drag2" >*</div>' +
            '<div id="drag17" class="drag2" >/</div>' +
            '<div id="drag19" class="drag2" >Concat</div>' +
        '<br><br><br><br><br><br><br><br><br><br>'
        );
    };

    createDropboxes = function() {
        $("#dropBoxes").html(
            '<div id="0" class="drop" >Num</div>' +
            '<div id="1" class="drop2" >Op</div>' +
            '<div id="2" class="drop" >Num</div>' +
            '<div id="0" class="dropx" >Num</div>' +
            '<div id="1" class="drop2x" >Op</div>' +
            '<div id="2" class="dropx" >Num</div> '
        );
    };

    createDrop1 = function() {
        $('.drop').droppable({
            tolerance: "touch",
            hoverClass: 'active',
            accept: ".drag, .dragNew",
            drop: function(e, ui) {
                var status = groupM.val[3];
                var player = playerM.val[0];
                var ar = DS_ob.ar;
                var bool = DS_ob.bool;
                var dropID = $(this).attr( 'id' );
                var dragID = ui.draggable.attr( 'id' );
                var val = ui.draggable.html();
                ar[dropID] = val;
                ar[(parseInt(dropID) + 3).toString()] = dragID;
                bool.push(ui.draggable.attr( "name" ));  // "name" is either "undefined" or "new".
                ui.draggable.hide( "puff" );
                $(this).html(val);
                bb = (bool.indexOf("new") !== -1); // Did the player use a number generated by a previous computation?
                if (ar[0] !== undefined && ar[1] !== undefined && ar[2] !== undefined) {
                    calc(ar[0], ar[1], ar[2], bb);
                    ws.send("CH#$42," + status + "," + playerM.val[0] + "," +
                        ar[0] + "," + ar[1] + "," + ar[2] + "," + ar[3] + "," +
                        ar[5] + "," + (dM.val[5] + 1));
                    refreshDropboxes();
               }
            }
        });
    };

    createDrop2 = function() {
        $('.drop2').droppable({
            tolerance: "touch",
            hoverClass: 'active',
            accept: ".drag2",
            drop: function(e, ui) {
                var ar = DS_ob.ar;
                var bool = DS_ob.bool;
                var dropID = $(this).attr( 'id' );
                var val = ui.draggable.html();
                ar[dropID] = val;
                $(this).html(val);
                bb = (bool.indexOf("new") !== -1); // Did the player use a number generated by a previous computation?
                if (ar[0] !== undefined && ar[1] !== undefined && ar[2] !== undefined) {
                  calc(ar[0], ar[1], ar[2], bb);
                  refreshDropboxes();
                }
            }
        });
    };

    var erase1 = $('.erase');
    var erase1Src = Rx.Observable.fromEvent(erase1, 'click');
    var erase1Sub = erase1Src.subscribe( function () {
        $("#show").html("");
        $(".erase1").hide();
    });

    var erase2 = $('.erase2');
    var erase2Src = Rx.Observable.fromEvent(erase2, 'click');
    var erase2Sub = erase2Src.subscribe( function () {
            $("#show2").html("");
            $(".erase2").hide();
            $('#computations').hide();
        });

    var rollA = $('#rollA');
    var rollASrc = Rx.Observable.fromEvent(rollA, 'click');
    var rollASub = rollASrc.subscribe( function () {
            bool = [];
            dM = newd(-1);
            ws.send("CA#$42," + groupM.val[3] + "," + playerM.val[0] + "," + rollM.val[10]);
        }
    );

    var solutions = $('#solutions');
    var solutionsSrc = Rx.Observable.fromEvent(solutions, 'click');
    var solutionsSub = solutionsSrc.subscribe( function () {
            var x = "CZ#$42," + groupM.val[3] + "," + playerM.val[0] + "," + rollTextM.val[4] + "," + goalM.val[7];
            ws.send(x);
        }
    );

    var sol = $('#solutions2');
    var solSrc = Rx.Observable.fromEvent(sol, 'click');
    var solSub = solSrc.subscribe( function () {
        var a3 = $("#x30").val();
        if (isNaN(a3) || a3 === "") {
            alert(a3 + " is not a number.");
            return;
        }
        var b3 = $("#x31").val();
        if (isNaN(b3) || b3 === "") {
            alert(b3 + " is not a number.");
            return;
        }
        var c3 = $("#x32").val();
        if (isNaN(c3) || c3 === "") {
            alert(c3 + " is not a number.");
            return;
        }
        var d3 = $("#x33").val();
        if (isNaN(d3) || d3 === "") {
            alert(d3 + " is not a number.");
            return;
        }
        var e = a3 + "," + b3 + "," + c3 + "," + d3 + "," + goal32M.val[11]
        $("#x30").val("");
        $("#x31").val("");
        $("#x32").val("");
        $("#x33").val("");
        ws.send("CW#$42," + groupM.val[3] + "," + playerM.val[0]  + "," + e);
        $('#computations').show();
        $(".erase2").show();
        $("#show2").show();
    });

    var sides = $('#sides');
    var sidesSrc = Rx.Observable.fromEvent(sides, 'click');
    var sidesSub = sidesSrc.subscribe( function () {
        var a2 = $("#x20").val();
        if (isNaN(a2) || a2 === "") {
            alert(a2 + " is not a number.");
            return;
        }
        var b2 = $("#x21").val();
        if (isNaN(b2) || b2 === "") {
            alert(b2 + " is not a number.");
            return;
        }
        var c2 = $("#x22").val();
        if (isNaN(c2) || c2 === "") {
            alert(c2 + " is not a number.");
            return;
        }
        var d2 = $("#x23").val();
        if (isNaN(d2) || d2 === "") {
            alert(d2 + " is not a number.");
            return;
        }
        var e = a2 + "," + b2 + "," + c2 + "," + d2
        ws.send("CQ#$42," + groupM.val[3] + "," + playerM.val[0]  + "," + a2 + "," + b2 + "," + c2 + "," + d2);
        $('#sides').removeClass('extra').addClass('focus');
    });

    var sF = $('#scoreF');
    var sFSrc = Rx.Observable.fromEvent(sF, 'click');
    var sFSub = sFSrc.subscribe( function () {
        $("#scoreF").hide();
        scoreClickerM = newscoreClicker(playerM.val[0]);
        $("#impossibleJ").hide();
        ws.send("CF#$42," + groupM.val[3] + "," + playerM.val[0] + "," + "place holder");
    });

    var imp = $("#impossibleJ");
    var impSrc = Rx.Observable.fromEvent(imp, 'click');
    var impSub = impSrc.subscribe( function () {
        impossibleClickerM = newimpossibleClicker(playerM.val[0]);
        ws.send("CJ#$42," + groupM.val[3] + "," + playerM.val[0] + "," + "place holder");
    })

    var nD = $("#newDisplay")
    var nDSrc = Rx.Observable.fromEvent(nD, 'click');
    var nDSub = nDSrc.subscribe( function () {
        ws.send("CR#$42," + groupM.val[3] + "," + playerM.val[0] + "," + "place holder");
    });

    populate = function(a,b,c,d) {
        $("#drag3").html(a);
        $("#drag5").html(b);
        $("#drag7").html(c);
        $("#drag9").html(d);
    }

    refreshDropboxes = function() {
        ar = [];
        $("#0").html("Num");
        $("#1").html("Op");
        $("#2").html("Num");
    }

    var goal = $("#goal")
    var goalSrc = Rx.Observable.fromEvent(goal, 'click');
    var goalSub = goalSrc.subscribe( function () {
        var x = $("#goal2").val()
        if (isNaN(x)) {
            alert(x + " <h2>is not a number.</h2> ");
            return;
        }
        if (x === "") {
            alert(" Please enter a number. ");
            return;
        }
        else {        
            ws.send("CS#$42," + groupM.val[3] + "," + playerM.val[0] + "," + x );
            $('#goal').removeClass('extra').addClass('focus');
            $('#goal2').removeClass('rad').addClass('radfocus');
        }
    });

    var goal3 = $("#goal3")
    var goal3Src = Rx.Observable.fromEvent(goal3, 'click');
    var goal3Sub = goal3Src.subscribe( function () {
        var x = $("#goal4").val()
        if (isNaN(x)) {
            alert(x + " <h2>is not a number.</h2> ");
            return;
        }
        if (x === "") {
            alert(" Please enter a number. ");
            return;
        }
        else {        
            goal32M = newgoal32(x);
            $('#goal3').removeClass('extra').addClass('focus');
            $('#goal4').removeClass('rad').addClass('radfocus');
        }
    });

    var priv = $("#private")
    var privSrc = Rx.Observable.fromEvent(priv, 'click');
    var privSub = privSrc.subscribe( function () {
        groupM = newgroup("private");
        ws.send("CO#$42," + "private" + "," + playerM.val[0]);
        $("#b0").html("Solitaire mode. Your actions do not affect other players.")
    });

    var pubA = $("#publicA");
    var pubASrc = Rx.Observable.fromEvent(pubA, 'click');
    var pubASub = pubASrc.subscribe( function () {
        groupM = newgroup("pubA");
        ws.send("CO#$42," + "pubA" + "," + playerM.val[0]);
        $("#b0").html("You are now in Group A. Be careful." +
            " Clicking 'ROLL' inserts the roll numbers in all" +
            " Group A browsers.");
    });

    var pubB = $("#publicB");
    var pubBSrc = Rx.Observable.fromEvent(pubB, 'click');
    var pubBSub = pubBSrc.subscribe( function () {
        groupM = newgroup("pubB");
        ws.send("CO#$42," + "pubB" + "," + playerM.val[0]);
        $("#b0").html("Now in group B. Be careful." +
            " Clicking 'ROLL' inserts the roll numbers in all" +
            " group B browsers.");
    });

    var newG = $("#new");
    var newGSrc = Rx.Observable.fromEvent(newG, 'keydown');
    var newGSub = newGSrc.subscribe( function (e) {
    if (e.which === 13) { 
        var name = $("#new").val();
        groupM = newgroup(name);
        ws.send("CO#$42," + name + "," + playerM.val[0]);
        $("#newgroup").hide();
        $("#b0").html("Now in group " + name);
    }
    });

    $("#b0").hide();
    $("#experiment").hide();
    $("#private").hide();
    $("#publicA").hide();
    $("#publicB").hide();
    $("#publicNew").hide();
    $("#rollA").hide();
    $(".erase").hide();
    $(".erase2").hide();
    $("#computations").hide();
    $("#show").hide();
    $("#show2").hide();
    $("#show2").html("");
    $("#solutions").hide();
    $("#newDisplay").hide();
    $("#scoreF").hide();
    $("#impossibleJ").hide();
    $("#a1").hide();
    $('.drag').draggable({ revert: "invalid", zIndex: 2 });
    $('.dragNew').draggable({ revert: "invalid", zIndex: 2 });
    $('.drag2').draggable({ helper: "clone", revert: "invalid", zIndex: 2 });

    var source1 = Rx.Observable.timer(
        0,
        1000)
       .map(function (x, i) { return (x, 30 - i)});

    var source2 = Rx.Observable.timer(
        0,
        1000)
       .map(function (x, i) { return (x, 60 - i)});

    sub1 = source1.subscribe(
    function (x) {
      if (x < 0) {sub1.dispose();}
    });

    sub2 = source2.subscribe(
    function (x) {
      if (x < 0) {sub2.dispose();}
    });

    sub1.dispose();
    sub2.dispose();

    var stop30 = $('#stop30');
    var stop30Src = Rx.Observable.fromEvent(stop30, 'click');
    var stop30Sub = stop30Src.subscribe(function (e) {
      console.log("________________Yes!__");
      sub1.dispose();
      $("#a2").html("");
    });

    var stop60 = $('#stop60');
    var stop60Src = Rx.Observable.fromEvent(stop60, 'click');
    var stop60Sub = stop60Src.subscribe(function (e) {
      console.log("________________Yes!__");
      sub2.dispose();
      $("#a2").html("");
    });

    var go30 = $('#go30');
    var go30Src = Rx.Observable.fromEvent(go30, 'click');
    var go30Sub = go30Src.subscribe(function (e) {
        sub2.dispose();
        sub1.dispose();
        sub1 = source1.subscribe(
        function (x) {
          sub2.dispose();
          $("#countdown").html(x);
          DS_ob.t = x;
          if (x === 0) {
            sub1.dispose();
            $("#countdown").html("");
            DS_ob.scoreFunc();
          }
      });
    });

    var go60 = $('#go60');
    var go60Src = Rx.Observable.fromEvent(go60, 'click');
    var go60Sub = go60Src.subscribe(function (e) {
        sub2 = source2.subscribe(
        function (x) {
          $("#countdown").html(x);
          DS_ob.t = x;
          if (x === 0) {
            sub2.dispose();
            $("#countdown").html("");
            DS_ob.scoreFunc();
        }
      });
    });

    $('#join-form').submit(function () {
        $('#warnings').html('');
        var user = $('#user').val();
        playerM = newplayer(user);
        ws = createWebSocket('/');
        ws.onopen = function() {
            ws.send("CC#$42" + user);
        };
        ws.onmessage = function(event) {
            if(event.data === "CC#$42") {
                dM = newd(-1);
                createDom();
                createOperators();
                createDropboxes();
                $('.drag').draggable({ revert: "invalid", zIndex: 2 });
                $('.dragNew').draggable({ revert: "invalid", zIndex: 2 });
                $('.drag2').draggable({ helper: "clone", revert: "invalid", zIndex: 2 });
                createDrop1();
                createDrop2();
                $("#result1").hide();
                $("#result2").hide();
                $("#result3").hide();
                $("#b0").show();
                $("#experiment").show();
                $("#private").show();
                $("#publicA").show();
                $("#publicB").show();
                $("#publicNew").show();
                $("#b0").html("Solitaire mode. Click above to enable competition.")
                $("#rollA").show();
                $("#a1").show();
                $('#join-section').hide();
                $('#chat-section').show();
                $('#users-section').show();
                $("#messages").show();
                $(".dropx").hide();
                $(".drop2x").hide();
                ws.onmessage = onMessage;
                $('#message-form').submit(function () {
                    var text = $('#text').val();
                    ws.send(text);
                    $('#text').val('');
                    return false;
                });
                $('#join-form').remove();
                delete $('#join-form');
            } else {
                console.log("What?");
                $('#warnings').append(event.data);
                ws.close();
            }
        };

        $('#join').append('Connecting...');

        return false;
    });
});

calc = function (ax,b,cx,bb) {
    var d = dM.val[5]
    var t = DS_ob.t;
    var goal = (goalM.val[7])*1;
    var goal2 = goalM.val[7]+"";
    var impossibleClicker = impossibleClickerM.val[1];
    var player = playerM.val[0];
    var scoreClicker = scoreClickerM.val[2];
    var group = groupM.val[3];
    var ddd = dM.val[5] + 1;
    var d = ddd;
    dM = newd(ddd)
    DS_ob.ar = [];
    DS_ob.bool = [];
    var res;
    var a = parseFloat(ax);
    var c = parseFloat(cx);
    switch (b) {
        case "+": res = a + c;
        break;
        case "-": res = a - c;
        break;
        case "*": res = a * c;
        break;
        case "/": res = a / c;
        break;
        case "Concat": res = parseFloat(a+""+c);
        break;
    }

    if (d === 0) { 
        console.log(goalM.val[7]);
        $("#result1").show().html(res);
        ws.send("CE#$42," + group + "," + player + "," + "<br>" + a + " " + b + " " + c + " = " + res + "<br>");
    }

    if (d === 1) {
        ws.send("CE#$42," + group + "," + player + "," + a + " " + 
            b + " " + c + " = " + res + "<br>");
        if (res == goal && bb)   {
            $("#newDisplay").show();
            $("#countdown").html("");
            if ((player === scoreClicker) && t > 0) {
                sub1.dispose();
                DS_ob.t = -1;
                ws.send("CG#$42," + group + "," + player + "," + "cow");
                if (impossibleClicker !== "a@F$Uy&impossible") {
                    ws.send("CN#$42," + group + "," + player + "," + impossibleClicker);
                }
            }
            else {
                $("#a2").append("<br>No point for " + player + ". The clock wasn't running.");
                $("#a1").prepend("<span style='font-size:25px; background:#000;" +
                    "color:#f00;'>" + goal2 + ", but no increase in " + player + "'s score</span>");
            }
            t = -1;
            $("#operators").html("");
            $("#dropBoxes").html("");
        }
        $("#result2").show().html(res);    }

    if (d === 2) {
        ws.send("CE#$42," + group + "," + player + "," + a + " " + b + " " + c + " = " + res + "<br>");
         if (res == goal) {
            $("#countdown").html("");
            sub1.dispose();
            DS_ob.t = -1
            $("#newDisplay").show();
            if ((player === scoreClicker) && t > 0) {
                ws.send("CG#$42," + group + "," + player + "," + "cow");
                if (impossibleClicker !== "a@F$Uy&impossible") {
                    ws.send("CN#$42," + group + "," + player + "," + impossibleClicker);
                }
            }
            else {
                $("#a2").append("<br>No point for " + player + ". The clock wasn't running.");
                $("#a1").prepend("<span style='font-size:25px;color:#f00;'>" + goal2 + ", but no increase in " +
                    player + "'s score</span>");
            }
            DS_ob.t = -1;
            $("#operators").html("");
            $("#dropBoxes").html("");

        }
        if (res != goal && (player === scoreClicker && t > 0)) {
            sub1.dispose();
            DS_ob.t = -1;
            DS_ob.scoreFunc();
        }
        $("#result3").show().html(res);
        $("#newDisplay").show();
    }
};
