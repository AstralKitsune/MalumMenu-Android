import { ObsidianLayout, add, CENTER } from "frida-java-menu";

import { I18n } from "../../i18n/I18n";
import { State } from "../../data/State";

export class ChatTab {
    static draw(layout: ObsidianLayout) {
        const chat = layout.textView(I18n.t("menu.tabs.chat"));
        chat.gravity = CENTER;
        add(chat);

        add(
            layout.toggle(I18n.t("menu.functions.enable_chat"), (state: boolean) => {
                State.enableChat = state;
            })
        );
    }
}
