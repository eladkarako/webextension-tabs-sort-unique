::@echo off
chcp 65001 1>nul 2>nul
goto MAIN

:METHOD
  setlocal
  set "NAME=%~1"
  mkdir "%NAME%\_locales\en_US"  1>nul 2>nul
  mkdir "%NAME%\icons"           1>nul 2>nul
  mkdir "%NAME%\modules"         1>nul 2>nul
  pushd "%NAME%"
  ::------------------------------------------------------------------------------
  copy /y "..\src\_locales\en_US\messages.json"  ".\_locales\en_US\messages.json"
  copy /y "..\src\icons\*"                       ".\icons\"
  copy /y "..\src\modules\*.js"                  ".\modules\"

  copy /y "..\src\manifest.%NAME%.json"          ".\manifest.json"
  copy /y "..\src\*.js"                          "."
  copy /y "..\src\*.css"                         "."

  copy /y "..\changelog.txt"                     "."
  copy /y "..\version.txt"                       "."
  copy /y "..\LICENSE"                           "."
  ::------------------------------------------------------------------------------
  set "ARGS="
  set  ARGS=%ARGS% a
  set  ARGS=%ARGS% -tzip
  set  ARGS=%ARGS% -x!"%NAME%.zip"
  set  ARGS=%ARGS% -y
  set  ARGS=%ARGS% -sse
  set  ARGS=%ARGS% -mmt4
  set  ARGS=%ARGS% -mx0
  set  ARGS=%ARGS% "-mm=Deflate"
  set  ARGS=%ARGS% "-mem=ZipCrypto"
  set  ARGS=%ARGS% "-sccUTF-8"
  set  ARGS=%ARGS% "-scsUTF-8"
  set  ARGS=%ARGS% "-sns-"
  set  ARGS=%ARGS% -ssp
  set  ARGS=%ARGS% -stl
  set  ARGS=%ARGS% -ssw
  set  ARGS=%ARGS% "%NAME%.zip"
  call "7z.exe" %ARGS% *
  set "EXIT_CODE=%ErrorLevel%"
  echo [INFO] EXIT_CODE:%EXIT_CODE% 1>&2
  ::------------------------------------------------------------------------------
  move /y "%NAME%.zip" ".\.."
  ::------------------------------------------------------------------------------
  popd
  endlocal
  goto :eof

:MAIN
  call :METHOD "chrome"
  call :METHOD "firefox"
  goto END

:END
  timeout /t 10 1>&2
