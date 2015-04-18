<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [This shows that there is no solution that only calc2, only calc6, or only calc7 can find. Next, I checkes all combinations of these three:](#this-shows-that-there-is-no-solution-that-only-calc2-only-calc6-or-only-calc7-can-find-next-i-checkes-all-combinations-of-these-three)
- [There are no rolls of the dice that can be found only by some pair of these functions, and (2,5,12,12) is the only roll that can be found by all three, but none of the other algorythms (calc, calc3, calc4, and calc5). Those four along with any one of calc2, calc6, or calc7, are sufficient to find at least one solution if a roll is solvable. A corrolary is that if calc, calc2, calc3, calc4, and calc5 can't find a solution, calc6 and calc7 won't either. I tested this by removing calc6 and calc7 from impossibles.hs and renaming it impossibles2.hs. Like impossibles.hs, it found the 104 impossible rolls, only in 1.33 instead of 1.50 seconds.](#there-are-no-rolls-of-the-dice-that-can-be-found-only-by-some-pair-of-these-functions-and-251212-is-the-only-roll-that-can-be-found-by-all-three-but-none-of-the-other-algorythms-calc-calc3-calc4-and-calc5-those-four-along-with-any-one-of-calc2-calc6-or-calc7-are-sufficient-to-find-at-least-one-solution-if-a-roll-is-solvable-a-corrolary-is-that-if-calc-calc2-calc3-calc4-and-calc5-cant-find-a-solution-calc6-and-calc7-wont-either-i-tested-this-by-removing-calc6-and-calc7-from-impossibleshs-and-renaming-it-impossibles2hs-like-impossibleshs-it-found-the-104-impossible-rolls-only-in-133-instead-of-150-seconds)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

**IMPOSSIBLES**

The essence of the Score calculation algorythm in the module Fm is contained in the "impossibles.hs" file. Fm has much formatting code, which is a distraction when evaluating the algorythm.

impossibles.hs computes all dice combinations which cannot be made into the number "20" in two or three stages. In 1.5 seconds, it finds all 104 such combinations using a list comprehension on the seven list comprehensions which cover all possible computations. The five operations are defined as follows:

```haskell
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
```

The seven algorythms necessary to perform every possible computation are:

```haskell
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
```

It is easy to see that there are seven ways to order two or three sequential computations on four numbers. They can be represented by 

```javascript
a bc
ab c
ab cd
(a bc)d
(ab c)d
a(b cd)
a(bc d)
```

Those are the combinations used in the seven calc functions. The list comprehension works on all permutations of the order of the four numbers in receives, so c ba is covered by a bc. Next, I wanted to find out if all seven algorythms are necessary to find at least one solution, so I wrote this:

```haskell
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
```

Here is what I got:

```javascript
e@e:~/b0$ ./analysis_A
"*****************************___only_calc"
[1.0,3.0,11.0,15.0]
[1.0,3.0,11.0,19.0]
[1.0,6.0,9.0,20.0]
[1.0,6.0,10.0,20.0]
[1.0,6.0,11.0,20.0]
[2.0,2.0,11.0,15.0]
[2.0,2.0,11.0,17.0]
[3.0,3.0,3.0,13.0]
[3.0,3.0,7.0,17.0]
[3.0,4.0,9.0,16.0]
[3.0,4.0,11.0,14.0]
[4.0,4.0,6.0,17.0]
[5.0,5.0,5.0,11.0]
[5.0,5.0,5.0,13.0]
[5.0,5.0,5.0,17.0]
" "
"*****************************___only_calc2"
" "
"*****************************___only_calc3"
[1.0,1.0,1.0,11.0]
[1.0,1.0,7.0,17.0]
[1.0,1.0,12.0,12.0]
[1.0,6.0,6.0,6.0]
[1.0,6.0,9.0,9.0]
[3.0,3.0,6.0,6.0]
[3.0,4.0,7.0,18.0]
[3.0,6.0,7.0,14.0]
[5.0,5.0,6.0,17.0]
[5.0,6.0,6.0,6.0]
" "
"*****************************___only_calc4"
[1.0,1.0,4.0,11.0]
[1.0,4.0,9.0,9.0]
[1.0,4.0,9.0,19.0]
[1.0,5.0,11.0,11.0]
[1.0,6.0,6.0,12.0]
[1.0,6.0,11.0,11.0]
[3.0,6.0,9.0,12.0]
[6.0,6.0,7.0,18.0]
[6.0,6.0,9.0,14.0]
" "
"*****************************___only_calc5"
[1.0,3.0,8.0,20.0]
[3.0,3.0,10.0,17.0]
[3.0,4.0,10.0,16.0]
" "
"*****************************___only_calc6"
" "
"*****************************___only_calc7"
8.27113
" "
```

# This shows that there is no solution that only calc2, only calc6, or only calc7 can find. Next, I checkes all combinations of these three:

```javascript
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

only_calc2_or_6 = [ [a, b, c, d] | a <- [1..6], b <- [1..6], c <- [1..12], d <- [1..20], 
                     a <= b, b <= c, c <= d,
                     null $ calc a b c d, not (null $ calc2 a b c d), null $ calc3 a b c d, 
                     null $ calc4 a b c d, null $ calc5 a b c d, not (null $ calc6 a b c d), 
                     null $ calc7 a b c d ]

only_calc2_or_7 = [ [a, b, c, d] | a <- [1..6], b <- [1..6], c <- [1..12], d <- [1..20], 
                     a <= b, b <= c, c <= d,
                     null $ calc a b c d, not (null $ calc2 a b c d), null $ calc3 a b c d, 
                     null $ calc4 a b c d, null $ calc5 a b c d, null $ calc6 a b c d, 
                     not (null $ calc7 a b c d) ]

only_calc6_or_7 = [ [a, b, c, d] | a <- [1..6], b <- [1..6], c <- [1..12], d <- [1..20], 
                     a <= b, b <= c, c <= d,
                     null $ calc a b c d, null $ calc2 a b c d, null $ calc3 a b c d, 
                     null $ calc4 a b c d, null $ calc5 a b c d, not (null $ calc6 a b c d), 
                     not (null $ calc7 a b c d )]


only_calc2_or_6_or_7 = [ [a, b, c, d] | a <- [1..6], b <- [1..6], c <- [1..12], d <- [1..20], 
                     a <= b, b <= c, c <= d,
                     null $ calc a b c d, not (null $ calc2 a b c d), null $ calc3 a b c d, 
                     null $ calc4 a b c d, null $ calc5 a b c d, not (null $ calc6 a b c d), 
                     not (null $ calc7 a b c d )]

main = do 
    print "*****************************___only_calc2_and_6"
    t1 <- getCPUTime
    mapM_ print only_calc2_or_6
    print " "

    print "*****************************___only_calc2_and_7"
    mapM_ print only_calc2_or_7
    print " "

    print "*****************************___only_calc6_and_7"
    mapM_ print only_calc6_or_7
    print " "

    print "*****************************___only_calc2_and_6_and_7"
    mapM_ print only_calc2_or_6_or_7
    t2 <- getCPUTime
    let t = fromIntegral (t2-t1) * 1e-12
    print t
```

And here is what I got:

```javascript
    e@e:~/b0$ ./analysis_B
"*****************************___only_calc2_and_6"
" "
"*****************************___only_calc2_and_7"
" "
"*****************************___only_calc6_and_7"
" "
"*****************************___only_calc2_and_6_and_7"
[2.0,5.0,12.0,12.0]
3.385727
```

# There are no rolls of the dice that can be found only by some pair of these functions, and (2,5,12,12) is the only roll that can be found by all three, but none of the other algorythms (calc, calc3, calc4, and calc5). Those four along with any one of calc2, calc6, or calc7, are sufficient to find at least one solution if a roll is solvable. A corrolary is that if calc, calc2, calc3, calc4, and calc5 can't find a solution, calc6 and calc7 won't either. I tested this by removing calc6 and calc7 from impossibles.hs and renaming it impossibles2.hs. Like impossibles.hs, it found the 104 impossible rolls, only in 1.33 instead of 1.50 seconds.
The module Fm uses the seven algorythms to find solutions to random rolls or numbers entered by Score players. It massages the output into a single line of Text with solutions separated by "<br>". The browsers receive the Text as a Javascript string which, when appended to a div, displays the solutions neatly in a column.
