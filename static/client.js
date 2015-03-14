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
    prototype.is_monad = true;
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
var monad = identity([0,0,0,0,0,0,0,0,0,0,0]);

function newplayer(name) { 
    return monad.bind(newData, [name, 0]).val;
}
playerM = newplayer("Jack of Hearts");

function newimpossibleClicker(name) { 
    return monad.bind(newData, [name, 1]).val;
}
impossibleClickerM = newimpossibleClicker("King of Diamonds");

function newscoreClicker(name) { 
    return monad.bind(newData, [name, 2]).val;
}
scoreClickerM = newscoreClicker("Ace of Spades");
// scoreClicker = scoreClickerM.val[2];


function newgroup(name) { 
    return monad.bind(newData, [name, 3]).val;
}
groupM = newgroup("private");


function newrollText(name) { 
    return monad.bind(newData, [name, 4]).val;
}
rollTextM = newrollText("1,1,1,1,42");


function newd(num) { 
    return monad.bind(newData, [num, 5]).val;
}
dM = newd(-1);


function newgame(toggle) { 
    return monad.bind(newData, [toggle, 6]).val;
}
gameM = newgame("off");

function MakeDS_ob() {
    this.t = -1,
    this.ar = [];
    this.bool = [];
    this.scoreFunc = function() {
        $("#countdown").html("");
        $("#a0").html("");
        if (playerM.val[0] === scoreClickerM.val[2]) {
            ws.send("CL#$42," + groupM.val[3] + "," + playerM.val[0] + "," + "dummy");
        }
        if ( playerM.val[0] === impossibleClickerM.val[1]) {
            ws.send("CM#$42,"+ groupM.val[3] + "," + playerM.val[0] + "," + "dummy");
        }
    }
}
var DS_ob = new MakeDS_ob();

