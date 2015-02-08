This flow of this application can best be understood by following the message prefixes.

First, CC#$42 is sent from the login form.
The server intercepts CC#$42 and if everything is in order, responds with:
```haskell
liftIO $ modifyMVar_ state $ \s -> do
  let s' = addClient client s  
  WS.sendTextData conn $ "CC#$42" `mappend` T.intercalate (", ") (map tr s')
  print $ "CC#$42" `mappend` T.intercalate (", ") (map tr s')
  broadcast (getName client `mappend` " joined") s'
  broadcast ("CB#$42" `mappend` (T.concat(intersperse (T.pack "<br>") (map tr s')))) s'
   return s' 
```

"WS.sendTextData conn ..." is critically important for initializing the newly logged in browser, hiding the login form and initializing the message form and display. All browsers receive notification of the login along with the updated server state in the message prefixed by "CB#$42". In the message board section of the server file, "CB#$42" prefixed messages are intercpted and used for updating all browsers with the current server state.
```haskell
    else if ("CB#$42" `T.isPrefixOf` msg)
    	then
            do
                st <- readMVar state
                broadcast ("CB#$42" `mappend` (T.concat (intersperse (T.pack "<br>") (map tr st)))) st
```
The server state goes out as a text message and is received as a Javascript String containing HTML.

Back to the login section: "addClient" updates the server state MVar and returns the server state, whose type is defined as follows:
```haskell
type Client = (Name, Score, WS.Connection)
type ServerState = [Client]
newServerState :: ServerState
newServerState = []
```
The server state is created at the start of the main function as so:
```haskell
main = do 
    state <- newMVar newServerState
    ...
```
Now let's get back to following the trail of prefixes. As mentioned above, when the server receives "CB#$42", it broadcases the server state (parsed into Text) with the same prefix it received: "CB#$42". The browsers intercept the message, preventing it from becoming a chat message, and use the fresh server state text (now a Javascript String) to update the player-score displays in all connected browsers. Here is the code for intercepting messages:
```haskell
function onMessage(event) {
    var d2 = event.data.substring(0,6);
    var p = $(document.createElement('p')).text(event.data);

    switch (d2) {
        case "CB#$42":
            $("#users").html(event.data.substring(6));
        break;

        case "CA#$42":
            d = -1;
            console.log("Received GO message.")
            var l = event.data.substring(7);
            ls = l.split(",");
            var a = ls[0]
            var b = ls[1]
            var c = ls[2]
            var d = ls[3]
            roll.a = a;
            roll.b = b;
            roll.c = c;
            roll.d = d;
            $("#drag3").html(a);
            $("#drag5").html(b);
            $("#drag7").html(c);
            $("#drag9").html(d);
            $("#info").html(a + " &nbsp; " + b + " &nbsp; " + c + " &nbsp; " + d + "<br><br>");
        break;

        case "CC#$42":
            ws.send("CB#$42");
        break;

        case "CD#$42":
            $('#warnings').append('CD#$42 was intercepted in the messages section.');
        break;

        default:

        $('#messages').append(p);
        $('#messages').animate({scrollTop: $('#messages')[0].scrollHeight});
        break;
    }
}
```
Prefixing messages with six-digit codes allows them to be conveniently organized in a single switch routine testing the value of "d2". In the browsers, "CB#42" updates the scoreboards with the server state. "CA#42" promts the server to compute of a new set random numbers for the next round of play.





















