#!/bin/bash

cd "$(dirname "$0")"

source ../.env

function run() {
    local log=$(mktemp -t 'chrome-remote_ws_url')
    "$CHROME_EXEC_PATH" --remote-debugging-port=$CHROME_REMOTE_DEBUGGING_PORT --no-first-run --no-default-browser-check > $log 2>&1 &
    while true; do
        if grep -q 'ws://' $log; then
            local ws_url=$(grep -o 'ws://[^"]*' $log)
            echo "listening on: $ws_url"
            echo $ws_url > ../features/steps/browser/chrome-socket-url
            break
        fi
        sleep 0.01
    done
}

run
