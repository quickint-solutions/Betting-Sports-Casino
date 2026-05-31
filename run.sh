#!/usr/bin/env bash
unset MallocNanoZone
unset MallocStackLogging
unset MallocStackLoggingNoCompact
exec npx grunt serve "$@"
