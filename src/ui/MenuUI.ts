import Java from "frida-java-bridge";

import { add, CENTER, ObsidianLayout, waitForInit, Composer } from "frida-java-menu";

import { Constants } from "../data/Constants";
import { ObsidianConfig } from "../data/LayoutConfig";

import { I18n } from "../i18n/I18n";

import { Logger } from "../logger/Logger";

import { DebugTab } from "./tabs/DebugTab";
import { MovementTab } from "./tabs/MovementTab";
import { ESPTab } from "./tabs/ESPTab";
import { RolesTab } from "./tabs/RolesTab";
import { ShipTab } from "./tabs/ShipTab";
import { HostTab } from "./tabs/HostTab";
import { PassiveTab } from "./tabs/PassiveTab";
import { OtherTab } from "./tabs/OtherTab";

export class MenuUI {
    private static readonly tag = "MenuUI";

    static layout: ObsidianLayout;

    static init(): void {
        if (Java.available) {
            Java.perform(() => {
                waitForInit(MenuUI.build);
            });
            Logger.info(`[${this.tag}::init] Initialized`);
        }
    }

    private static build(): void {
        MenuUI.layout = new ObsidianLayout(ObsidianConfig);

        const title = I18n.t("menu.info.title");
        const desc = I18n.t("menu.info.desc", Constants.VERSION, Il2Cpp.application.version!);

        const composer = new Composer(title, desc, MenuUI.layout);
        composer.icon(Constants.MOD_MENU_ICON_URL, "Web");

        DebugTab.draw(MenuUI.layout);
        MovementTab.draw(MenuUI.layout);
        ESPTab.draw(MenuUI.layout);
        RolesTab.draw(MenuUI.layout);
        ShipTab.draw(MenuUI.layout);
        HostTab.draw(MenuUI.layout);
        PassiveTab.draw(MenuUI.layout);
        OtherTab.draw(MenuUI.layout);

        composer.show();
    }

    /** Adds center text in menu */
    static addCenterText(text: string): void {
        if (MenuUI.layout) {
            const textToAdd = MenuUI.layout.textView(text);
            textToAdd.gravity = CENTER;
            add(textToAdd);
        }
    }
}
