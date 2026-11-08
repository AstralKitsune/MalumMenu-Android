import { ObsidianLayout, add, CENTER } from "frida-java-menu";

import { I18n } from "../../i18n/I18n";
import { UnityUtils } from "../../utils/UnityUtils";
import { ModuleManager } from "../../core/ModuleManager";
import { HostModule } from "../../modules/Host";

export class HostTab {
    static draw(layout: ObsidianLayout) {
        const host = layout.textView(I18n.t("menu.tabs.host"));
        host.gravity = CENTER;
        add(host);

        add(
            layout.button(
                I18n.t("menu.functions.force_start_game"),
                UnityUtils.run(() => ModuleManager.get(HostModule)?.forceStartGame())
            )
        );
    }
}
