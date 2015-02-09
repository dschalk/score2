function createWebSocket(path) {
    var host = window.location.hostname;
    if(host == '') host = 'localhost';
    var uri = 'ws://' + host + ':3000' + path;
    var Socket = "MozWebSocket" in window ? MozWebSocket : WebSocket;
    return new Socket(uri);
}

var ws;
var users = [];
var ar = [];
var bool = [];
var createFunctions;
var d = -1;
var createDom;
var createOperators;
var createDropboxes;
var createDrop1;
var createDrop2;
var timeSet;
var DS_T = -1;  
var player;
var scoreClicker = "a@F$Uy&score";
var impossibleClicker = "a@F$Uy&impossible";
var setPlayer;
var setScoreClicker;
var setImpossibleClicker;
var privateClicker;
var tog = 0;
var rollText = "1,1,1,1,42"
var setRollText;
var yar;
var refreshDropboxes;
var timeSet;
var resetd;
var populate;
var refresh

setInterval (function () {
    if (DS_T < 0) {
        return;
    }
    else if ( DS_T === 0 ) {
        $("#a0").html("");
        timeSet(-1);
        console.log("**************************************************")
        console.log("player: " + player + " scoreClicker: " + 
            scoreClicker + " impossibleClicker: " + impossibleClicker);
        if (player === scoreClicker) {
            ws.send("CL#$42," + privateClicker + "," + player + "," + "horse");
            console.log("Sending CL#$42")
        }    
        if ( player === impossibleClicker) {
            ws.send("CM#$42,"+ privateClicker + "," + player + "," + "mule");
            console.log("Sending CM#$42")
        }
    }
    else if (DS_T > 0) {
        $("#a0").html(DS_T);
        DS_T = DS_T - 1;
    }
}, 1000);

function refreshUsers() {
    $('#users').html('');
    for(i in users) {
        $('#users').append($(document.createElement('li')).text(users[i]));
    }
}

