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
import Data.List (intersperse, map, filter)
import Control.Exception.Base (mask_)
import Data.List.Split (splitOn)
import System.Environment (getEnv)

go :: Text
go = T.pack "GO"

type Name = Text
type Score = Int
type Group = Text
type Client = (Name, Score, Group, WS.Connection)
type ServerState = [Client]

fw :: [String] -> Text
fw x = case x of
    [_,b,_] -> T.pack b
    [_,b,_,_] -> T.pack b
    [_,b,_,_,_,_,_,_] -> T.pack b
    [_,b,_,_,_,_,_] -> T.pack b
    _ -> T.pack "fw malfunctioned"

fx :: [String] -> Text
fx x = case x of
    [_,_,c] -> T.pack c
    [_,_,c,_] -> T.pack c
    [_,_,c,_,_,_,_,_] -> T.pack c
    [_,_,c,_,_,_,_] -> T.pack c
    _ -> T.pack "fx malfunctioned"

fy :: [String] -> Text
fy x = case x of
    [_,_,_,d] -> T.pack d
    [_,_,_,d,_,_,_,_] -> T.pack d
    [_,_,_,d,_,_,_] -> T.pack d
    _ -> T.pack "fy malfunctioned"

froll :: [String] -> [Double]
froll [_,_,_,a,b,c,d,e] = map read [a, b, c, d, e]
froll _ = [1.0,2.0,3.0,4.0]

fw3 :: [String] -> Text
fw3 [_,b,_,_,_,_,_,_] = T.pack b
fw3 _ = T.pack "EE#$42"

fx3 :: [String] -> Text
fx3 [_,_,c,_,_,_,_,_] = T.pack c
fx3 _ = T.pack "EE#$42"

get4 :: [String] -> [Int]
get4 [_,_,_,a,b,c,d] = fmap read [a,b,c,d]
get4 _ = [-1,-1,-1,-1]

get4Group :: [String] -> Text
get4Group [_,b,_,_,_,_,_] = T.pack b
get4Group _ = "get4Group error"

get4Player :: [String] -> Text
get4Player [_,_,c,_,_,_,_] = T.pack c
get4Player _ = "get4Player error"

getName :: Client -> Name
getName (a,_,_,_) = a

getScore :: Client -> Score
getScore (_,b,_,_) = b

getGroup :: Client -> Text
getGroup (_,_,c,_) = c

filterGroup :: Text -> ServerState -> [Text]
filterGroup group s = [ a `mappend` " _ " `mappend` T.pack (show b)
    `mappend` " _ " `mappend` c | (a,b,c,d) <- s, group == c]

tr :: Client -> Text
tr x = getName x `mappend` T.pack " _ " `mappend` T.pack (show (getScore x))
    `mappend` T.pack " _ " `mappend` getGroup x

newGroup :: Text -> Text -> Client -> Client
newGroup name group (a, b, c, d)   | name == a  = (a, b, group, d)
                                   | otherwise = (a, b, c, d)

changeGroup :: Text -> Text -> ServerState -> ServerState
changeGroup name group = map (newGroup name group)

filterClient :: Name -> Client -> Bool
filterClient name (a,b,c,d) = name == a

incFunc :: Text -> Client -> Client
incFunc x (a, b, c, d)   | x == a   = (a, b + 1, c, d)
                         | otherwise = (a, b, c, d)

decFunc :: Text -> Client -> Client
decFunc x (a, b, c, d)   | x == a   = (a, b - 1, c, d)
                         | otherwise = (a, b, c, d)

decFunc2 :: Text -> Client -> Client
decFunc2 x (a, b, c, d)   | x == a   = (a, b - 2, c, d)
                          | otherwise = (a, b, c, d)

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

tint :: Text -> Int
tint x = read $ T.unpack x

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
    forM_ clients $ \(_ , _, _, conn) -> WS.sendTextData conn message

