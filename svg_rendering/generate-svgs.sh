#!/bin/sh -x

stopprocs() {
  echo "stopping all the processes"
  kill $PID_CHROME $PID_FLUX $PID_XVFB
  trap - 1 2 3 15 
}

DISPLAY=:1000
export DISPLAY
trap stopprocs 1 2 3 15
echo Starting Xvfb ...
Xvfb $DISPLAY -screen 0 1920x1080x24 +extension RANDR &
PID_XVFB=$!
sleep 5
echo Starting fluxbox ...
fluxbox &
PID_FLUX=$!
sleep 5
echo Starting Chromium ...
tmpdir=`mktemp -d -t faust-svg-profile.XXXXXX`
chromium --user-data-dir=$tmpdir --remote-debugging-port=9222 --start-maximized &
PID_CHROME=$!
sleep 15
echo Starting conversion, this may take a while ...
node preprocessing.js

echo "Done."
stopprocs
