import { ObsidianLayout, add, CENTER } from "frida-java-menu";

import { I18n } from "../../i18n/I18n";
import { State } from "../../data/State";
import { ModuleManager } from "../../core/ModuleManager";
import { PlayerModule } from "../../modules/Player";
import { UnityUtils } from "../../utils/UnityUtils";

export class ESPTab {
    static draw(layout: ObsidianLayout) {
        const esp = layout.textView(I18n.t("menu.tabs.esp"));
        esp.gravity = CENTER;
        add(esp);

        add(
            layout.toggle(I18n.t("menu.functions.no_shadows"), (state: boolean) => {
                State.noShadows = state;
            })
        );

        add(
            layout.seekbar(
                I18n.t("menu.functions.zoom_val"),
                30,
                2,
                UnityUtils.run((value: number) => {
                    State.zoom = value;
                    ModuleManager.get(PlayerModule)?.changeZoom();
                })
            )
        );

        add(
            layout.toggle(
                I18n.t("menu.functions.custom_zoom"),
                UnityUtils.run((state: boolean) => {
                    State.customZoom = state;
                    ModuleManager.get(PlayerModule)?.changeZoom();
                })
            )
        );
    }
}
