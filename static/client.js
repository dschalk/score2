function createWebSocket(path) {
    var host = window.location.hostname;
    if(host == '') host = 'localhost';
    var uri = 'ws://' + host + ':3000' + path;
    var Socket = WebSocket           // "MozWebSocket" in window ? MozWebSocket : WebSocket;
    return new Socket(uri);
    connect("/",{
        "connect timeout": 360000,
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
var tog = 0;
var refreshDropboxes;
var populate;
var refresh

timer = { 
    t: -1,
    setTime: function (x) {
        timer.t = x;
    },
    getTime: function () {return timer.t},
    run: function () { setInterval (function () {
            if (timer.t < 0) {
                return;
            }
            else if ( timer.t === 0 ) {
                var privateClicker = players.getPrivateClicker();
                var player = players.getPlayer();
                var impossibleClicker = players.getImpossibleClicker();
                var scoreClicker = players.getScoreClicker();
                $("#a0").html("");
                timer.t = -1;
                if (player === scoreClicker) {
                    ws.send("CL#$42," + privateClicker + "," + player + "," + "horse");
                }    
                if ( player === impossibleClicker) {
                    ws.send("CM#$42,"+ privateClicker + "," + player + "," + "mule");
                }
            }
            else if (timer.t > 0) {
                $("#a0").html(timer.t);
                timer.t = timer.t - 1;
            }
        }, 1000);
    }()
}

pl = function (){
    var player;
    var scoreClicker = "a@F$Uy&score";
    var impossibleClicker = "a@F$Uy&impossible";
    var privateClicker = "a@F$Uy&private";
    var rollText = "1,1,1,1,42";
    var d = -1; 
    return {
        setPlayer: function(x) {
            player = x;
            return this;
        },
        getPlayer: function() {
            return player;
        },
        setScoreClicker: function(x) {
            scoreClicker = x;
            return this;
        },
        getScoreClicker: function() {
            return scoreClicker;
        },
        setImpossibleClicker: function(x) {
            impossibleClicker = x;
            return this;
        },
        getImpossibleClicker: function() {
            return impossibleClicker;
        },
        setPrivateClicker: function(x) {
            privateClicker = x;
            return this;
        },
        getPrivateClicker: function() {
            return privateClicker;
        },
        setRollText: function(x) {
            rollText = x;
            return this;
        },
        getRollText: function() {
            return rollText;
        },
        setD: function(x) {
            d = x;
            return this;
        },
        getD: function() {
            return d;
        }
    }
};


function refreshUsers() {
    $('#users').html('');
    for(i in users) {
        $('#users').append($(document.createElement('li')).text(users[i]));
    }
}

function refresh() {
    timer.setTime(-1);
    players.setD(-1)
    .setScoreClicker("a@F$Uy&score") 
    .setImpossibleClicker("a@F$Uy&impossible");
    ar = [];
    bool = [];
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
    $("#scoreG").hide();
    $("#impossibleJ").hide();
    $("#scoreF").hide();
    $("#newDisplay").hide();
}

function onMessage(event) {
    var impossibleClicker = players.getImpossibleClicker();
    var player = players.getPlayer();
    var scoreClicker = players.getScoreClicker();
    var privateClicker = players.getPrivateClicker();
    var gameArray = event.data.split(",");
    var d2 = event.data.substring(0,6);
    var d3 = event.data.substring(2,6);
    var d4 = event.data.substring(6);
    var sourceStatus = gameArray[1];  // Value of sender's privateClicker
    var sender = gameArray[2];
    var extra = gameArray[3];
    var p = $(document.createElement('p')).text(event.data); 
    console.log(event.data);
    if (player === sender || privateClicker !== "a@F$Uy&private" &&  sourceStatus !== "a@F$Uy&private") {
        switch (d2) {
            case "CA#$42":               // Set up the next round of play.
                refresh(); 
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
                rollText = auu + "," + buu + "," + cuu + "," + duu + "," + 42;
                players.setRollText(rollText) 
                .setD(-1);
                populate(auu,buu,cuu,duu);
                $("#a4").html(auu + " &nbsp; " + buu + " &nbsp; " + cuu + " &nbsp; " + duu);
            break;

            case "CB#$42":
                $("#users").html(event.data.substring(6));    // Refresh browser with server state.
            break;

            case "CC#$42":       // Prevent new player login data from displaying as a chat message.
                return;
            break;

            case "CE#$42":
                $("#a4").append(extra);  // Display computations.
                $("#rollA").hide();
                $("#newDisplay").show();
            break;

            case "CF#$42":
                $("#a2").append("<br>" + sender + " clicked 'SCORE'");
                $("#a0").show();
                $("#rollA").hide();
                $("#newDisplay").show();
                $("#scoreF").hide();
                timer.setTime(31);
                if (sender !== scoreClicker) {
                    $("#a1").html("<h3> <br><br><br>" + scoreClicker + " must make the number '20' before time runs out.</h3>");
                    $("#newDisplay").hide();
                    $("#impossibleJ").hide();
                }
            break;

            case "CG#$42":
                timer.setTime(-1);
                $("#a0").html("");
                $("#a2").append("<br>One point for " + sender);
                $("#a1").prepend("<span style='font-size:75px; background:#000; color:#f00;'>Score!</span>");
                $("#newDisplay").show(); 
            break;

            case "CH#$42":

            break;

            case "CI#$42":
                $("#a2").append("<br>deduct one point from " + sender + "The time ran out.");
                $("#newDisplay").show();
            break;

            case "CJ#$42":
                $("#impossibleJ").hide();
                players.setImpossibleClicker(sender);
                $("#a2").prepend("<br>" + sender + " clicked 'IMPOSSIBLE'");
                timer.setTime(61);
            break;

            case "CL#$42":
                $("#a2").append("<br>deduct one point from " + sender + "'s score. The time ran out.");
                $("#newDisplay").show();
            break;

            case "CM#$42":
                $("#a2").append("<br>One point for " + sender);
                $("#a1").prepend("<span style='font-size:75px; background:#000; color:#f00;'>Score!</span>");
                $("#a2").prepend("<br>Time's up and nobody found a solution");
                $("#newDisplay").show();
            break;

            case "CN#$42":
                timer.setTime(-1);
                $("#a2").append("<br>deduct two points from " + impossibleClicker + 
                    "'s score. <br>A solution was found before 60 seconds had passed.");
                $("#newDisplay").show();
            break;

            case "CR#$42": 
                refresh();
            break;

            case "CW#$42":
                $("#show2").prepend(extra);
                $("#show2").append("<br>Brought to you by " + player)
            break;

            case "CZ#$42":
                $("#show").prepend(extra);
                $("#a2").prepend(sender + " clicked SOLUTIONS.<br><br>");
            break;

            case "EE#$42":

            break;

            default: 
                $('#messages').append(p);
                $('#messages').animate({scrollTop: $('#messages')[0].scrollHeight});
                if(event.data.match(/^[^:]* disconnected/)) {
                    var user = event.data.replace(/ .*/, '');
                    var idx = users.indexOf(user);
                    users = users.slice(0, idx).concat(users.slice(idx + 1));
                    refreshUsers();
                }
            break;
        }
    }

    else if (d2 === "CB#$42") { 
        $("#users").html(event.data.substring(6));
    }

    else if (d3 !== "#$42") {
        $('#messages').append(p);
        $('#messages').animate({scrollTop: $('#messages')[0].scrollHeight});
        if(event.data.match(/^[^:]* disconnected/)) {
            var user = event.data.replace(/ .*/, '');
            var idx = users.indexOf(user);
            users = users.slice(0, idx).concat(users.slice(idx + 1));
            refreshUsers();
        }
    }
};

$(document).ready(function () {
    $("#b0").hide();
    $("#experiment").hide();
    $("#private").hide();
    $("#public").hide();
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
    $("#scoreG").hide();
    $("#impossibleJ").hide();
    $("#a1").hide();
    $('.drag').draggable({ revert: "invalid", zIndex: 2 });
    $('.dragNew').draggable({ revert: "invalid", zIndex: 2 });
    $('.drag2').draggable({ helper: "clone", revert: "invalid", zIndex: 2 });
    
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
            '<div id="2" class="drop" >Num</div>'
        );
    };

    createDrop1 = function() {
        $('.drop').droppable({
            tolerance: "touch",
            hoverClass: 'active',
            accept: ".drag, .dragNew",
            drop: function(e, ui) {
                var dropID = $(this).attr( 'id' );
                var val = ui.draggable.html();
                ar[dropID] = val;
                bool.push(ui.draggable.attr( "name" ));  // "name" is either "undefined" or "new".
                ui.draggable.hide( "puff" );
                $(this).html(val);
                bb = (bool.indexOf("new") !== -1); // Did the player use a number generated by a previous computation?
                if (ar[0] !== undefined && ar[1] !== undefined && ar[2] !== undefined) {
                    calc(ar[0], ar[1], ar[2], bb);
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

    $(".erase")
    .button()
    .click(function(){ 
    $("#show").html("");
    })

    $(".erase2")
    .button()
    .click(function(){ 
    $("#show2").html("");
    $(".erase2").hide();
    $('#computations').hide();
    })

    $("#rollA")
    .button()
    .click(function(){ 
        bool = [];
        players.setD(-1);
        ws.send("CA#$42," + players.getPrivateClicker() + "," + players.getPlayer() + "," + "dummy");
    })

    $("#solutions")
    .button()
    .click(function(){ 
        ws.send("CZ#$42," + players.getPrivateClicker() + "," + players.getPlayer() + "," + rollText);
    });

    $("#solutions2")
    .button()
    .click(function(){ 
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
        ws.send("CW#$42," + players.getPrivateClicker() + "," + players.getPlayer()  + "," + e);
        $('#computations').show();
        $(".erase2").show();
        $("#show2").show();
    });

    $("#scoreF")
    .button()
    .click(function(){ 
        $("#scoreF").hide();
        players.setScoreClicker(players.getPlayer());
        $("#impossibleJ").hide();
        ws.send("CF#$42," + players.getPrivateClicker() + "," + players.getPlayer() + "," + "dummy");
    });

    $("#impossibleJ")
    .button()
    .click(function(){ 
        players.setImpossibleClicker(players.getPlayer());
        ws.send("CJ#$42," + players.getPrivateClicker() + "," + players.getPlayer() + "," + "dummy");
    })

    $("#newDisplay")
    .button()
    .click(function(){ 
        ws.send("CR#$42," + players.getPrivateClicker() + "," + players.getPlayer() + "," + "dummy");
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

    $("#private")
    .button()
    .click(function(){ 
        $("#public").show();
        $("#private").hide();
        players.setPrivateClicker("a@F$Uy&private");
        $("#b0").html("Solitaire mode. Your actions do not affect other players.")
    });

    $("#public")
    .button()
    .click(function(){ 
        players.setPrivateClicker(players.getPlayer());
        $("#private").show();
        $("#public").hide();
        $("#b0").html("Now in multiplayer mode. Be careful." + 
            " Clicking 'ROLL' inserts the roll numbers in all" + 
            " participating browsers.");
    });

    setPrivate = function(x) {
        privateClicker = x;
        $("#b0").html("Solitaire mode. Your actions do not affect other players.")
    };

    $('#join-form').submit(function () {
        $('#warnings').html('');
        var user = $('#user').val();
        players.setPlayer(user);
        ws = createWebSocket('/');
        ws.onopen = function() {
            ws.send("CC#$42" + user);
        };
        ws.onmessage = function(event) {
            if(event.data === "CC#$42") {
                players.setD(-1);
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
                $("#public").show();
                $("#b0").html("Solitaire mode. Click above to enable competition.")
                $("#rollA").show();   
                $("#a1").show();
                $('#join-section').hide();
                $('#chat-section').show();
                $('#users-section').show();
                $("#messages").show();
                ws.onmessage = onMessage;
                $('#message-form').submit(function () {
                    var text = $('#text').val();
                    ws.send(text);
                    $('#text').val('');
                    return false;
                });
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

var calc = function (ax,b,cx,bb) {
    var d = players.getD();
    var DS_T = timer.getTime();
    var impossibleClicker = players.getImpossibleClicker();
    var player = players.getPlayer();
    var scoreClicker = players.getScoreClicker();
    var privateClicker = players.getPrivateClicker();
    d = d + 1;
    players.setD(d);
    ar = [];
    bool = [];
    var res;
    var a = parseFloat(ax);
    var c = parseFloat(cx);
    switch (b) {
        case "+": resx = a + c;
        break;
        case "-": resx = a - c;
        break;
        case "*": resx = a * c;
        break;
        case "/": resx = a / c;
        break;
        case "Concat": resx = parseFloat(a+""+c);
        break;
    }
    if (Math.round(resx) != resx) {
        res = resx.toFixed(2);
    }
    else {
        res = resx;
    }

    var roundRes = function(x) {
        if ((x - 20) < 0.1 || (20 - x) < 0.1) {
            x = 20
        }
        return 20;
    }

    if (d === 0) {
        $("#result1").show();
        $("#result1").html(res);
        ws.send("CE#$42," + privateClicker + "," + player + "," + "<br>" + a + " " + b + " " + c + " = " + res + "<br>");
        $("#newDisplay").show();
    }
    if (d === 1) { 
        ws.send("CE#$42," + privateClicker + "," + player + "," + a + " " + b + " " + c + " = " + res + "<br>");
        if (roundRes(res) === 20 && bb)   {   
            if ((player === scoreClicker) && DS_T > 0) {
                ws.send("CG#$42," + privateClicker + "," + player + "," + "cow");
                if (impossibleClicker !== "a@F$Uy&impossible") {
                    ws.send("CN#$42," + privateClicker + "," + player + "," + impossibleClicker);
                }
            }
            else {
                $("#a2").append("<br>No point for " + player + ". The clock wasn't running.");
                $("#a1").prepend("<span style='font-size:25px; background:#000;" + 
                    "color:#f00;'>20, but no increase in " + player + "'s score</span>");
                $("#newDisplay").show();
            }
            timer.setTime(-1);
            $("#operators").html("");
            $("#dropBoxes").html("");
        }
        $("#result2").show();
        $("#result2").html(res);
        $("#newDisplay").show();
    }

    if (d === 2) { 
        ws.send("CE#$42," + privateClicker + "," + player + "," + a + " " + b + " " + c + " = " + res + "<br>");
        if (roundRes(res) === 20) {
            if ((player === scoreClicker) && DS_T > 0) {
                ws.send("CG#$42," + privateClicker + "," + player + "," + "cow");
                if (impossibleClicker !== "a@F$Uy&impossible") {
                    ws.send("CN#$42," + privateClicker + "," + player + "," + impossibleClicker);
                }
            }
            else {
                $("#a2").append("<br>No point for " + player + ". The clock wasn't running.");
                $("#a1").prepend("<span style='font-size:25px;color:#f00;'>20, but no increase in " + 
                    player + "'s score</span>");
                $("#newDisplay").show();
            }
            timer.setTime(-1);
            $("#operators").html("");
            $("#dropBoxes").html("");
        }
        $("#result3").show();
        $("#result3").html(res);
        if (res !== 20 && (player === scoreClicker) && DS_T > 0) {
            timer.setTime(0);
            $("#newDisplay").show();
        }
    }
};

