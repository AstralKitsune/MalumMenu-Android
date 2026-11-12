import { AssemblyHelper } from "../core/AssemblyHelper";
import { BaseModule } from "../core/BaseModule";
import { State } from "../data/State";
import { UnityUtils } from "../utils/UnityUtils";
import { Logger } from "../logger/Logger";

export class PlayerModule extends BaseModule {
    public readonly name = "Player";

    private Vector2!: Il2Cpp.Class;

    private Constants!: Il2Cpp.Class;
    private HudManager!: Il2Cpp.Class;
    private MatchInfoHudButton!: Il2Cpp.Class;
    private MeetingHud!: Il2Cpp.Class;
    private PhysicsHelpers!: Il2Cpp.Class;
    private PlayerControl!: Il2Cpp.Class;
    private PlayerPhysics!: Il2Cpp.Class;
    private PlayerPurchasesData!: Il2Cpp.Class;
    private ShipStatus!: Il2Cpp.Class;
    private Vent!: Il2Cpp.Class;

    private Vector2_Distance!: Il2Cpp.Method;

    private HudManager_Update!: Il2Cpp.Method;
    private MatchInfoHudButton_Update!: Il2Cpp.Method;
    private PhysicsHelpers_AnythingBetween!: Il2Cpp.Method;
    private PlayerPhysics_LateUpdate!: Il2Cpp.Method;
    private PlayerPurchasesData_GetPurchase!: Il2Cpp.Method;
    private Vent_CanUse!: Il2Cpp.Method;

    public init(): void {
        this.Vector2 = AssemblyHelper.CoreModule.class("UnityEngine.Vector2");

        this.Constants = AssemblyHelper.AssemblyCSharp.class("Constants");
        this.HudManager = AssemblyHelper.AssemblyCSharp.class("HudManager");
        this.MatchInfoHudButton = AssemblyHelper.AssemblyCSharp.class("MatchInfoHudButton");
        this.MeetingHud = AssemblyHelper.AssemblyCSharp.class("MeetingHud");
        this.PhysicsHelpers = AssemblyHelper.AssemblyCSharp.class("PhysicsHelpers");
        this.PlayerControl = AssemblyHelper.AssemblyCSharp.class("PlayerControl");
        this.PlayerPhysics = AssemblyHelper.AssemblyCSharp.class("PlayerPhysics");
        this.PlayerPurchasesData = AssemblyHelper.AssemblyCSharp.class("PlayerPurchasesData");
        this.ShipStatus = AssemblyHelper.AssemblyCSharp.class("ShipStatus");
        this.Vent = AssemblyHelper.AssemblyCSharp.class("Vent");

        this.Vector2_Distance = this.Vector2.method<number>("Distance", 2);

        this.HudManager_Update = this.HudManager.method<void>("Update");
        this.MatchInfoHudButton_Update = this.MatchInfoHudButton.method<void>("Update");
        this.PhysicsHelpers_AnythingBetween = this.PhysicsHelpers.method<boolean>("AnythingBetween", 5);
        this.PlayerPhysics_LateUpdate = this.PlayerPhysics.method<void>("LateUpdate");
        this.PlayerPurchasesData_GetPurchase = this.PlayerPurchasesData.method<boolean>("GetPurchase");
        this.Vent_CanUse = this.Vent.method<boolean>("CanUse", 3);
    }

