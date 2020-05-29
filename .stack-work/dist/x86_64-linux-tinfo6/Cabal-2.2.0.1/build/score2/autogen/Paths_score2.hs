{-# LANGUAGE CPP #-}
{-# LANGUAGE NoRebindableSyntax #-}
{-# OPTIONS_GHC -fno-warn-missing-import-lists #-}
module Paths_score2 (
    version,
    getBinDir, getLibDir, getDynLibDir, getDataDir, getLibexecDir,
    getDataFileName, getSysconfDir
  ) where

import qualified Control.Exception as Exception
import Data.Version (Version(..))
import System.Environment (getEnv)
import Prelude

#if defined(VERSION_base)

#if MIN_VERSION_base(4,0,0)
catchIO :: IO a -> (Exception.IOException -> IO a) -> IO a
#else
catchIO :: IO a -> (Exception.Exception -> IO a) -> IO a
#endif

#else
catchIO :: IO a -> (Exception.IOException -> IO a) -> IO a
#endif
catchIO = Exception.catch

version :: Version
version = Version [0,1,0,0] []
bindir, libdir, dynlibdir, datadir, libexecdir, sysconfdir :: FilePath

bindir     = "/home/z/score2/.stack-work/install/x86_64-linux-tinfo6/9e385e3143b55f45cec39a3c7c3ab7365c835099f9ff7d5a4c87e1c7a2690a57/8.4.4/bin"
libdir     = "/home/z/score2/.stack-work/install/x86_64-linux-tinfo6/9e385e3143b55f45cec39a3c7c3ab7365c835099f9ff7d5a4c87e1c7a2690a57/8.4.4/lib/x86_64-linux-ghc-8.4.4/score2-0.1.0.0-GQwKMlqrDYrG713J4X1E34-score2"
dynlibdir  = "/home/z/score2/.stack-work/install/x86_64-linux-tinfo6/9e385e3143b55f45cec39a3c7c3ab7365c835099f9ff7d5a4c87e1c7a2690a57/8.4.4/lib/x86_64-linux-ghc-8.4.4"
datadir    = "/home/z/score2/.stack-work/install/x86_64-linux-tinfo6/9e385e3143b55f45cec39a3c7c3ab7365c835099f9ff7d5a4c87e1c7a2690a57/8.4.4/share/x86_64-linux-ghc-8.4.4/score2-0.1.0.0"
libexecdir = "/home/z/score2/.stack-work/install/x86_64-linux-tinfo6/9e385e3143b55f45cec39a3c7c3ab7365c835099f9ff7d5a4c87e1c7a2690a57/8.4.4/libexec/x86_64-linux-ghc-8.4.4/score2-0.1.0.0"
sysconfdir = "/home/z/score2/.stack-work/install/x86_64-linux-tinfo6/9e385e3143b55f45cec39a3c7c3ab7365c835099f9ff7d5a4c87e1c7a2690a57/8.4.4/etc"

getBinDir, getLibDir, getDynLibDir, getDataDir, getLibexecDir, getSysconfDir :: IO FilePath
getBinDir = catchIO (getEnv "score2_bindir") (\_ -> return bindir)
getLibDir = catchIO (getEnv "score2_libdir") (\_ -> return libdir)
getDynLibDir = catchIO (getEnv "score2_dynlibdir") (\_ -> return dynlibdir)
getDataDir = catchIO (getEnv "score2_datadir") (\_ -> return datadir)
getLibexecDir = catchIO (getEnv "score2_libexecdir") (\_ -> return libexecdir)
getSysconfDir = catchIO (getEnv "score2_sysconfdir") (\_ -> return sysconfdir)

getDataFileName :: FilePath -> IO FilePath
getDataFileName name = do
  dir <- getDataDir
  return (dir ++ "/" ++ name)
