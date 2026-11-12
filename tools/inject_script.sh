#!/usr/bin/expect -f

log_user 1
set timeout -1

spawn objection patchapk -c objection.cfg.json -s data/AmongUs.apk -l dist/agent.js -a arm64-v8a -V 17.26.2 --pause

expect {
    -re {(/tmp/[^\r\n]+\.apktemp)} {
        set tmpdir $expect_out(1,string)
        exp_continue
    }
    -re {Press ENTER to continue...} {
        exec python tools/patch_manifest.py $tmpdir >@stdout 2>@stderr
        send "\r"
        exp_continue
    }
    eof
}
