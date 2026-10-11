import { BaseModule } from "./BaseModule";

import { GoogleServicesModule } from "../modules/GoogleServices";
import { KeyboardModule } from "../modules/Keyboard";
import { PassiveModule } from "../modules/Passive";
import { PlayerModule } from "../modules/Player";
import { ShipModule } from "../modules/Ship";
import { UwUifyModule } from "../modules/UwUify";

import { Logger } from "../logger/Logger";

export class ModuleManager {
    public readonly name = "ModuleManager";

    // prettier-ignore
    private static modules: BaseModule[] = [
        new GoogleServicesModule(),
        new KeyboardModule(),
        new PassiveModule(),
        new PlayerModule(),
        new ShipModule(),
        new UwUifyModule()
    ];

    /** Initializes all modules by calling init() in module */
    static initAll() {
        Logger.info(`[${this.name}::initAll] Initializing modules...`);

        this.modules.forEach(module => {
            try {
                module.init();
                module.initHooks();
                Logger.debug(`[${this.name}::initAll] ${module.name} module loaded`);
            } catch (error: any) {
                Logger.errorToast(error, `[${this.name}::InitAll] Failed to load ${module.name} module`);
            }
        });

        Logger.info(`[${this.name}::initAll] All modules Initialized`);
    }

    /**
     * Finds the active instance of a module
     *
     * @param moduleClass The class of the module
     */
    static get<T extends BaseModule>(moduleClass: new (...args: any[]) => T): T | undefined {
        return this.modules.find(module => module instanceof moduleClass) as T | undefined;
    }
}
