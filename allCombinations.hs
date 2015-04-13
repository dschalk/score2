{-# LANGUAGE OverloadedStrings #-}

import Data.List
import System.CPUTime


allsolutions = [ [a, b, c, d] | a <- [1..6], b <- [1..6], c <- [1..12], d <- [1..20], 
                     a <= b, b <= c, c <= d ]

                    

main = do 
    t1 <- getCPUTime
    print $ length allsolutions 
    t2 <- getCPUTime
    let t = fromIntegral (t2-t1) * 1e-12
    print t 
    print $ "Percent impossibles " ++ show (104 / 2359)
    return ()

    