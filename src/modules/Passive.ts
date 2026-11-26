import { AssemblyHelper } from "../core/AssemblyHelper";
import { BaseModule } from "../core/BaseModule";
import { Logger } from "../logger/Logger";
import { State } from "../data/State";

export class PassiveModule extends BaseModule {
    public readonly name = "Passive";

    // Classes
    private Screen!: Il2Cpp.Class;

    private PlayerBanData!: Il2Cpp.Class;
    private ResolutionManager!: Il2Cpp.Class;

    // Methods
    private PlayerBanData_getBanMinutesLeft!: Il2Cpp.Method;
    private ResolutionManager_SetResolution!: Il2Cpp.Method;

    private HasResolutionBeenChanged!: boolean;
    private OriginalWidth!: number;
    private OriginalHeight!: number;

    public init(): void {
        this.Screen = AssemblyHelper.CoreModule.class("UnityEngine.Screen");

        this.PlayerBanData = AssemblyHelper.AssemblyCSharp.class("AmongUs.Data.Player.PlayerBanData");
        this.ResolutionManager = AssemblyHelper.AssemblyCSharp.class("ResolutionManager");

        this.PlayerBanData_getBanMinutesLeft = this.PlayerBanData.method<number>("get_BanMinutesLeft");
        this.ResolutionManager_SetResolution = this.ResolutionManager.method<void>("SetResolution", 3);

        this.HasResolutionBeenChanged = false;
    }

    public override initHooks(): void {
        const module = this;

        module.PlayerBanData_getBanMinutesLeft.implementation = function (): number {
            if (!State.noPenalties) {
                return this.method<number>("get_BanMinutesLeft").invoke();
            }
            Logger.debug(`[${module.name}::PlayerBanData_getBanMinutesLeft] Spoofing BanMinutes to 0`);
            return 0;
        };
    }

    public toggleFullResolution(state: boolean): void {
        const module = this;

        if (!this.HasResolutionBeenChanged) {
            const original_resolution = module.Screen.method<Il2Cpp.Object>("get_currentResolution").invoke();
            module.OriginalWidth = original_resolution.method<number>("get_width").invoke();
            module.OriginalHeight = original_resolution.method<number>("get_height").invoke();
            Logger.debug(`[${module.name}::ToggleFullResolution] Original resolution: ${module.OriginalWidth}x${module.OriginalHeight}`);
        }
        this.HasResolutionBeenChanged = true;

        if (state) {
            // resolutions returns all full-screen resolutions that the monitor supports, sorted by width
            const resolutions = module.Screen.method<Il2Cpp.Array<Il2Cpp.Object>>("get_resolutions").invoke();
            const width = resolutions.get(0).method<number>("get_width").invoke();
            const height = resolutions.get(0).method<number>("get_height").invoke();
            //const refreshRateRatio = resolutions.get(0).method<Il2Cpp.Object>("get_refreshRateRatio").invoke();
            //const refreshRate = refreshRateRatio.field("value").value;

            Logger.debug(`[${module.name}::ToggleFullResolution] Setting resolution to ${height}x${width}`);
            module.ResolutionManager_SetResolution.invoke(height, width, true);
        } else {
            Logger.debug(`[${module.name}::ToggleFullResolution] Resetting resolution to ${module.OriginalWidth!}x${module.OriginalHeight!}`);
            module.ResolutionManager_SetResolution.invoke(module.OriginalWidth, module.OriginalHeight, true);
        }
    }
}
