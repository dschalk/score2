{-# LANGUAGE OverloadedStrings #-}
import Network.Wai
import Network.HTTP.Types
import Network.Wai.Handler.Warp (run)

app :: Application
app request respond = respond $ case rawPathInfo request of
    "/"      -> index 
    "/file2" -> file2
    _        -> notFound

index :: Response
index = responseFile
    status200
    [("Content-Type", "text/html")]
    "index.html"
    Nothing
    
file2 :: Response
file2 = responseFile
    status200
    [("Content-Type", "text/html")]
    "file2.html"
    Nothing

notFound :: Response
notFound = responseLBS
    status404
    [("Content-Type", "text/plain")]
    "404 - Not Found"

main :: IO ()
main = do
    putStrLn $ "http://localhost:3000/"
    run 3000 app
