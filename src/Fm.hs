{-# LANGUAGE OverloadedStrings #-}
module Fm where
import Data.List
import System.Random
import qualified Data.Text as T

toDouble :: Int -> Double
toDouble x = (read (show x)) :: Double

rM :: Int -> IO Int
rM x = getStdRandom (System.Random.randomR ((1,x) :: (Int,Int)))

start :: Int -> Int -> Int -> Int -> IO [Int]
start ax bx cx dx = do 
    a <- rM ax
    b <- rM bx
    c <- rM cx
    d <- rM dx
    return [a,b,c,d,42]

rollFunc :: [String] -> T.Text
rollFunc [a,b,c,d,e] = T.pack (a ++ "," ++ b ++ "," ++ c ++ "," ++ d ++ "," ++ "42")
rollFunc _ = "Problem in rollFunc"


rollT :: Int -> Int -> Int -> Int -> IO T.Text
rollT ax bx cx dx = do 
    x <- start ax bx cx dx
    let y = (map show x)
    return $ rollFunc y

roll :: Int -> Int -> Int -> Int -> IO [Double]
roll ax bx cx dx = do 
    x <- start ax bx cx dx
    return $ map toDouble x

computation :: Double -> String -> Double -> Double
computation a b c  | b == "+"   = (+) a c
                   | b == "-"   = (-) a c
                   | b == "*"   = (*) a c
                   | b == "/"   = scoreDiv a c
                   | b == "Concatenate"  = cat a c

fRound :: Double -> Int
fRound x = round x

notWhole :: Double -> Bool
notWhole x = (toDouble (fRound x)) /= x

cat :: Double -> Double -> Double
cat l m   | m < 0  = 3.1
          | l == 0  = 3.1
          | notWhole l  = 3.1
          | notWhole m  = 3.1
          | otherwise  = read ((show $ fRound l) ++ (show $ fRound m)) :: Double

g :: (Double -> Double -> Double) -> String
g x         | x 3 2 == 5 = " + "
            | x 3 2 == 1 = " - "
            | x 3 2 == 6 = " * "
            | x 18 3 == 6 = " / "
            | x 5 5 == 55 = " concatenated left of "
            | otherwise = " cow "

f :: Double -> String
f x = show (fRound x)

scoreDiv :: (Eq a, Fractional a) => a -> a -> a
scoreDiv az bz  | bz == 0  = 99999
                | otherwise = (/) az bz

ops :: [Double -> Double -> Double]
ops =  [cat, (+), (-), (*), scoreDiv] 

calc :: Double -> Double -> Double -> Double -> [(String, String, String, String, String)]
calc a b c d = [(f a', g op1, f b', g op2, f c') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op2 (op1 a' b') c' == 20]

calc2 :: Double -> Double -> Double -> Double -> [(String, String, String, String, String)]
calc2 a b c d = [(f a', g op1, f b', g op2, f c') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op2 a' (op1 b' c') == 20]

calc3 :: Double -> Double -> Double -> Double -> [(String, String, String, String, String, String, String)]
calc3 a b c d = [(f a', g op1, f b', g op3, f c', g op2, f d') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op3 <- ops,
                            op3 (op1 a' b') (op2 c' d') == 20]

calc4 :: Double -> Double -> Double -> Double -> [(String, String, String, String, String, String, String)]
calc4 a b c d = [(f a', g op1, f b', g op3, f c', g op2, f d') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op3 <- ops,
                            op3 (op2 (op1 a' b') c') d' == 20]

calc5 :: Double
           -> Double
           -> Double
           -> Double
           -> [(String, String, String, String, String, String, String)]
calc5 a b c d = [(f a', g op1, f b', g op3, f c', g op2, f d') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op3 <- ops,
                            op3 (op2 c' (op1 a' b')) d' == 20]

calc6 :: Double
           -> Double
           -> Double
           -> Double
           -> [(String, String, String, String, String, String, String)]
calc6 a b c d = [(f a', g op1, f b', g op3, f c', g op2, f d') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op3 <- ops,
                            op3 d' (op2 (op1 a' b') c') == 20]

calc7 :: Double
           -> Double
           -> Double
           -> Double
           -> [(String, String, String, String, String, String, String)]
calc7 a b c d = [(f a', g op1, f b', g op3, f c', g op2, f d') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op3 <- ops,
                            op3 d' (op2 c' (op1 a' b')) == 20]

h :: (String, String, String, String, String) -> String
h (a',b',c',d',e') = "(" ++ a' ++ b' ++ c' ++ ")" ++ d' ++ e' ++ " = 20<br>  "

h2 :: (String, String, String, String, String) -> String
h2 (a',b',c',d',e') = a' ++ d' ++  "(" ++ c' ++ b' ++ e'++ ") = 20<br>  "

h3 :: (String, String, String, String, String, String, String) -> String
h3 (a',b',c',d',e',f',g') = "(" ++ a' ++ b' ++ c' ++ ")"  ++ d' ++ "(" ++ e' ++ f' ++
                            g' ++ ") = 20<br>  "

h4 :: (String, String, String, String, String, String, String) -> String
h4 (a',b',c',d',e',f',g') = "((" ++ a' ++ b' ++ c' ++ ")" ++
    f' ++ e' ++ ")" ++ d' ++ g' ++ ") = 20<br>  "

h5 :: (String, String, String, String, String, String, String) -> String
h5 (a',b',c',d',e',f',g') = "(" ++ e' ++ f' ++ "(" ++ a' ++
  b' ++ c' ++ "))" ++ d' ++ g' ++ ") = 20<br>  "

h6:: (String, String, String, String, String, String, String) -> String
h6 (a',b',c',d',e',f',g') = g' ++ d' ++ "((" ++ a' ++ b' ++
  c' ++ ")" ++ f' ++ e' ++ ") = 20<br>  "

h7 :: (String, String, String, String, String, String, String) -> String
h7 (a',b',c',d',e',f',g') = g' ++ d' ++ "(" ++ e' ++ f' ++
  "(" ++ a' ++ b' ++ c' ++ ")) = 20<br> "

pim ::  [(String, String, String, String, String, String, String)] -> [String]
pim x  | null x  = [" -- There are no solutions in this category"]
       | otherwise  = [" "]


pim' ::  [(String, String, String, String, String)] -> [String]
pim' x  | null x  = [" -- There are no solutions in this category"]
       | otherwise  = [" "]



ca :: [Double] -> [String]
ca [a, b, c, d, e] = ["Using the result from two numbers left of a third.<br>"] ++
    map h (calc a b c d) ++
    pim' (calc a b c d) ++ 
    ["<br><br>Using a number left of the result obtained from two other numbers.<br>"] ++ 
    map h2 (calc2 a b c d) ++ 
    pim' (calc2 a b c d) ++ 
    ["<br><br>Using two numbers and then the remaining two numbers - then using those results.<br>"] ++ 
    map h3 (calc3 a b c d) ++ 
    pim (calc3 a b c d) ++ 
    ["<br><br>Using the result from two numbers left of a third - then that result left of the remaining number.<br>"] ++ 
    map h4 (calc4 a b c d) ++ 
    pim (calc4 a b c d) ++ 
    ["<br><br>Using the third number left of the result obtained from the first two - then that result left of the fourth number.<br>"] ++ 
    map h5 (calc5 a b c d) ++ 
    pim (calc5 a b c d) ++ 
    ["<br><br>Using the the remaining number to the left of the result of using the result of two numbers' left of another.<br>"] ++ 
    map h6 (calc6 a b c d) ++ 
    pim (calc6 a b c d) ++ 
    ["<br><br>Using the remaining number to the left of the result from using the a number left of the result from two others.<br>"] ++ 
    map h7 (calc7 a b c d) ++ 
    pim (calc7 a b c d) 
ca _ = ["What?"]

cars :: [Double] -> [Char]
cars [a,b,c,d,e] = concat $ ca [a,b,c,d,e]
cars _ = []

tru :: T.Text -> [Double]
tru x = map read (map T.unpack (T.split (==',') x))

truck :: [Double] -> IO String
truck x = do 
    let y = map round x
    let z = show (y !! 0) ++ " " ++ show (y !! 1) ++ " " ++ show (y !! 2) ++ " " ++  show (y !! 3) ++ "<br><br>"
    let a = (" " ++ z ++ (cars x) ++ "<br>") :: String 
    return a

arg :: [Double]
arg = [1,1,1,1,42]

rText :: IO T.Text
rText = do 
    x <- roll 6 6 12 20 
    let y = map round x
    let z = map show y
    return $ rollFunc z

main :: IO ()
main = do 
    rText >>= print
    return ()




