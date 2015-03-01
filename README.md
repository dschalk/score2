##The Game of Score
####*An extension of github.com/jaspervdj/websockets as implemented by yesodweb/wai/wai-websockets*

###Overview
I started with the chat example at github.com/wai/wai-websockets. It is Jasper Van der Jeugt 's websockets adapted to the warp web server. The routine work of the chat server is receiving messages from individual browsers and broadcasting them to all participants. The server facilitates what is tantamount to peer-to-peer interactions among the browsers. It also parses sign in messages to make sure the format is correct and there are no duplicate user names. The server keeps a list of participants in an MVar, and replaces the list with an updated version whenever there is a disconnect or a sign-in.

I modified the participant list to include scores along with names. Whenever the list is replaced due to a score change, sign-in, or disconnect, the server sends a line of text interspersed with "<br>" and the prefix 'CB#$42'. The browsers intercept these messages and divert them away from the chat message section and into the scoreboard. There are fifteen six-character message prefixes in the format 'Cx#42' where 'x' is some capital letter. None of these go into the chat message section. They contain data and instructions for the game. Application messages are either Javascript strings or Haskell Text. Browsers split comma-separated strings into arrays and distribute the elements according to the their six-character prefixes (element '0' in the arrays).

It would be nice if players could compete in small groups in discreet chat rooms, or even play solitaire in their own room. Solitaire play is currently an option, but the chat messages and scoreboard are communal. I am also thinking of providing the option of changing the dice from 6, 6, 12, and 20 sided to whatever the players choose. The goal in 'Score' is to make the number '20' out of four random numbers in two or three stages using addition, subtraction, multiplication, division, and concatenation. The goal of '20' could be made adjustable along with the maximum sizes of the four random integers. Suggestions are very welcome.

**Rules of "Score"**

Four dice are rolled. The default die are two six-sided, one twelve-sided, and one twenty-sided die. As mentioned above, the goal is to make the number "20" in two or three steps using addition, subtraction, multiplication, division, and/or concatenation.

If a player calls out "Score!", or clicks "SCORE" in the computer version, he or she must quickly demonstrate how to make the number "20". Failure to do so loses the player one point; success gains a point. Clicking "SCORE" starts a countdown which currently allows 30 seconds, which is more than enough time.

If a player clicks "IMPOSSIBLE", a 60-second countdown begins. If no player clicks "SCORE" during the 60 seconds, the player who clicked "IMPOSSIBLE" gains one point. If a player clicks "SCORE" during the countdown and succeeds in making "20" within 30 seconds, the player who clicked "IMPOSSIBLE" loses two points. It is possible for the player who clicked "IMPOSSIBLE" to also click "SCORE". Making the number "20" within 30 seconds gains back one of the two points lost because the 60 second countdown was successfully interrupted.

In order to gain a point by making the number "20", a player must use a number generated by a previous computation. Those number have the color red.

**Initiation Stage**

Score2 is based on websockets messages. Chat messages go to the server and are broadcast to all participating browsers. Messages intended for game control rather than chat boxes are prefixed by C\_#$42 where "\_" is a capital letter. Messages received by browsers which are for game control, and which usually carry data, also have the C _#$42 prefixes. The flow of this application can be understood by tracing the routes of the prefixed messages.

A player joins the game by entering a name in a form. Here is the Javascript form code:

```Javascript
    $('#join-form').submit(function () {
        $('#warnings').html('');
        var user = $('#user').val();
        players.setPlayer(user);
        ws = createWebSocket('/');
        ws.onopen = function() {
            ws.send("CC#$42" + user);
        };
```

The server parses the message prefixed by CC#$42 and, if the name is in the proper format and hasn't already been taken, the server (1) adds the new user' Client tuplet, (name, 0, WebSocket), to the ServerState list, [Client], MVar; (2) broadcasts an announcement for placement in the chat section of participating browsers; broadcasts the updated state information for placement in the scoreboard section: and (3) sends the message "CC#$42" to the new player. The new state information is sent with the prefix "CB#$42", which propmts the browsers to put the updated state information where it belongs. Anytime ServerState changes in the server, a message prefixed by CB#$42 and containing the new state information is broadcast to all participating players, keeping scoreboards syncronized with the servers state MVar.

