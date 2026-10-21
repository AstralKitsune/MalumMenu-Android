<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0.html">
    <img src="https://img.shields.io/badge/license-GPL-yellow.svg?style=plastic&logo=GNU&label=License" alt="GPL">
  </a>

  <a href="https://discord.gg/ue9x6TnMC3">
    <img src="https://img.shields.io/badge/Join%20Us%20on-Discord-blue?style=flat&logo=discord" alt="Discord">
  </a>

  <a href="https://github.com/AstralKitsune#%EF%B8%8F-support-me">
    <img src="https://img.shields.io/badge/Support%20me-Monero-FF6600?style=flat&logo=monero" alt="Monero">
  </a>

  <a href="https://github.com/AstralKitsune/MalumMenu-Android/releases">
    <img src="https://img.shields.io/github/downloads/AstralKitsune/MalumMenu-Android/total?style=flat&logo=github&label=Total%20Downloads&color=2ECC71" alt="Downloads">
  </a>

  <a href="https://github.com/AstralKitsune/MalumMenu-Android/releases/latest">
    <img src="https://img.shields.io/github/downloads/AstralKitsune/MalumMenu-Android/latest/total?style=flat&logo=github&label=Downloads@Latest&color=2ECC71" alt="Downloads">
  </a>
</p>

<p align="center">
  <b>An Among Us cheat menu for Android</b>
</p>

# 🎉 Features

<img src="https://github.com/user-attachments/assets/d0db15eb-daed-474e-a27b-2eb7b5395dd1" alt="Preview">

### Movement
- NoClip
- Speedhack

### ESP

- No Shadows

### Roles

- Complete My Tasks

### Ship

- Call Meeting
- Sabotage Reactor
- Open Sabotage Map
- Unlock Vents
- Kick all from Vents
- Walk in Vents

### Passive

- Unlock Cosmetics (Hats, Visors, Skins, Pets, Nameplates, Cosmicubes, Bundles)
- Full Resolution (The game runs at half resolution by default)
- UwUify Game
- Keyboard Mode

### Other

- Show Unity Logs

# 💾 Installation

Before you download anything, make sure your platform is supported:

