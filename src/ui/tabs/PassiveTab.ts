import { add, CENTER, ObsidianLayout } from "frida-java-menu";

import { I18n } from "../../i18n/I18n";
import { State } from "../../data/State";
import { UwUifyModule } from "../../modules/UwUify";
import { UnityUtils } from "../../utils/UnityUtils";
import { ModuleManager } from "../../core/ModuleManager";
import { PassiveModule } from "../../modules/Passive";
import { GoogleServicesModule } from "../../modules/GoogleServices";

export class PassiveTab {
    static draw(layout: ObsidianLayout) {
        const passive = layout.textView(I18n.t("menu.tabs.passive"));
        passive.gravity = CENTER;
        add(passive);

        add(
            layout.toggle(I18n.t("menu.functions.unlock_cosmetics"), (state: boolean) => {
                State.unlockCosmetics = state;
            })
        );

        add(
            layout.toggle(
                I18n.t("menu.functions.full_resolution"),
                UnityUtils.run((state: boolean) => {
                    ModuleManager.get(PassiveModule)?.toggleFullResolution(state);
                })
            )
        );

        add(
            layout.toggle(I18n.t("menu.functions.disable_analytics"), (state: boolean) => {
                State.disableAnalytics = state;
            })
        );

        add(
            layout.toggle(I18n.t("menu.functions.disable_google_services"), (state: boolean) => {
                State.disableGoogleServices = state;
                ModuleManager.get(GoogleServicesModule)?.toggleGoogleServices(state);
            })
        );

        add(
            layout.toggle(
                I18n.t("menu.functions.uwuify"),
                UnityUtils.run((state: boolean) => {
                    State.uwuifyMode = state;
                    ModuleManager.get(UwUifyModule)?.toggleUwUify(state);
                })
            )
        );

        add(
            layout.toggle(I18n.t("menu.functions.keyboard_mode"), (state: boolean) => {
                State.keyboardMode = state;
            })
        );
        add(layout.textView(I18n.t("menu.functions.keyboard_mode_note")));
    }
}
