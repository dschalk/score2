{-# LANGUAGE OverloadedStrings, TemplateHaskell #-}
import Data.Char (isPunctuation, isSpace)
import Data.Monoid (mappend)
import Data.Text (Text)
import Control.Exception (finally)   
import Control.Monad (forM_, forever)
import Control.Concurrent 
import Control.Monad.IO.Class (liftIO)
import qualified Data.Text as T
import qualified Data.Text.IO as T
import qualified Network.WebSockets as WS
import qualified Network.Wai
import qualified Network.Wai.Handler.Warp as Warp
import qualified Network.Wai.Handler.WebSockets as WaiWS
import qualified Network.Wai.Application.Static as Static
import Data.FileEmbed (embedDir)
import Fm hiding (main)
import Data.List (intersperse)
import Control.Exception.Base (mask_)

go :: Text
go = T.pack "GO"

type Name = Text
type Score = Int
type Client = (Name, Score, WS.Connection)
type ServerState = [Client] 

fx :: [String] -> String
fx [_,b,_,_] = b
fx _ = "EE#$42"

fz :: [String] -> String
fz [_,_,c,_] = c
fz _ = "EE#$42"

fw :: [String] -> String
fw [_,_,_,d] = d
fw _ = "EE#$42"

fstatus :: [String] -> String
fstatus [_,b,_,_,_,_,_,_] = b
fstatus _ = "EE#$42"

fsender :: [String] -> String
fsender [_,_,c,_,_,_,_,_] = c
fsender _ = "EE#$42"

froll :: [String] -> String
froll [_,_,_,a,b,c,d,e] = a ++ "," ++ b ++ "," ++ c ++ "," ++ d ++ "," ++ e
froll _ = "EE#$42"

getName :: (t, t1, t2) -> t
getName (a,_,_) = a
getScore (_,b,_) = b
getConn (_,_,c) = c

tr :: (Text, Int, WS.Connection) -> Text
tr x = getName x `mappend` T.pack " " `mappend` T.pack (show (getScore x))

getUnderlying :: Client -> (Text, Int, WS.Connection)
getUnderlying x = x

incFunc :: Text -> Client -> Client
incFunc x (a, b, c)   | x == a   = (a, b + 1, c)
                      | otherwise = (a, b, c)

decFunc :: Text -> Client -> Client
decFunc x (a, b, c)   | x == a   = (a, b - 1, c)
                      | otherwise = (a, b, c)

decFunc2 :: Text -> Client -> Client
decFunc2 x (a, b, c)   | x == a   = (a, b - 2, c)
                       | otherwise = (a, b, c)

upScore :: Text -> ServerState -> ServerState 
upScore name = map (incFunc name)

downScore :: Text -> ServerState -> ServerState 
downScore name = map (decFunc name)

downScore2 :: Text -> ServerState -> ServerState 
downScore2 name = map (decFunc2 name)

newServerState :: ServerState
newServerState = []

numClients :: ServerState -> Int
numClients = length

matches :: Text -> ServerState -> [Client] 
matches a ss = [ x | x <- ss, getName x == a]

clientExists :: Text -> ServerState -> Bool
clientExists a ss  | null (matches a ss)   = False
                   | otherwise             = True 

addClient :: Client -> ServerState -> ServerState
addClient client clients = client : clients

removeClient :: Client -> ServerState -> [Client]
removeClient client = filter ((/= getName client) . getName)

broadcast :: Text -> ServerState -> IO ()
broadcast message clients = do
    T.putStrLn message
    forM_ clients $ \(_, _, conn) -> WS.sendTextData conn message

main :: IO ()
main = do
    putStrLn "http://localhost:3000/client.html"
    state <- newMVar newServerState
    Warp.runSettings Warp.defaultSettings
      { Warp.settingsPort = 3000
      } $ WaiWS.websocketsOr WS.defaultConnectionOptions (application state) staticApp
staticApp :: Network.Wai.Application
staticApp = Static.staticApp $ Static.embeddedSettings $(embedDir "static")
application :: MVar ServerState -> WS.ServerApp
application state pending = do
    conn <- WS.acceptRequest pending
    WS.forkPingThread conn 30
    msg <- WS.receiveData conn
    clients <- liftIO $ readMVar state
    case msg of
        _   | not (prefix `T.isPrefixOf` msg) ->
                WS.sendTextData conn ("Wrong announcement" :: Text)
            | any ($ getName client)
                [T.null, T.any isPunctuation, T.any isSpace] ->
                    WS.sendTextData conn ("Name cannot " `mappend`
                        "contain punctuation or whitespace, and " `mappend`
                        "cannot be empty" :: Text)
            | clientExists (getName client) clients ->
                WS.sendTextData conn ("User already exists" :: Text)
            | otherwise -> flip finally disconnect $ do
                liftIO $ modifyMVar_ state $ \s -> do
                    let s' = addClient client s  
                    WS.sendTextData conn $ "CC#$42" `mappend` T.intercalate ", " (map tr s')
                    print $ "CC#$42" `mappend` T.intercalate ", " (map tr s')
                    broadcast (getName client `mappend` " joined") s'
                    broadcast ("CB#$42" `mappend` (T.concat(intersperse (T.pack "<br>") (map tr s')))) s'
                    return s' 
                talk conn state client 
         where
                prefix     = "CC#$42"
                client     = (T.drop (T.length prefix) msg, 0, conn)
                disconnect = do
                  s <- modifyMVar state $ \s ->
                     let s' = removeClient client s in return (s', s')
                  broadcast (getName client `mappend` " disconnected") s
                  s'' <- readMVar state
                  broadcast ("CB#$42" `mappend` (T.concat (intersperse (T.pack "<br>") (map tr s'')))) s''                 
talk :: WS.Connection -> MVar ServerState -> Client -> IO ()
talk conn state (user, _, _) = forever $ do
    msg <- WS.receiveData conn 
    let source = T.pack ("," ++ fx (Prelude.map T.unpack (T.split (==',') msg))) 
    let sender = T.pack ("," ++ fz (Prelude.map T.unpack (T.split (==',') msg))) 
    let extra = T.pack ("," ++ fw (Prelude.map T.unpack (T.split (==',') msg))) 
    let rollText = T.pack (froll (Prelude.map T.unpack (T.split (==',') msg))) 
    print $ "rollText is: " `mappend` rollText
    let rollStatus = T.pack ("," ++ fstatus (Prelude.map T.unpack (T.split (==',') msg)))
    let rollSender = T.pack ("," ++ fsender (Prelude.map T.unpack (T.split (==',') msg)))
    print $ source `mappend` sender `mappend` rollText 
    if "CA#$42" `T.isPrefixOf` msg
            then do 
                x <- liftIO $ roll 6 6 12 20
                let z = map round x 
                print $ T.pack "In CA#$42; here is source, sender, and the roll: " `mappend` source `mappend` sender `mappend` T.pack "," `mappend` T.pack (show z) 
                liftIO $ readMVar state >>= broadcast ("CA#$42" `mappend` source `mappend` sender `mappend` "," `mappend` T.pack (show z))                 
                return ()

    else if "CZ#$42" `T.isPrefixOf` msg
            then do 
                print "______________In CZ#$42"
                let roll = rollText
                y <- liftIO $ truck $ tru roll
                let yzz = T.pack y 
                st <- readMVar state
                broadcast ("CZ#$42" `mappend` rollStatus `mappend` rollSender `mappend` T.pack "," `mappend` yzz) st        

    else if "CW#$42" `T.isPrefixOf` msg
            then do 
                print "______________In CW#$42"
                let roll = rollText
                print $ T.pack "roll is: " `mappend` roll
                y <- liftIO $ truck $ tru roll
                let zz = T.pack y 
                st <- readMVar state
                broadcast ("CW#$42" `mappend` rollStatus `mappend` rollSender `mappend` T.pack "," `mappend` zz) st  

    else if "CB#$42" `T.isPrefixOf` msg
    	then 
            do 
                st <- readMVar state 
                broadcast ("CB#$42" `mappend` (T.concat (intersperse ("<br>") (map tr st)))) st 
                print ("CB#$42" `mappend` (T.concat (intersperse ("<br>") (map tr st))))

    else if ("CC#$42" `T.isPrefixOf` msg || "CE#$42" `T.isPrefixOf` msg || "CF#$42" `T.isPrefixOf` msg || 
        "CH#$42" `T.isPrefixOf` msg || "CJ#$42" `T.isPrefixOf` msg || "CK#$42" `T.isPrefixOf` msg || 
        "CO#$42" `T.isPrefixOf` msg || "CP#$42" `T.isPrefixOf` msg || "CQ#$42" `T.isPrefixOf` msg || 
        "CY#$42" `T.isPrefixOf` msg)
        then 
            do 
                st <- readMVar state 
                broadcast (msg) st
                print "CC#$42 or CE#$42 or CF#$42 or CH#$42 or CJ#42 or CK$#42 or CO#$42 or CP#42 or CQ$#42 or CY#$42"   

    else if "CG#$42" `T.isPrefixOf` msg
        then 
            mask_ $ do 
                let winner = T.drop 6 msg 
                old <- takeMVar state
                let new = upScore winner old
                putMVar state new 
                st2 <- readMVar state
                broadcast msg st2
                broadcast ("CB#$42" `mappend` (T.concat (intersperse ("<br>") (map tr st2)))) st2 
                print ("The winner is " `mappend` winner)
                print msg     

    else if "CI#$42" `T.isPrefixOf` msg
        then 
            mask_ $ do 
                let winner = T.drop 6 msg 
                old <- takeMVar state
                let new = downScore winner old
                putMVar state new 
                st2 <- readMVar state
                broadcast (msg) st2
                broadcast ("CB#$42" `mappend` (T.concat (intersperse ("<br>") (map tr st2)))) st2 
                print ("The loser is " `mappend` winner)
                print "CI$#42"    

    else if "CL#$42" `T.isPrefixOf` msg
        then 
            mask_ $ do 
                let loser = T.drop 6 msg 
                old <- takeMVar state
                let new = downScore loser old
                putMVar state new 
                st2 <- readMVar state
                broadcast (msg) st2
                broadcast ("CB#$42" `mappend` (T.concat (intersperse ("<br>") (map tr st2)))) st2 
                print ("The loser is " `mappend` loser)
                print "CL$#42"    

    else if "CM#$42" `T.isPrefixOf` msg
        then 
            mask_ $ do 
                let winner = T.drop 6 msg 
                old <- takeMVar state
                let new = upScore winner old
                putMVar state new 
                st2 <- readMVar state
                broadcast (msg) st2
                broadcast ("CB#$42" `mappend` (T.concat (intersperse ("<br>") (map tr st2)))) st2 
                print ("The winner is " `mappend` winner)
                print "CM$#42"     

    else if "CN#$42" `T.isPrefixOf` msg
        then 
            mask_ $ do 
                let loser = T.drop 6 msg 
                old <- takeMVar state
                let new = downScore2 loser old
                putMVar state new 
                st2 <- readMVar state
                broadcast (msg) st2
                broadcast ("CB#$42" `mappend` (T.concat (intersperse ("<br>") (map tr st2)))) st2 
                print ("The impossible loser is " `mappend` loser)
                print "CN$#42"    
    else 
        do 
            liftIO $ readMVar state >>= broadcast (user `mappend` ": " `mappend` msg) 
            print ("Default " `mappend` user `mappend` ": " `mappend` msg)
