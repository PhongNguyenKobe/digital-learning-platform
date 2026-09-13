#!/bin/sh
set -eu

# A stale/temporarily unavailable signature database must not prevent the API
# from starting; the processing worker records that scanner state as FAILED.
freshclam --stdout || echo "Warning: ClamAV signatures could not be refreshed."
npx prisma migrate deploy
exec node src/server.js
