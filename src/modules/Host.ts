import { AssemblyHelper } from "../core/AssemblyHelper";
import { BaseModule } from "../core/BaseModule";
import { Logger } from "../logger/Logger";

export class HostModule extends BaseModule {
    public readonly name = "Host";

    // Classes
    private AmongUsClient!: Il2Cpp.Class;

    private Joined!: Il2Cpp.ValueType;

    public init(): void {
        this.AmongUsClient = AssemblyHelper.AssemblyCSharp.class("AmongUsClient");

        // Nested enum
        const GameStates = AssemblyHelper.AssemblyCSharp.class("InnerNet.InnerNetClient").nested("GameStates");
        this.Joined = GameStates.field<Il2Cpp.ValueType>("Joined").value;
    }

    public forceStartGame(): void {
        const module = this;

        const amongUsClientInstance = module.AmongUsClient.field<Il2Cpp.Object>("Instance").value;
        if (amongUsClientInstance.isNull()) {
            Logger.warn(`[${module.name}::forceStartGame] AmongUsClient.Instance is null`);
            return;
        }

        const amHost = amongUsClientInstance.method<boolean>("get_AmHost").invoke();
        if (!amHost) {
            return;
        }

        const gameState = amongUsClientInstance.field<Il2Cpp.ValueType>("GameState").value;
        const gameStateValue = gameState.field<number>("value__").value;
        const joinedValue = module.Joined.field<number>("value__").value;
        if (!(gameStateValue == joinedValue)) {
            Logger.debug(`[${module.name}::forceStartGame] Not in lobby`);
            return;
        }

        amongUsClientInstance.method<void>("StartGame").invoke();
        Logger.debug(`[${module.name}::forceStartGame] Force started game`);
    }
}