main :: IO ()
main = do
    por <- getEnv "PORT"
    let port = read por
    state <- newMVar newServerState
    Warp.runSettings Warp.defaultSettings
      { Warp.settingsTimeout = 36000,
        Warp.settingsPort = port
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
                    broadcast (getName client `mappend` " joined") s'
                    return s'
                talk conn state client
         where
                prefix     = "CC#$42"
                client     = (T.drop (T.length prefix) msg, 0, T.pack "private", conn)
                disconnect = do
                  s <- modifyMVar state $ \s ->
                     let s' = removeClient client s in return (s', s')
                  broadcast (getName client `mappend` " disconnected") s
talk :: WS.Connection -> MVar ServerState -> Client -> IO ()
talk conn state (user, _, _, _) = forever $ do
    msg <- WS.receiveData conn
    let msgArray = splitOn "," (T.unpack msg)

    let group = fw msgArray
    let sender = fx msgArray
    let extra = fy msgArray

    let group3 = fw3 msgArray
    let sender3 = fx3 msgArray

    let range = get4 msgArray  -- 7 items in msgArray
    let player4 = get4Player msgArray
    let group4 = get4Group msgArray

    print "****************************msgArray next: "
    mapM_ print msgArray
    mapM_ print $ froll msgArray
    print "****************************That was msgArray"
    if "CA#$42" `T.isPrefixOf` msg
        then
            do
                st <- readMVar state
                z <- rText range
                broadcast ("CA#$42," `mappend` group4 `mappend` ","
                    `mappend` player4 `mappend` "," `mappend` z) st

    else if "CZ#$42" `T.isPrefixOf` msg
            then do
                print msgArray
                y <- liftIO $ truck $ froll msgArray
                print y
                let yzz = T.pack y
                st <- readMVar state
                broadcast ("CZ#$42," `mappend` group3 `mappend` ","
                    `mappend` sender3 `mappend` "," `mappend` yzz) st

    else if "CW#$42" `T.isPrefixOf` msg
            then do
                y <- liftIO $ truck $ froll msgArray
                let zz = T.pack y
                st <- readMVar state
                broadcast ("CW#$42," `mappend` group3 `mappend` ","
                    `mappend` sender3 `mappend` "," `mappend` zz) st

    else if "CC#$42" `T.isPrefixOf` msg || "CE#$42" `T.isPrefixOf` msg || "CF#$42" `T.isPrefixOf` msg ||
        "CH#$42" `T.isPrefixOf` msg || "CJ#$42" `T.isPrefixOf` msg || "CK#$42" `T.isPrefixOf` msg ||
        "CP#$42" `T.isPrefixOf` msg || "CQ#$42" `T.isPrefixOf` msg || "CS#$42" `T.isPrefixOf` msg ||
        "CY#$42" `T.isPrefixOf` msg || "CR#$42" `T.isPrefixOf` msg || "CD#$42" `T.isPrefixOf` msg
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
                broadcast msg new
                broadcast ("CB#$42," `mappend` group `mappend` ","
                    `mappend` sender `mappend` "," `mappend` T.concat (intersperse "<br>" (filterGroup group new))) new

    else if "CI#$42" `T.isPrefixOf` msg
        then
            mask_ $ do
                old <- takeMVar state
                let new = downScore sender old
                putMVar state new
                broadcast msg new
                broadcast ("CB#$42," `mappend` group `mappend` ","
                    `mappend` sender `mappend` "," `mappend` T.concat (intersperse "<br>" (filterGroup group new))) new

    else if "CL#$42" `T.isPrefixOf` msg
        then
            mask_ $ do
                old <- takeMVar state
                let new = downScore sender old
                putMVar state new
                broadcast msg new
                broadcast ("CB#$42," `mappend` group `mappend` ","
                    `mappend` sender `mappend` "," `mappend` T.concat (intersperse "<br>" (filterGroup group new))) new

    else if "CM#$42" `T.isPrefixOf` msg
        then
            mask_ $ do
                old <- takeMVar state
                let new = upScore sender old
                putMVar state new
                st2 <- readMVar state
                broadcast msg st2
                broadcast ("CB#$42," `mappend` group `mappend` ","
                    `mappend` sender `mappend` "," `mappend` T.concat (intersperse "<br>" (filterGroup group st2))) st2

    else if "CN#$42" `T.isPrefixOf` msg
        then
            mask_ $ do
                old <- takeMVar state
                let new = downScore2 extra old
                putMVar state new
                broadcast msg new
                broadcast ("CB#$42," `mappend` group `mappend` ","
                    `mappend` sender `mappend` "," `mappend` T.concat (intersperse "<br>" (filterGroup group new))) new

    else if "CO#$42" `T.isPrefixOf` msg
        then
            mask_ $ do
                old <- takeMVar state
                let new = changeGroup sender group old
                putMVar state new
                broadcast msg new
                broadcast ("CB#$42," `mappend` group `mappend` ","
                    `mappend` sender `mappend` "," `mappend` T.concat (intersperse "<br>" (filterGroup group new))) new
                broadcast ("CO#$42," `mappend` group `mappend` ","
                    `mappend` sender `mappend` "," `mappend` extra) new

    else
            mask_ $ do
                st <- readMVar state
                broadcast ("CU#$42," `mappend` group `mappend` ","
                    `mappend` sender `mappend` "," `mappend` extra) st