function refresh() {
    d = -1;
    DS_T = -1;
    setScoreClicker("a@F$Uy&score");
    setImpossibleClicker("a@F$Uy&impossible");
    ar = [];
    bool = [];
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
    console.log(event.data);
    gameArray = event.data.split(",");
    var d2 = event.data.substring(0,6);
    var source = gameArray[1];  // Value of sender's privateClicker
    var sender = gameArray[2];
    var extra = gameArray[3];
    var p = $(document.createElement('p')).text(event.data); 
    if (player === source || privateClicker === "a@F$Uy&private" &&  source === "a@F$Uy&private") {
        switch (d2) {
            case "CA#$42":               // Set up the next round of play.
                resetd();
                refresh(); 
                $("#impossibleJ").show();
                $("#scoreF").show();
                $("#info1").html("");
                $(".erase").show();
                $(".erase2").show();
                $("#show").show();
                $("#show2").show();
                $("#solutions").show();
                $("#iutions2").show();
                var auu = gameArray[3]
                var buu = gameArray[4]
                var cuu = gameArray[5]
                var duu = gameArray[6]
                rollText = auu + "," + buu + "," + cuu + "," + duu + "," + 42;
                setRollText(rollText);
                console.log("Here is rollText: " + rollText); 
                populate(auu,buu,cuu,duu);
                $("#a4").html(auu + " &nbsp; " + buu + " &nbsp; " + cuu + " &nbsp; " + duu);
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
                timeSet(31);
                DS_T = 31;
                if (sender !== scoreClicker) {
                    $("#a1").html("<h3> <br><br><br>" + scoreClicker + " must make the number '20' before time runs out.</h3>");
                    $("#newDisplay").hide();
                    $("#impossibleJ").hide();
                }
            break;

            case "CG#$42":
                DS_T = -1;
                $("#a0").html("");
                $("#a2").append("<br>One point for " + sender);
                $("#a1").prepend("<span style='font-size:75px; background:#000; color:#f00;'>Score!</span>");
                $("#newDisplay").show();          
            break;

            case "CH#$42":

            break;


            case "CI#$42":
                $("#a2").append("<br>deduct one point from " + event.data.substring(6) + "The time ran out.");
                $("#newDisplay").show();
            break;

            case "CJ#$42":
                $("#impossibleJ").hide();
                impossibleClicker = sender;
                setImpossibleClicker(sender);
                $("#a2").prepend("<br>" + sender + " clicked 'IMPOSSIBLE'");
                DS_T = 61;
                timeSet(61);
            break;

            case "CL#$42":
                $("#a2").append("<br>deduct one point from " + event.data.substring(6) + "'s score. The time ran out.");
                console.log("One point deducted")
                $("#newDisplay").show();
            break;

            case "CM#$42":
                $("#a2").append("<br>One point for " + event.data.substring(6));
                $("#a1").prepend("<span style='font-size:75px; background:#000; color:#f00;'>Score!</span>");
                $("#a2").prepend("<br>Time's up and nobody found a solution");
                $("#newDisplay").show();               
            break;

            case "CN#$42":
                DS_T = -1;
                timeSet(-1);
                $("#a2").append("<br>deduct two points from " + impossibleClicker + 
                    "'s score. <br>A solution was found before 60 seconds had passed.");
                $("#newDisplay").show();
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
                console.log(event.data);
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

    else {
        switch (d2) {
            case "CB#$42":
                $("#users").html(event.data.substring(6));    // Refresh browser with server state.
            break;

            case "EE#$42":

            break;          

            case "CW#$42":

            break;       

            case "CZ#$42":

            break;       

            case "CA#$42":

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
            break
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
    $("#show").hide();
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
    $('.erase2').hide();
    })

    $("#rollA")
    .button()
    .click(function(){ 
        bool = [];
        d = -1;
        ws.send("CA#$42," + privateClicker + "," + player + "," + "cow");
    })

    $("#solutions")
    .button()
    .click(function(){ 
        console.log("This is rollText from solutions: " + rollText)
        console.log("From solutions: CZ#$42," + privateClicker + "," + player + "," + rollText);
        console.log("This is rollText from solutions 2: " + rollText)
        ws.send("CZ#$42," + privateClicker + "," + player + "," + rollText);
    });

    $("#solutions2")
    .button()
    .click(function(){ 
        var a = $("#x0").val();
        var b = $("#x1").val();
        var c = $("#x2").val();
        var d = $("#x3").val();
        var e = a + "," + b + "," + c + "," + d + "," + "42"
        console.log("Here is e from solutions2: " + e)
        $("#x0").val("");
        $("#x1").val("");
        $("#x2").val("");
        $("#x3").val("");
        ws.send("CW#$42," + privateClicker + "," + player + "," + e);
        $('.erase2').show();
    });

    $("#scoreF")
    .button()
    .click(function(){ 
        $("#scoreF").hide();
        scoreClicker = player;
        setScoreClicker(player);
        $("#impossibleJ").hide();
        ws.send("CF#$42," + privateClicker + "," + player);
    });

    $("#impossibleJ")
    .button()
    .click(function(){ 
        impossibleClicker = player;
        setImpossibleClicker(player);
        console.log("From impossible button. impossibleClicker is: " + impossibleClicker)
        ws.send("CJ#$42," + privateClicker + "," + player);
    })

    $("#newDisplay")
    .button()
    .click(function(){ 
        d = -1;
        DS_T = -1;
        setScoreClicker("a@F$Uy&score");
        setImpossibleClicker("a@F$Uy&impossible");
        ar = [];
        bool = [];
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

    timeSet = function(t) {
        DS_T = t;
    }

    setPlayer = function(x) {
        player = x;
    };

    setRollText = function(x) {
        rollText = x;
    };

    $("#private")
    .button()
    .click(function(){ 
        $("#public").show();
        $("#private").hide();
        console.log("privateClicker player " + privateClicker + " " + player);
        privateClicker = player;
        $("#b0").html("Solitaire mode. Your actions do not affect other players.")
    });

    $("#public")
    .button()
    .click(function(){ 
        privateClicker = "a@F$Uy&private";
        $("#private").show();
        $("#public").hide();
        console.log("privateClicker player " + privateClicker + " " + player);
        $("#b0").html("Now in multiplayer mode. Be careful." + 
            " Clicking 'ROLL' inserts the roll numbers in all" + 
            " participating browsers.");
    });

    resetd = function() {
        d = -1;
    }

    setPrivate = function(x) {
        privateClicker = x;
        $("#b0").html("Solitaire mode. Your actions do not affect other players.")
    };

    setPublic = function() {
        privateClicker = "a@F$Uy&private";
        $("#b0").html("Now in multiplayer mode. Be careful." + 
            "Clicking 'ROLL' inserts the roll numbers in all" + 
            "participating browsers.");
    };

    setScoreClicker = function(x) {
        scoreClicker = x;
    };

    setImpossibleClicker = function(x) {
        impossibleClicker = x;
    };

    $('#join-form').submit(function () {
        $('#warnings').html('');
        var user = $('#user').val();
        setPlayer(user);
        player = user;
        ws = createWebSocket('/');
        ws.onopen = function() {
            ws.send("CC#$42" + user);
        };
        ws.onmessage = function(event) {
            console.log(event.data);
            if(event.data.substring(0,6) == "CC#$42") {
                d = -1;
                setPrivate(player);
                console.log("player is: " + player)
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
    console.log("IN calc FUNCTION . . . player: " + player + " scoreClicker: " + 
        scoreClicker + " impossibleClicker: " + impossibleClicker);
    d = d + 1;
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
    
    console.log("Here's res: " + res);

    if (d === 0) {
        $("#result1").show();
        $("#result1").html(res);
        if ((player === scoreClicker) && DS_T > 0) {
            ws.send("CE#$42," + privateClicker + "," + player + "," + "<br>" + a + " " + b + " " + c + " = " + res + "<br>");
        }
        else {
            $("#a4").append("<br>" + a + " " + b + " " + c + " = " + res + "<br>" );
            $("#rollA").hide();
            $("#newDisplay").show();
        }
    }

    if (d === 1) {
        if (res === 20 && bb)   {   
            console.log("scoreClicker : " + scoreClicker + " DS_T: " + DS_T)
            if ((player === scoreClicker) && DS_T > 0) {
                ws.send("CG#$42," + privateClicker + "," + player + "," + "cow");
                ws.send("CE#$42," + privateClicker + "," + player + "," + "<br>" + a + " " + b + " " + c + " = " + res + "<br>");
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
            DS_T = -1;
            timeSet(-1);
            $("#operators").html("");
            $("#dropBoxes").html("");
        }
        $("#result2").show();
        $("#result2").html(res);      
        if ((player === scoreClicker) && DS_T > 0) {
            ws.send("CE#$42," + privateClicker + "," + player + "," + "<br>" + a + " " + b + " " + c + " = " + res + "<br>");
        }
        else {
            $("#a4").append(a + " " + b + " " + c + " = " + res + "<br>" );
            $("#rollA").hide();
            $("#newDisplay").show();
        }
    }

    if (d === 2) {
        if (res === 20) {     
            console.log("scoreClicker : " + scoreClicker + " DS_T: " + DS_T)
            if ((player === scoreClicker) && DS_T > 0) {
                ws.send("CG#$42," + privateClicker + "," + player + "," + "cow");
                ws.send("CE#$42," + privateClicker + "," + player + "," + a + " " + b + " " + c + " = " + res + "<br>");
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
            DS_T = -1;
            timeSet(-1);
            $("#operators").html("");
            $("#dropBoxes").html("");
        }
        $("#result3").show();
        $("#result3").html(res);      
        if ((player === scoreClicker) && DS_T > 0) {
            ws.send("CE#$42," + privateClicker + "," + player + "," +  a + " " + b + " " + c + " = " + res + "<br>");
        }
        else {
            $("#a4").append(a + " " + b + " " + c + " = " + res + "<br>" );
            $("#rollA").hide();
            $("#newDisplay").show();
        }
    }
};