The sign-in form sends a message prefixed by CC#$42 to the server and, if everything is in order, the server responds with

```haskell
liftIO $ modifyMVar_ state $ \s -> do
let s' = addClient client s  
WS.sendTextData conn $ T.pack "CC#$42"
broadcast (getName client `mappend` " joined") s'
broadcast ("CB#$42" `mappend` T.concat(intersperse (T.pack "<br>") (map tr s'))) s'
return s'
```
The message prefixed by "CB#$42" is processed in the browsers as follows:

```javascript
case "CB#$42":
$("#users").html(event.data.substring(6));    // Refresh browser with server state.
break;
```
The browsers do not need to process the message because the server interspersed '<br>' into the state data text it sent, and the browser receives it as a string of HTML. The text 'CC#42' is received a a six-character string, prompting a response as follows:

```javascript
ws.onmessage = function(event) {
  if(event.data === "CC#$42") {
    DS_ob.d = -1;
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
    $(".dropx").hide();
    $(".drop2x").hide();
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
```
After sign-in, this block of code probably gets garbage-collected. ws.onmessage = onMessage kicks in, and in onMessage we have the code:

```javascript
case "CC#$42":
// Prevents new player login data from defaulting to a chat message.
break;
```
This creates a dead end for messages prefixed by 'CC#42'.

**State And Its Containing MVar**

Here is how the game state is defined:

```haskell
type Name = Text
type Score = Int
type Client = (Name, Score, WS.Connection)
type ServerState = [Client]

newServerState :: ServerState
newServerState = []
```
The game state is placed in an MVar as follows:

```haskell
main = do
    state <- newMVar newServerState
...
```
State is modified during game play by removing state from the MVar and replacing it with the modified version. For example, the following code increases a player's score:

```haskell
incFunc :: Text -> Client -> Client
incFunc x (a, b, c)   | x == a   = (a, b + 1, c)
                      | otherwise = (a, b, c)

upScore :: Text -> ServerState -> ServerState
upScore name = map (incFunc name)

else if "CG#$42" `T.isPrefixOf` msg
then
mask_ $ do  
old <- takeMVar state
let new = upScore sender old
putMVar state new
broadcast msg new
broadcast ("CB#$42" `mappend` T.concat (intersperse "<br>" (map tr new))) new
```
The 'msg' being broadcast is just the unaltered message that was received. The 'CB#$42' prefixed message updates the browser scoreboards.

**Screening Massages Arriving At The Browsers**

The first stage of processing messages coming into the browsers is as follows:

```javascript
function onMessage(event) {
  var game = DS_ob.game;
  var impX = DS_ob.impossibleClicker;
  var plX = DS_ob.player;
  var scX = DS_ob.scoreClicker;
  var prX = DS_ob.privateClicker;
  var gameArray = event.data.split(",");
  var d2 = event.data.substring(0,6);
  var d3 = event.data.substring(2,6);
  var sourceStatus = gameArray[1];  // Value of sender's privateClicker
  var sender = gameArray[2];
  var extra = gameArray[3];
  var ext4= gameArray[4];
  var ext5 = gameArray[5];
  var ext6 = gameArray[6];
  var ext7 = gameArray[7];
  var ext8 = gameArray[8];
  var p = $(document.createElement('p')).text(event.data);
  if (plX === sender || prX !== "a@F$Uy&private" &&  sourceStatus !== "a@F$Uy&private") {
    switch (d2) {

```
Other than chat messages and the scoreboard update, each message is sent to the server begining with a six-digit prefix, the status (solitaire or group play) of the sender, and the name of the sender, all separated by commas. The server broadcasts messages with these same three preliminary items intact so, after splitting into 'gameArray', gameArray[0] is the six-character prefix, gameArray[1] is the sender's status, and gameArray[2] is the sender's name. The game status, prefixed by 'CB#$42', is sent without commas so instead of d2 = gamearray[0], we have 'd2 = event.data.substring(0,6)'. The test in the 'if' statement returns 'true' if the sender is the receiver of the prefix, or if the sender and receiver are both involved in group play. 'a@F$Uy&private' is the default status; i.e., private. When a player opts for group play, status is set equal to the player's name. This information is kept in the object 'DS_ob'.

*To be continued*