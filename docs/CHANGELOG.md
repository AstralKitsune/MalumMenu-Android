# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.1] - 2026-10-01

The released APK comes with game version `19.0.0` (`2026.9.29`).

### Changed

- Bump eslint from 10.7.0 to 10.11.0 by [@dependabot] ([#49])
- Bump @typescript-eslint/eslint-plugin from 8.63.0 to 8.70.1 by [@dependabot] ([#51])
- Bump @typescript-eslint/parser from 8.63.0 to 8.70.1 by [@dependabot] ([#53])
- Bump globals from 17.7.0 to 17.12.0 by [@dependabot] ([#54])

## [2.1.0] - 2026-09-28

The released APK comes with game version `18.0.0` (`2026.8.18`).

### Added

- Russian localization by [@repinek] ([#55])
- Keyboard Mode by [@repinek] ([#38])
- GitHub Actions CI workflow to build and upload the script and APK on every commit

### Changed

- Released APKs are now based on the itch.io original Among Us APK instead of split APKs from Google Play. 
  This means released APKs are roughly 200 MB smaller than before (800 MB instead of 1 GB)
- Complete My Tasks can now be spammed in Hide n Seek to quickly reduce the hiding time
- Bump frida from 17.17.0 to 17.18.0 by [@dependabot] ([#50])
- Bump frida-il2cpp-bridge from 0.13.2 to 0.14.0 by [@dependabot] ([#45])

### Fixed

- Make custom speed affect ghost speed too
- Properly check for Il2Cpp objects being null
- Ensure Complete My Tasks completes all tasks

## [2.0.0] - 2026-08-23

The released APK comes with game version `18.0.0` (`2026.8.18`).

### Added

- Use system accent color for UI elements
- Full Resolution
- Complete My Tasks
- Unlock Vents
- Open Sabotage Map

### Changed

- Bump TypeScript from 5.6.3 to 6.0.3
- Move UwUify Game from Other Tab to Passive Tab
- Bump frida from 17.16.4 to 17.17.0 by [@dependabot] ([#22])
- Bump frida from 17.16.3 to 17.16.4 by [@dependabot] ([#11])
- Bump frida from 17.15.5 to 17.16.3 by [@dependabot] ([#10])
- Bump frida from 17.15.4 to 17.15.5 by [@dependabot] ([#7])

### Fixed

- Ensure ghosts can see through walls when No Shadows is disabled (restore vanilla behavior)
- Black screen after one game by [@repinek] ([#6])

## [1.0.1] - 2026-07-10

The released APK comes with game version `17.4.0` (`2026.6.5`).

### Added

- Unlock Cosmetics
- PID and Unity Version in Debug Tab

## [1.0.0] - 2026-07-08

The released APK comes with game version `17.4.0` (`2026.6.5`).

Initial release

[@repinek]: https://github.com/repinek
[@dependabot]: https://github.com/dependabot

[#55]: https://github.com/AstralKitsune/MalumMenu-Android/pull/55
[#54]: https://github.com/AstralKitsune/MalumMenu-Android/pull/54
[#53]: https://github.com/AstralKitsune/MalumMenu-Android/pull/53
[#51]: https://github.com/AstralKitsune/MalumMenu-Android/pull/51
[#50]: https://github.com/AstralKitsune/MalumMenu-Android/pull/50
[#49]: https://github.com/AstralKitsune/MalumMenu-Android/pull/49
[#45]: https://github.com/AstralKitsune/MalumMenu-Android/pull/45
[#38]: https://github.com/AstralKitsune/MalumMenu-Android/pull/38
[#22]: https://github.com/AstralKitsune/MalumMenu-Android/pull/22
[#11]: https://github.com/AstralKitsune/MalumMenu-Android/pull/11
[#10]: https://github.com/AstralKitsune/MalumMenu-Android/pull/10
[#7]: https://github.com/AstralKitsune/MalumMenu-Android/pull/7
[#6]: https://github.com/AstralKitsune/MalumMenu-Android/pull/6

[unreleased]: https://github.com/AstralKitsune/MalumMenu-Android/compare/v2.1.1...HEAD
[2.1.1]: https://github.com/AstralKitsune/MalumMenu-Android/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/AstralKitsune/MalumMenu-Android/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/AstralKitsune/MalumMenu-Android/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/AstralKitsune/MalumMenu-Android/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/AstralKitsune/MalumMenu-Android/releases/tag/v1.0.0