- ✅ Any Android version where Among Us works (root not required)
- ❓ Custom / OEM ROMs (may or may not work)
- ❌ Emulators (`frida-java-bridge`, which is required for the menu, doesn't work on them)

Download and install the .apk from [releases](https://github.com/AstralKitsune/MalumMenu-Android/releases/latest).

Release notes can be found below each [release](../../releases) and in [CHANGELOG.md](/docs/CHANGELOG.md).

> [!WARNING]
> This mod relies on the unstable `frida-java-bridge`. Random crashes and inconsistent behavior may occur.

# ❓ FAQ

- **Q:** How do I know the menu is loaded?  
**A:** You will see a mod icon in the top left corner when you open Among Us.

- **Q:** The menu doesn't appear.  
**A:** Ensure you granted the "Display over other apps" permission. The game should ask for it on the first launch. If not, grant it manually.

- **Q:** Do I need to uninstall the original Among Us before using MalumMenu-Android?  
**A:** Currently yes, as MalumMenu-Android has the same package name, but this may change in the future. In the meantime, you can use an app like [AEE](https://github.com/apk-editor/APK-Explorer-Editor) or [ReVanced](https://github.com/revanced/revanced-manager) that allows you to change the package name.

# 👷‍♂️ Compiling

Requirements:

- Android SDK Build Tools (for objection)
- Python 3.10+ (for Frida & objection)
- Node.js
- Java Development Kit (for APKEditor and apktool)

## Basic Setup

### Create project & install dependencies

```sh
# Clone the repository
git clone https://github.com/AstralKitsune/MalumMenu-Android
cd MalumMenu-Android

# Create and activate a virtual environment (Not necessary, but considered good practice)
python -m venv .venv
source .venv/bin/activate

# Install Frida and objection
pip install -r requirements.txt

# Install node.js dependencies
npm install
```

### Get the original game APK

This can be done in multiple ways:

- `pip install gplaydl && gplaydl download com.innersloth.spacemafia -a arm64 -o data/split`
- Extract the APK from your phone. Many different apps can do this.
- Download the "Demo" APK from [here](https://innersloth.itch.io/among-us).

Save the APK as `data/AmongUs.apk`. If the APK you got is split into multiple APKs, you need to merge them into a single APK.
You can do this with [APKEditor](https://github.com/REAndroid/APKEditor/releases/latest):
`java -jar APKEditor.jar m -i data/split -o data/AmongUs.apk`

## Development workflow

The following commands compile the script into `./dist/agent.js`:

- `npm run build:release` - release version (minified, optimized)
- `npm run build:dev` - development version
- `npm run watch` - development version with watch mode (rebuilds automatically on file changes)

You should also periodically ensure code quality:

- `npm run lint` - runs [eslint](https://eslint.org/) to check for errors
- `npm run prettier` - runs [prettier](https://prettier.io/) to format code

### Script Mode

If you are not modifying the code, use this mode to build and install the APK with the script already embedded.

```sh
# Embed script into APK
objection patchapk -c objection.cfg.json -s data/AmongUs.apk -l dist/agent.js -a arm64-v8a -V 17.18.0 --pause

# In a new terminal session, patch the manifest to add overlay permission
# Replace TEMP_DIR with the path to the temp directory objection tells you.
python tools/patch_manifest.py TEMP_DIR
# Now go back to the previous terminal session and press Enter to tell objection to continue

# Connect your device via ADB, then install the APK on your device
# You can also manually copy the APK to your device and install it, but this is the fastest way
adb install -i com.android.vending data/AmongUs.objection.apk
```

Start the game. The first time you start it, it will ask for "Display over other apps" permission. You should now see the mod icon in the top left corner.

### Listen Mode

If you are modifying the code, use this mode so you don't have to rebuild and reinstall the APK on every change.

```sh
# Embed frida-gadget into APK
objection patchapk -s data/AmongUs.apk -a arm64-v8a -V 17.18.0 --pause

# In a new terminal session, patch the manifest to add overlay permission
# Replace TEMP_DIR with the path to the temp directory objection tells you.
python tools/patch_manifest.py TEMP_DIR
# Now go back to the previous terminal session and press Enter to tell objection to continue

# Connect your device via ADB, then install the APK on your device
# You can also manually copy the APK to your device and install it, but this is the fastest way
adb install -i com.android.vending data/AmongUs.objection.apk
```

- Start the game. The first time you start it, it will ask for "Display over other apps" permission. 
- Every time you start the game, it will immediately pause and wait until you manually spawn the script. (If you check `adb logcat`, something similar to `Frida: Listening on TCP port 27042` should be shown)
- `npm run spawn` - spawn script in gadget mode
- `npm run spawn:server` - spawn script using frida-server (app name needs to be "Among Us")
- You should now see the mod icon in the top left corner.

# 👨‍💻 Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md)

# 🙏 Credits

- [Frida](https://frida.re/) - dynamic instrumentation toolkit
- [frida-il2cpp-bridge](https://github.com/vfsfitvnm/frida-il2cpp-bridge/) - hijack any IL2CPP game at runtime
- [frida-java-menu](https://github.com/AstralKitsune/frida-java-menu) - create custom floating menus on Android
- [objection](https://github.com/sensepost/objection) - runtime mobile exploration toolkit (used to embed frida-gadget into APKs)
- [fallguys-frida-modmenu](https://github.com/repinek/fallguys-frida-modmenu) - main inspiration for this project, utils & modules & i18n logic
- [MalumMenu](https://github.com/scp222thj/MalumMenu) - Among Us cheat menu for PC
- [gplaydl](https://github.com/rehmatworks/gplaydl) - CLI Google Play Store APK downloader
- [AndroidUtilities](https://github.com/All-Of-Us-Mods/AndroidUtilities) - inspiration for Keyboard Mode

# ⚠️ Disclaimer

This mod is not affiliated with Among Us or Innersloth LLC, and the content contained therein is not endorsed or otherwise sponsored by Innersloth LLC. Portions of the materials contained herein are property of Innersloth LLC. © Innersloth LLC.

This mod is not intended to be used in any manner that interferes with Innersloth's services, Innersloth's operation of Among Us, the integrity or availability of the game, or the normal gameplay experience of other players. The creator does not endorse, encourage, or condone using this mod to disrupt games, negatively affect other users, bypass rules or protections, or gain an unfair advantage in any setting where such use is prohibited. Any misuse is solely the responsibility of the user.

Usage of this mod can violate the terms of service of Among Us, which may lead to punitive action including temporary or permanent bans from the game. The creator is not responsible for any consequences you may face due to usage. Use at your own risk.
