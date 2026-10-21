# How to contribute to MalumMenu-Android

Thank you for investing your time in contributing to our project!

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

## New contributor guide

To get an overview of the project, read the [README](/README.md) file. Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/getting-started-with-git/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

## Getting started

Issues and Pull requests are the types of contributions we accept.

### 🐛 Issues

[Issues](https://docs.github.com/en/github/managing-your-work-on-github/about-issues) are used to track tasks that contributors can help with.

#### Create a new issue

If you've found something that should be updated, search open issues to see if someone else has reported the same thing. If it's something new, open an issue using a [template](https://github.com/AstralKitsune/MalumMenu-Android/issues/new/choose). We'll use the issue to have a conversation about the problem you want to fix.

#### Solve an issue

Scan through our [existing issues](https://github.com/AstralKitsune/MalumMenu-Android/issues) to find one that interests you. You can narrow down the search using `labels` as filters. As a general rule, we don’t assign issues to anyone. If you find an issue to work on, you are welcome to open a PR with a fix.

### 🛠️ Pull requests

A [pull request](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests) is a way to suggest changes in our repository.
You should always review your own pull request first, before marking it as ready for review by others. Make sure that you:
- Use and fill the pull request template.
- Check your changes for grammar and spelling.
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
- Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so the branch can be updated for a merge. Once you submit your PR, we may ask questions or request additional information.
- We may ask for changes to be made before a PR can be merged, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments. You can apply suggested (and any other) changes in your fork, then commit them to your branch.
- If there are any failing checks in your pull request, troubleshoot them until they're all passing.
- If you run into any merge issues, checkout this [git tutorial](https://github.com/skills/resolve-merge-conflicts) to help you resolve merge conflicts and other issues.

## Make changes

1. Fork the repository.
- Using GitHub Desktop:
    - [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop) will guide you through setting up Desktop.
    - Once Desktop is set up, you can use it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

- Using the command line:
    - [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

2. Create a working branch and start with your changes!
3. Commit the changes once you are happy with them.
4. When you're finished with the changes, create a pull request.

# Community translations

JSON translation files are located in the [`src/i18n/localization`](https://github.com/AstralKitsune/MalumMenu-Android/tree/main/src/i18n/localization) directory.
If you want to contribute a new translation, create a JSON file with the name of the language (e.g. `fr.json` for French) and add your translations in the same format as the existing files.

If you notice any mistakes or inconsistencies in the existing translations, feel free to open a pull request with your fixes.

> [!WARNING]
> Please do not use AI or tools like DeepL and Google Translate for translations.

# How this project uses Frida

[This post](https://pit.bearblog.dev/modding-and-distributing-mobile-apps-with-frida/) explains how Frida can be used to mod and distribute Android apps.
The process is pretty much the same, but it may be easier to understand than what I've written here.

## Frida Operation Modes

Source: https://frida.re/docs/gadget/

- **Injected**: frida-server runs directly on the Android device. It has access to all installed apps, running processes, etc.
  frida-server binary requires root privileges to attach to (ptrace) the target application in order to inject the Frida gadget library into the memory space of the process.
- **Embedded / gadget**: embed the frida-gadget shared library (libfrida-gadget.so) inside the target program. This embedding is done by patching the apk.  
  frida-gadget supports 4 interaction types:
    - listen (default interaction): gadget exposes a frida-server compatible interface, listening on localhost:27042 by default.
      The game will pause at launch, and you can connect to it by connecting your phone via USB to your PC, launching ADB, and launching Frida. 
      I'm using this when developing new features, simply because it's faster: The script can be modified and reloaded on the fly, instead of having to wait for building the APK again
    - connect: gadget will connect to a running frida-portal instead of listening on TCP
    - script: gadget autonomously runs a pre-specified script off the filesystem without any outside communication, immediately on game start
    - scriptDirectory: gadget can select one from multiple different scripts to run based on the program it's loaded in

The interactions can be customized with a configuration file.

Because injected mode requires root, it's not suitable for the common MalumMenu-Android user.

## Embedding frida-gadget

Let's talk about how we can actually embed frida-gadget into among us. The process can be broken down into 3 simple steps:

- Download the original game APK and extract it
- Embed frida-gadget
- Repackage the APK

These steps can be done manually (takes longer) or by using automated tools (faster and more reliable).

If you want to do the process manually, check out [this post](https://koz.io/using-frida-on-android-without-root/).

There's at least 3 different tools capable of patching an app to embed frida-gadget:

- [objection](https://github.com/sensepost/objection) ([Guide](https://github.com/sensepost/objection/wiki/Patching-Android-Applications))
- [fgi](https://github.com/commonuserlol/fgi)
- [frida-gadget](https://github.com/ksg97031/frida-gadget) (yes, the project name is confusing. also, this tool didn't work for me)

There may be other (and possibly better) tools available.

Under the hood, these tools make use of other, more specialized tools, for example:

- `apktool` or `APKEditor` to extract and rebuild APK files
- `jarsigner` or `apksigner` for signing the APKs so they can be installed on phones

Before repackaging the APK, the permission to display over other apps also needs to be added by modifying `AndroidManifest.xml` so MalumMenu-Android can display itself on top of the game.

(If we're using the listen interaction, we also need to add `android.permission.INTERNET` so frida-gadget can expose the interface for the PC to connect to. Among Us already has the INTERNET permission, so we actually don't have to do this.
In script mode, this wouldn't be needed anyway as the script works fully standalone without connecting to a frida-server)

Optionally, the package name can be changed so MalumMenu-Android can be installed alongside the original game. This is done by setting `package="com.AstralKitsune.MalumMenu"` in `AndroidManifest.xml`.

The app's display name can also be changed by setting `<string name="app_name">MalumMenu</string>` in `res/values/strings.xml`.

## Verifying the embedding process (advanced)

If you want to verify that the gadget was embedded, tell objection to wait before rebuilding the apk using the `--pause` flag, and navigate to the temporary directory objection tells you.

<img src="https://github.com/user-attachments/assets/b99ed20e-0c9b-4b3c-80f4-24d6e38a02b6" alt="objection console output">

Inside the `lib/arm64-v8a` directory you should see 3 files:

- `libfrida-gadget.config.so` - the configuration file Frida uses. This is not actually a shared library, but a simple JSON file (you can open it in a normal text editor)
- `libfrida-gadget.script.so` - the actual script Frida will load based on the configuration file. This is also not actually a shared object, but the compiled JavaScript file (dist/agent.js)
- `libfrida-gadget.so` - frida-gadget itself, which will do all the heavy lifting (should be around 25MB big). This is a valid shared object file

The files are named like this because they must start with `lib` and end with `.so`, otherwise the Android package manager won't copy them.

You can also inspect the MainActivity (`EosUnityPlayerActivity.smali`) to see the added smali code which will load frida-gadget on game launch:

```
# direct methods
.method static constructor <clinit>()V
    .locals 2

    const-string v0, "frida-gadget"

    invoke-static {v0}, Ljava/lang/System;->loadLibrary(Ljava/lang/String;)V
```

The loading process goes like this: Injected loadLibrary code in smali → loads frida-gadget itself → frida-gadget reads the config file → loads our script → waits for the script's init function to return → launches the game itself

If you are using a patcher that doesn't have the feature to wait before rebuilding, you can verify that frida-gadget was added to the APK by installing the APK on your device and opening the open-source [LibChecker](https://github.com/LibChecker/LibChecker) app. 
In the "Native libraries" tab you should see the above 3 files (the script.so and config.so will show "broken ELF", but that's expected since they're not supposed to be ELF files).

<img src="https://github.com/user-attachments/assets/dda3165a-453a-4721-9d39-ed98527dd717" alt="LibChecker showing the 3 frida-gadget files">

## Additional requirements

At this point we can already have our script loaded into the game, but we need some additional things to properly interface with the game and its logic:

- `frida-il2cpp-bridge` by vfsfitvnm to hook, modify, replace game methods at runtime.
- `frida-java-menu` by commonuserlol, forked and updated by me, to show a nice UI to the user. It uses the official frida-java-bridge.

That's it! Please refer to the source code for implementation details. The whole software stack, from Frida to MalumMenu itself, is open source.