    public override initHooks(): void {
        const module = this;

        this.PlayerPhysics_LateUpdate.implementation = function (): void {
            //const myPlayer = module.PlayerPhysics.field<Il2Cpp.Object>("myPlayer");
            const localPlayer = module.localPlayer;

            // If we leave and re-join a game, localPlayer.handle points to dead memory
            // To prevent this, we check the internal Unity m_CachedPtr for 0x0
            // Since it's always pointing to real memory
            let cachedPtr: Il2Cpp.Pointer;
            try {
                cachedPtr = UnityUtils.cachedPtr(localPlayer);
            } catch (e) {
                Logger.debug(e + " (This error is expected due to m_CachedPtr not being set yet)");
                return this.method<void>("LateUpdate").invoke();
            }

            if (localPlayer.isNull() || cachedPtr.isNull()) {
                return this.method<void>("LateUpdate").invoke();
            }

            // instance field: public Collider2D Collider;
            const collider = localPlayer.field<Il2Cpp.Object>("Collider").value;

            if (State.noclip) {
                collider.method("set_enabled").invoke(false);
            } else {
                collider.method("set_enabled").invoke(true);
            }

            const myPhysics = localPlayer.field<Il2Cpp.Object>("MyPhysics").value;

            if (State.customSpeed) {
                myPhysics.field<number>("Speed").value = State.speed;
                myPhysics.field<number>("GhostSpeed").value = State.speed;
            } else {
                myPhysics.field<number>("Speed").value = 2.5;
                myPhysics.field<number>("GhostSpeed").value = 3;
            }

            return this.method<void>("LateUpdate").invoke();
        };

        // @ts-ignore
        this.PlayerPurchasesData_GetPurchase.implementation = function (itemKey: Il2Cpp.String, bundleKey: Il2Cpp.String): boolean {
            if (State.unlockCosmetics) {
                return true;
            }
            return this.method<boolean>("GetPurchase", 2).invoke(itemKey, bundleKey);
        };

        this.HudManager_Update.implementation = function (): void {
            const localPlayer = module.localPlayer;

            if (localPlayer.isNull()) {
                return this.method<void>("Update").invoke();
            }

            // NetworkedPlayerInfo
            const data = localPlayer.method<Il2Cpp.Object>("get_Data").invoke();

            let role: Il2Cpp.Object;
            let canVent: boolean;
            try {
                // RoleBehaviour
                role = data.field<Il2Cpp.Object>("Role").value;
                canVent = role.field<boolean>("CanVent").value;
            } catch (e) {
                Logger.debug(e + " (This error is expected due to Role field not being set yet)");
                return this.method<void>("Update").invoke();
            }
            const isDead = data.field<boolean>("IsDead").value;

            const MeetingHudInstance = module.MeetingHud.field<Il2Cpp.Object>("Instance").value;
            const inMeeting = !MeetingHudInstance.isNull();
            const ShipStatusInstance = module.ShipStatus.field<Il2Cpp.Object>("Instance").value;
            const inGame = !ShipStatusInstance.isNull();

            const shouldShowChatButton = State.enableChat || inMeeting || !inGame || isDead;

            const chat = this.field<Il2Cpp.Object>("Chat").value;
            const chatGameObject = UnityUtils.getGameObject(chat);

            chatGameObject.method<void>("SetActive").invoke(shouldShowChatButton);

            const shadowQuad = this.field<Il2Cpp.Object>("ShadowQuad").value;
            const shadowQuadGameObject = UnityUtils.getGameObject(shadowQuad);

            if (State.noShadows || isDead) {
                shadowQuadGameObject.method<void>("SetActive", 1).invoke(false);
            } else {
                shadowQuadGameObject.method<void>("SetActive", 1).invoke(true);
            }

            if (!canVent && !isDead) {
                const impostorVentButton = this.field<Il2Cpp.Object>("ImpostorVentButton").value;
                const impostorVentButtonGameObject = UnityUtils.getGameObject(impostorVentButton);

                impostorVentButtonGameObject.method<void>("SetActive", 1).invoke(State.unlockVents);
            }

            return this.method<void>("Update").invoke();
        };

        this.MatchInfoHudButton_Update.implementation = function (): void {
            if (State.enableChat) {
                // Prevent the MatchInfo and Chat buttons from overlapping
                const aspectPosition = this.field<Il2Cpp.Object>("aspectPosition").value;
                const distanceFromEdge = aspectPosition.field<Il2Cpp.Object>("DistanceFromEdge");

                distanceFromEdge.value = module.MatchInfoHudButton.field<Il2Cpp.Object>("adjustedDistanceFromEdge").value;
            } else {
                return this.method<void>("Update").invoke();
            }
        };

        //@ts-ignore
        this.Vent_CanUse.implementation = function (pc: Il2Cpp.Object, canUse: Il2Cpp.Reference<boolean>, couldUse: Il2Cpp.Reference<boolean>): number {
            if (!State.unlockVents) {
                return this.method<number>("CanUse", 3).invoke(pc, canUse, couldUse);
            }

            const localPlayer = module.localPlayer;
            const data = localPlayer.method<Il2Cpp.Object>("get_Data").invoke();

            if (localPlayer.isNull() || data.isNull()) {
                return this.method<number>("CanUse", 3).invoke(pc, canUse, couldUse);
            }

            const role = data.field<Il2Cpp.Object>("Role").value;
            const canVent = role.field<boolean>("CanVent").value;
            const isDead = data.field<boolean>("IsDead").value;

            if (canVent || isDead) {
                return this.method<number>("CanUse", 3).invoke(pc, canUse, couldUse);
            }

            const object = pc.method<Il2Cpp.Object>("get_Object").invoke();
            const collider = object.field<Il2Cpp.Object>("Collider").value;
            const bounds = collider.method<Il2Cpp.Object>("get_bounds").invoke();
            const center = bounds.method<Il2Cpp.Object>("get_center").invoke();

            const transform = this.method<Il2Cpp.Object>("get_transform").invoke();
            const position = transform.method<Il2Cpp.Object>("get_position").invoke();

            // Convert from Vector3 to Vector2. Works, but there's probably a better way of doing it.
            const centerX = center.field<number>("x").value;
            const centerY = center.field<number>("y").value;
            const positionX = position.field<number>("x").value;
            const positionY = position.field<number>("y").value;

            const centerVector2 = UnityUtils.createVector2(centerX, centerY);
            const positionVector2 = UnityUtils.createVector2(positionX, positionY);

            const num = module.Vector2_Distance.invoke(centerVector2, positionVector2) as number;

            const usableDistance = this.method<number>("get_UsableDistance").invoke(); // 0.75f
            const shipOnlyMask = module.Constants.field<number>("ShipOnlyMask").value;

            // Allow usage of vents unless the vent is too far or there are objects blocking the player's path
            canUse.value =
                num <= usableDistance && !module.PhysicsHelpers_AnythingBetween.invoke(collider, centerVector2, positionVector2, shipOnlyMask, false);
            couldUse.value = true;
            return num;
        };
    }

