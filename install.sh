#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_JSON="$SCRIPT_DIR/package.json"

if [ ! -f "$PACKAGE_JSON" ]; then
    echo "Error: package.json not found at $PACKAGE_JSON"
    exit 1
fi

if ! command -v jq &>/dev/null; then
    echo "Error: jq is required but not installed"
    exit 1
fi

PRODUCT_NAME=$(jq -r '.build.productName' "$PACKAGE_JSON")

if [[ "$OSTYPE" == "darwin"* ]]; then
    APP_BUNDLE="$PRODUCT_NAME.app"
    SOURCE_PATH="$SCRIPT_DIR/dist/mac/$APP_BUNDLE"
    DEST_PATH="$HOME/Applications/$APP_BUNDLE"

    if [ ! -d "$SOURCE_PATH" ]; then
        echo "Error: App bundle not found at $SOURCE_PATH"
        echo "Please build the application first."
        exit 1
    fi

    if [ -d "$DEST_PATH" ]; then
        echo "Updating existing app bundle at $DEST_PATH"
        rsync -a --delete "$SOURCE_PATH/" "$DEST_PATH/"
    else
        echo "Installing app bundle to $DEST_PATH"
        cp -r "$SOURCE_PATH" "$DEST_PATH"
    fi

    echo "Installation complete: $DEST_PATH"
    exit 0
fi

if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "Error: This script only supports macOS and Linux"
    exit 1
fi

APPIMAGE_NAME=$(jq -r '.build.linux.artifactName' "$PACKAGE_JSON")
ICON_RELATIVE=$(jq -r '.build.linux.icon' "$PACKAGE_JSON")
DESCRIPTION=$(jq -r '.description' "$PACKAGE_JSON")
APP_NAME=$(jq -r '.name' "$PACKAGE_JSON")

APPIMAGE_PATH="$SCRIPT_DIR/dist/$APPIMAGE_NAME"
ICON_PATH="$SCRIPT_DIR/$ICON_RELATIVE"
DESKTOP_FILE="$HOME/.local/share/applications/$APP_NAME.desktop"

if [ ! -f "$APPIMAGE_PATH" ]; then
    echo "Error: AppImage not found at $APPIMAGE_PATH"
    echo "Please build the application first."
    exit 1
fi

if [ ! -f "$ICON_PATH" ]; then
    echo "Error: Icon not found at $ICON_PATH"
    exit 1
fi

mkdir -p "$(dirname "$DESKTOP_FILE")"

cat >"$DESKTOP_FILE" <<EOF
[Desktop Entry]
Name=$PRODUCT_NAME
Comment=$DESCRIPTION
Exec=$APPIMAGE_PATH
Icon=$ICON_PATH
Terminal=false
Type=Application
Categories=Education;Office;
StartupWMClass=$APP_NAME
EOF

chmod +x "$DESKTOP_FILE"

echo "Desktop launcher created at: $DESKTOP_FILE"
echo "The application should now appear in your application menu."