refresh = function() {
    sub1.dispose();
    sub2.dispose();
    gameM = newgame("off");
    dM = newd(-1);
    impossibleClickerM = newimpossibleClicker("a@F$Uy&imp");
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
        var game = gameM.val[6];
        var impX = impossibleClickerM.val[1];
        var plX = playerM.val[0];
        var scX = scoreClickerM.val[2];
        var prX = groupM.val[3];
        console.log("impX, plX, scX, prX " + (impX, plX, scX, prX));
        var gameArray = event.data.split(",");
        var d2 = event.data.substring(0,6);
        var d3 = event.data.substring(2,6);
        var sourceStatus = gameArray[1];  // Value of sender's group
        var group = gameArray[1];
        var sender = gameArray[2];
        var extra = gameArray[3];
        var ext4= gameArray[4];
        var ext5 = gameArray[5];
        var ext6 = gameArray[6];
        var ext7 = gameArray[7];
        var ext8 = gameArray[8];
        console.log(gameArray);
        var p = $(document.createElement('p')).text(event.data);
        if (prX === sourceStatus) {
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
                    var auu = gameArray[3]
                    var buu = gameArray[4]
                    var cuu = gameArray[5]
                    var duu = gameArray[6]
                    rText = auu + "," + buu + "," + cuu + "," + duu + "," + 42;
                    rollTextM = newrollText(rText);
                    dM = newd(-1);
                    populate(auu,buu,cuu,duu);
                    $("#a4").html(auu + " &nbsp; " + buu + " &nbsp; " + cuu + " &nbsp; " + duu);
                break;

                case "CB#$42":
                    $("#users").html(event.data.substring(6));    // Refresh browser with server state.
                break;

                case "CC#$42":
                    // Prevents new player login data from defaulting to a chat message.
                break;

                case "CD#$42":       // Prevent new player login data from displaying as a chat message.
                    if (sender !== player) {
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
                    game = "on";
                    gameM = newgame("on");
                    $("#a2").append("<br>" + sender + " clicked 'SCORE'");
                    DS_ob.ar = [];
                    $("#rollA").hide();
                    $("#newDisplay").hide();
                    $("#impossibleJ").hide();
                    $("#scoreF").hide();
                    $('#go30').triggerHandler('click');
                    if (plX !== scX) {
                        $("#a0").append(sender + " clicked SCORE and must make the " +
                            "number '20' before time runs out.</h3>");
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
                    if (plX !== sender && gameM.val[6] === "on") {
                        assign (extra, ext4, ext5, ext6, ext7, ext8);
                    }

                break;

                case "CK#$42":       // Prevent new player login data from displaying as a chat message.
                    if (sender !== player) {
                        $("#" + gameArray[3]).hide();
                        $("#1").val(gameArray[4]);
                        $("#1").html(gameArray[4]);
                    }
                break;

                case "CO#$42":
                    $("#b0").html(sender + " is now in group " + group);
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

                case "CM#$42":
                    $('#stop60').triggerHandler('click');
                    $("#a2").append("<br>One point for " + sender);
                    $("#a1").prepend("<span style='font-size:75px; background:#000; color:#f00;'>" +
                        "Score!</span>");
                    $("#a2").prepend("<br>Time's up and nobody found a solution");
                    $("#newDisplay").show();
                break;

                case "CN#$42":
                    $("#stop30").triggerHandler('click');
                    $("#a2").append("<br>deduct two points from " + impX +
                        "'s score. <br>A solution was found before 60 seconds had passed.");
                    $("#newDisplay").show();
                break;

                case "CR#$42":
                    refresh();
                break;

                case "CW#$42":
                    $("#show2").prepend(extra);
                    $("#show2").append("<br>Brought to you by " + plX)
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
                    ws.send("CH#$42," + status + "," + player + "," +
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
            ws.send("CA#$42," + groupM.val[3] + "," + playerM.val[0] + "," + "dummy");
        }
    );

    var solutions = $('#solutions');
    var solutionsSrc = Rx.Observable.fromEvent(solutions, 'click');
    var solutionsSub = solutionsSrc.subscribe( function () {
            ws.send("CZ#$42," + groupM.val[3] + "," + playerM.val[0] + "," + rollTextM.val[4]);
        }
    );

    var sol = $('#solutions2');
    var solSrc = Rx.Observable.fromEvent(sol, 'click');
    var solSub = solSrc.subscribe( function () {
        var a = $("#x0").val();
        if (isNaN(a) || a === "") {
            alert(a + " is not a number.");
            return;
        }
        var b = $("#x1").val();
        if (isNaN(b) || b === "") {
            alert(b + " is not a number.");
            return;
        }
        var c = $("#x2").val();
        if (isNaN(c) || c === "") {
            alert(c + " is not a number.");
            return;
        }
        var d = $("#x3").val();
        if (isNaN(d) || d === "") {
            alert(d + " is not a number.");
            return;
        }
        var e = a + "," + b + "," + c + "," + d + "," + "42"
        $("#x0").val("");
        $("#x1").val("");
        $("#x2").val("");
        $("#x3").val("");
        ws.send("CW#$42," + groupM.val[3] + "," + playerM.val[0]  + "," + e);
        $('#computations').show();
        $(".erase2").show();
        $("#show2").show();
    });

    var sF = $('#scoreF');
    var sFSrc = Rx.Observable.fromEvent(sF, 'click');
    var sFSub = sFSrc.subscribe( function () {
        $("#scoreF").hide();
        scoreClickerM = newscoreClicker(playerM.val[0]);
        $("#impossibleJ").hide();
        ws.send("CF#$42," + groupM.val[3] + "," + playerM.val[0] + "," + "dummy");
        console.log("CF#$42," + groupM.val[3] + "," + playerM.val[0] + "," + "dummy");
    });

    var imp = $("#impossibleJ");
    var impSrc = Rx.Observable.fromEvent(imp, 'click');
    var impSub = impSrc.subscribe( function () {
        impossibleClickerM = newimpossibleClicker(playerM.val[0]);
        ws.send("CJ#$42," + groupM.val[3] + "," + playerM.val[0] + "," + "dummy");
    })

    var nD = $("#newDisplay")
    var nDSrc = Rx.Observable.fromEvent(nD, 'click');
    var nDSub = nDSrc.subscribe( function () {
        ws.send("CR#$42," + groupM.val[3] + "," + playerM.val[0] + "," + "dummy");
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

    var priv = $("#private")
    var privSrc = Rx.Observable.fromEvent(priv, 'click');
    var privSub = privSrc.subscribe( function () {
        groupM = newgroup("private");
        ws.send("CO#$42," + "private" + "," + playerM.val[0] + "," + "dummy");
        $("#b0").html("Solitaire mode. Your actions do not affect other players.")
    });

    var pubA = $("#publicA");
    var pubASrc = Rx.Observable.fromEvent(pubA, 'click');
    var pubASub = pubASrc.subscribe( function () {
        groupM = newgroup("pubA");
        ws.send("CO#$42," + "pubA" + "," + playerM.val[0] + "," + "dummy");
        $("#b0").html("You are now in Group A. Be careful." +
            " Clicking 'ROLL' inserts the roll numbers in all" +
            " Group A browsers.");
    });

    var pubB = $("#publicB");
    var pubBSrc = Rx.Observable.fromEvent(pubB, 'click');
    var pubBSub = pubBSrc.subscribe( function () {
        groupM = newgroup("pubB");
        ws.send("CO#$42," + "pubB" + "," + playerM.val[0] + "," + "dummy");
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
        ws.send("CO#$42," + name + "," + playerM.val[0] + "," + "dummy");
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
    var d = DS_ob.t;
    var t = DS_ob.t;
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
        $("#result1").show().html(res);
        ws.send("CE#$42," + group + "," + player + "," + "<br>" + a + " " + b + " " + c + " = " + res + "<br>");
    }

    if (d === 1) {
        ws.send("CE#$42," + group + "," + player + "," + a + " " + 
            b + " " + c + " = " + res + "<br>");
        if (res === 20 && bb)   {
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
                    "color:#f00;'>20, but no increase in " + player + "'s score</span>");
            }
            t = -1;
            $("#operators").html("");
            $("#dropBoxes").html("");
        }
        $("#result2").show().html(res);
    }

    if (d === 2) {
        ws.send("CE#$42," + group + "," + player + "," + a + " " + b + " " + c + " = " + res + "<br>");
        if (res === 20) {
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
                $("#a1").prepend("<span style='font-size:25px;color:#f00;'>20, but no increase in " +
                    player + "'s score</span>");
            }
            DS_ob.t = -1;
            $("#operators").html("");
            $("#dropBoxes").html("");
        }
        if (res !== 20 && (player === scoreClicker && t > 0)) {
            sub1.dispose();
            DS_ob.t = -1;
            DS_ob.scoreFunc();
        }
        $("#result3").show().html(res);
        $("#newDisplay").show();
    }
};
