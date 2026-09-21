#!/usr/bin/env bash
# Sestaví Android aplikaci bez Gradle: aapt2 → javac → d8 → zipalign → apksigner.
# Adresa serveru i s párovacím tokenem se zapéká do APK — soubor proto nikomu neposílej.
set -euo pipefail
cd "$(dirname "$0")"

SDK="${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}"
BT="$SDK/build-tools/${BUILD_TOOLS:-37.0.0}"
ANDROID_JAR="$SDK/platforms/android-34/android.jar"
PORT="${PORT:-4300}"
TOKEN_FILE="../data/remote-token.txt"

ADDRESS="${AKADEMIE_REMOTE:-tailscale}"
if [ "$ADDRESS" = "tailscale" ]; then ADDRESS="$(tailscale ip -4 | head -1)"; fi
if [ ! -s "$TOKEN_FILE" ]; then
  echo "Chybí $TOKEN_FILE — spusť nejdřív jednou ../start-telefon.sh, token se vytvoří sám." >&2
  exit 1
fi

rm -rf build && mkdir -p build/compiled build/gen build/classes

cat > res/values/strings.xml <<XML
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Kovárna</string>
    <string name="server_url">http://${ADDRESS}:${PORT}/?token=$(tr -d '\n' < "$TOKEN_FILE")</string>
</resources>
XML

if [ ! -f debug.ks ]; then
  keytool -genkeypair -keystore debug.ks -storepass android -keypass android -alias kovarna \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Kovarna" >/dev/null 2>&1
fi

"$BT/aapt2" compile --dir res -o build/compiled/res.zip
"$BT/aapt2" link -o build/base.apk -I "$ANDROID_JAR" --manifest AndroidManifest.xml \
  -R build/compiled/res.zip --java build/gen --min-sdk-version 28 --target-sdk-version 34 --auto-add-overlay
javac -d build/classes -classpath "$ANDROID_JAR" -source 17 -target 17 -Xlint:-options \
  $(find src build/gen -name '*.java')
"$BT/d8" --lib "$ANDROID_JAR" --output build $(find build/classes -name '*.class')
cp build/base.apk build/unaligned.apk
( cd build && zip -q unaligned.apk classes.dex )
"$BT/zipalign" -f 4 build/unaligned.apk build/kovarna.apk
"$BT/apksigner" sign --ks debug.ks --ks-pass pass:android --key-pass pass:android --ks-key-alias kovarna build/kovarna.apk

echo "Hotovo: mobile/build/kovarna.apk (server http://${ADDRESS}:${PORT})"
echo "Instalace: adb install -r mobile/build/kovarna.apk"
