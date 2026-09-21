#!/usr/bin/env bash
# Jako ./start.sh, ale server navíc poslouchá na adrese Tailscale, aby se na něj dostal
# telefon. Bez spárování (QR kód v nabídce „Phone", nebo aplikace z mobile/) dovnitř nikdo nesmí.
set -euo pipefail
cd "$(dirname "$0")"
exec env AKADEMIE_REMOTE="${AKADEMIE_REMOTE:-tailscale}" ./start.sh
