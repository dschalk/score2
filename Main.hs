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
import Data.List.Split (splitOn)

go :: Text
go = T.pack "GO"

type Name = Text
type Score = Int
type Client = (Name, Score, WS.Connection)
type ServerState = [Client] 

fx :: [String] -> Text
fx [_,b,_,_] = T.pack b
fx _ = T.pack "EE#$42"

fz :: [String] -> Text
fz [_,_,c,_] = T.pack c
fz _ = T.pack "EE#$42"

fw :: [String] -> Text
fw [_,_,_,d] = T.pack d
fw _ = T.pack "EE#$42"

fstatus :: [String] -> Text
fstatus [_,b,_,_,_,_,_,_] = T.pack b
fstatus _ = T.pack "EE#$42"

fsender :: [String] -> Text
fsender [_,_,c,_,_,_,_,_] = T.pack c
fsender _ = T.pack "EE#$42"

froll :: [String] -> Text
froll [_,_,_,a,b,c,d,e] = T.pack $ a ++ "," ++ b ++ "," ++ c ++ "," ++ d ++ "," ++ e
froll _ = T.pack "EE#$42"

getName :: Client -> Name
getName (a,_,_) = a


getScore :: Client -> Score
getScore (_,b,_) = b


getConn :: Client -> WS.Connection
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
      {
        Warp.settingsTimeout = 3600
      } $ WaiWS.websocketsOr WS.defaultConnectionOptions (application state) staticApp
staticApp :: Network.Wai.Application
staticApp = Static.staticApp $ Static.embeddedSettings $(embedDir "static")
application :: MVar ServerState -> WS.ServerApp
application state pending = do
    conn <- WS.acceptRequest pending
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
                    WS.sendTextData conn $ T.pack "CC#$42"
                    print $ "CC#$42" `mappend` T.intercalate ", " (map tr s')
                    broadcast (getName client `mappend` " joined") s'
                    broadcast ("CB#$42" `mappend` T.concat(intersperse (T.pack "<br>") (map tr s'))) s'
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
                  broadcast ("CB#$42" `mappend` T.concat (intersperse (T.pack "<br>") (map tr s''))) s''
talk :: WS.Connection -> MVar ServerState -> Client -> IO ()
talk conn state (user, _, _) = forever $ do
    msg <- WS.receiveData conn
    let msgArray = splitOn "," (T.unpack msg)
    let source = fx msgArray
    let sender = fz msgArray
    let extra = fw msgArray
    let source2 = fstatus msgArray
    let sender2 = fsender msgArray
    let extra2 = froll msgArray
    print $ "source, sender, extra, msg " `mappend` source  `mappend` ", " `mappend` sender  `mappend` ", " `mappend` extra `mappend` ", " `mappend` msg
    if "CA#$42" `T.isPrefixOf` msg 
        then 
            do 
                st <- readMVar state 
                z <- rText
                broadcast ("CA#$42," `mappend` source `mappend` "," `mappend` sender `mappend` "," `mappend` z) st

    else if "CZ#$42" `T.isPrefixOf` msg
            then do 
                let ro = extra2
                y <- liftIO $ truck $ tru ro
                let yzz = T.pack y 
                st <- readMVar state
                broadcast ("CZ#$42," `mappend` source2 `mappend` "," `mappend` sender2 `mappend` "," `mappend` yzz) st        

    else if "CW#$42" `T.isPrefixOf` msg
            then do 
                let ro = extra2
                y <- liftIO $ truck $ tru ro
                let zz = T.pack y 
                st <- readMVar state
                broadcast ("CW#$42," `mappend` source2 `mappend` "," `mappend` sender2 `mappend` "," `mappend` zz) st  

    else if "CB#$42" `T.isPrefixOf` msg
        then 
            do 
                st <- readMVar state 
                broadcast ("CB#$42" `mappend` T.concat (intersperse "<br>" (map tr st))) st 

    else if "CC#$42" `T.isPrefixOf` msg || "CE#$42" `T.isPrefixOf` msg || "CF#$42" `T.isPrefixOf` msg || 
        "CH#$42" `T.isPrefixOf` msg || "CJ#$42" `T.isPrefixOf` msg || "CK#$42" `T.isPrefixOf` msg || 
        "CO#$42" `T.isPrefixOf` msg || "CP#$42" `T.isPrefixOf` msg || "CQ#$42" `T.isPrefixOf` msg || 
        "CY#$42" `T.isPrefixOf` msg || "CR#$42" `T.isPrefixOf` msg
        then 
            do 
                st <- readMVar state 
                broadcast msg st

    else if "CG#$42" `T.isPrefixOf` msg
        then 
            mask_ $ do  
                old <- takeMVar state
                let new = upScore sender old
                putMVar state new 
                st2 <- readMVar state
                broadcast msg st2
                broadcast ("CB#$42" `mappend` T.concat (intersperse "<br>" (map tr st2))) st2 

    else if "CI#$42" `T.isPrefixOf` msg
        then 
            mask_ $ do  
                old <- takeMVar state
                let new = downScore sender old
                putMVar state new 
                st2 <- readMVar state
                broadcast msg st2
                broadcast ("CB#$42" `mappend` T.concat (intersperse "<br>" (map tr st2))) st2 

    else if "CL#$42" `T.isPrefixOf` msg
        then 
            mask_ $ do 
                old <- takeMVar state
                let new = downScore sender old
                putMVar state new 
                st2 <- readMVar state
                broadcast msg st2
                broadcast ("CB#$42" `mappend` T.concat (intersperse "<br>" (map tr st2))) st2 

    else if "CM#$42" `T.isPrefixOf` msg
        then 
            mask_ $ do  
                old <- takeMVar state
                let new = upScore sender old
                putMVar state new 
                st2 <- readMVar state
                broadcast msg st2
                broadcast ("CB#$42" `mappend` T.concat (intersperse "<br>" (map tr st2))) st2 

    else if "CN#$42" `T.isPrefixOf` msg
        then 
            mask_ $ do 
                old <- takeMVar state
                let new = downScore2 extra old
                putMVar state new 
                st2 <- readMVar state
                broadcast msg st2
                broadcast ("CB#$42" `mappend` T.concat (intersperse "<br>" (map tr st2))) st2 
    else 
        do 
            liftIO $ readMVar state >>= broadcast (user `mappend` ": " `mappend` msg) 
