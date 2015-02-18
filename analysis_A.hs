{-# LANGUAGE OverloadedStrings #-}

import Data.List
import System.CPUTime

notWhole :: Double -> Bool
notWhole x = fromIntegral (round x) /= x

cat :: Double -> Double -> Double
cat l m   | m < 0  = 3.1
          | l == 0  = 3.1
          | notWhole l  = 3.1
          | notWhole m  = 3.1
          | otherwise  = read (show (round l) ++ show (round m))

f :: Double -> String
f x = show (round x)

scoreDiv :: (Eq a, Fractional a) => a -> a -> a
scoreDiv az bz  | bz == 0  = 99999
                | otherwise = (/) az bz

ops =  [cat, (+), (-), (*), scoreDiv] 

calc :: Double -> Double -> Double -> Double -> [(Double, Double, Double, Double)]
calc a b c d = [ (a',b',c',d') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op2 (op1 a' b') c' == 20]

calc2 :: Double -> Double -> Double -> Double -> [(Double, Double, Double, Double)]
calc2 a b c d = [ (a',b',c',d') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op2 a' (op1 b' c') == 20]

calc3 :: Double -> Double -> Double -> Double -> [(Double, Double, Double, Double)]
calc3 a b c d = [ (a',b',c',d') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op3 <- ops,
                            op3 (op1 a' b') (op2 c' d') == 20]

calc4 :: Double -> Double -> Double -> Double -> [(Double, Double, Double, Double)]
calc4 a b c d = [ (a',b',c',d')  |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op3 <- ops,
                            op3 (op2 (op1 a' b') c') d' == 20]

calc5 a b c d = [ (a',b',c',d') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op3 <- ops,
                            op3 (op2 a' (op1 b' c')) d' == 20]

calc6 a b c d = [ (a',b',c',d') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op3 <- ops,
                            op3 a' (op2 (op1 b' c') d') == 20]

calc7 a b c d = [ (a',b',c',d') |
                        [a',b',c',d'] <- nub(permutations [a,b,c,d]),
                            op1 <- ops,
                            op2 <- ops,
                            op3 <- ops,
                            op3 a' (op2 b' (op1 c' d')) == 20]



only_calc = [ [a, b, c, d] | a <- [1..6], b <- [1..6], c <- [1..12], d <- [1..20], 
                     a <= b, b <= c, c <= d,
                     not (null $ calc a b c d), null $ calc2 a b c d, null $ calc3 a b c d, 
                     null $ calc4 a b c d, null $ calc5 a b c d, null $ calc6 a b c d, 
                     null $ calc7 a b c d ]


only_calc2 = [ [a, b, c, d] | a <- [1..6], b <- [1..6], c <- [1..12], d <- [1..20], 
                     a <= b, b <= c, c <= d,
                     null $ calc a b c d, not (null $ calc2 a b c d), null $ calc3 a b c d, 
                     null $ calc4 a b c d, null $ calc5 a b c d, null $ calc6 a b c d, 
                     null $ calc7 a b c d ]

only_calc3 = [ [a, b, c, d] | a <- [1..6], b <- [1..6], c <- [1..12], d <- [1..20], 
                     a <= b, b <= c, c <= d,
                     null $ calc a b c d, null $ calc2 a b c d, not (null $ calc3 a b c d), 
                     null $ calc4 a b c d, null $ calc5 a b c d, null $ calc6 a b c d, 
                     null $ calc7 a b c d ]

only_calc4 = [ [a, b, c, d] | a <- [1..6], b <- [1..6], c <- [1..12], d <- [1..20], 
                     a <= b, b <= c, c <= d,
                     null $ calc a b c d, null $ calc2 a b c d, null $ calc3 a b c d, 
                     not (null $ calc4 a b c d), null $ calc5 a b c d, null $ calc6 a b c d, 
                     null $ calc7 a b c d ]

only_calc5 = [ [a, b, c, d] | a <- [1..6], b <- [1..6], c <- [1..12], d <- [1..20], 
                     a <= b, b <= c, c <= d,
                     null $ calc a b c d, null $ calc2 a b c d, null $ calc3 a b c d, 
                     null $ calc4 a b c d, not (null $ calc5 a b c d), null $ calc6 a b c d, 
                     null $ calc7 a b c d ]

only_calc6 = [ [a, b, c, d] | a <- [1..6], b <- [1..6], c <- [1..12], d <- [1..20], 
                     a <= b, b <= c, c <= d,
                     null $ calc a b c d, null $ calc2 a b c d, null $ calc3 a b c d, 
                     null $ calc4 a b c d, null $ calc5 a b c d, not (null $ calc6 a b c d),
                     null $ calc7 a b c d ]

only_calc7 = [ [a, b, c, d] | a <- [1..6], b <- [1..6], c <- [1..12], d <- [1..20], 
                     a <= b, b <= c, c <= d,
                     null $ calc a b c d, null $ calc2 a b c d, null $ calc3 a b c d, 
                     null $ calc4 a b c d, null $ calc5 a b c d, null $ calc6 a b c d, 
                     not (null $ calc7 a b c d )]

main = do 
    print "*****************************___only_calc"
    t1 <- getCPUTime
    mapM_ print only_calc
    print " "

    print "*****************************___only_calc2"
    mapM_ print only_calc2
    print " "

    print "*****************************___only_calc3"
    mapM_ print only_calc3
    print " "

    print "*****************************___only_calc4"
    mapM_ print only_calc4
    print " "

    print "*****************************___only_calc5"
    mapM_ print only_calc5
    print " "

    print "*****************************___only_calc6"
    mapM_ print only_calc6
    print " "

    print "*****************************___only_calc7"
    mapM_ print only_calc7
    t2 <- getCPUTime
    let t = fromIntegral (t2-t1) * 1e-12
    print t
    print " "













    