    public completeTask(task: Il2Cpp.Object): void {
        const module = this;
        const localPlayer = module.localPlayer;

        const taskId = task.method<number>("get_Id").invoke();
        // const isComplete = task.method<boolean>("get_IsComplete").invoke();
        localPlayer.method("RpcCompleteTask").invoke(taskId);
    }

    public completeMyTasks(): void {
        const module = this;

        const localPlayer = module.localPlayer;
        if (localPlayer.isNull()) {
            Logger.warn(`[${module.name}::completeMyTasks] LocalPlayer is null`);
            return;
        }

        // System.Collections.Generic.List<PlayerTask> myTasks;
        const myTasks = localPlayer.field<Il2Cpp.Object>("myTasks").value;

        // Iterate over the list. Source: https://github.com/vfsfitvnm/frida-il2cpp-bridge/issues/556
        const taskCount = myTasks.method<number>("get_Count").invoke();
        Logger.debug(`[${module.name}::completeMyTasks] Found ${taskCount} tasks`);
        for (let i = 0; i < taskCount; i++) {
            const task = myTasks.method<Il2Cpp.Object>("get_Item").invoke(i);
            module.completeTask(task);
        }
    }

    /**
     * `static PlayerControl::LocalPlayer`
     *
     * @returns `PlayerControl` instance
     */
    private get localPlayer(): Il2Cpp.Object {
        return this.PlayerControl.field<Il2Cpp.Object>("LocalPlayer").value;
    }
}
