import Java from "frida-java-bridge";

import { BaseModule } from "../core/BaseModule";
import { Logger } from "../logger/Logger";

export class GoogleServicesModule extends BaseModule {
    public readonly name = "GoogleServices";

    private hooks: Array<{ restore: () => void }> = [];

    public init(): void {
        Logger.debug(`[${this.name}::init] Ready`);
    }

    public override initHooks(): void {
    }

    public toggleGoogleServices(block: boolean): void {
        if (block) {
            this.applyHooks();
        } else {
            this.removeHooks();
        }
    }

    private applyHooks(): void {
        if (this.hooks.length > 0) {
            Logger.debug(`[${this.name}::applyHooks] Already applied`);
            return;
        }

        Java.perform(() => {
            try {
                const Activity = Java.use("android.app.Activity");
                const Intent   = Java.use("android.content.Intent");

                // overload(Intent, int)
                const origSAFR = Activity.startActivityForResult.overload(
                    "android.content.Intent", "int"
                );
                origSAFR.implementation = function (intent: any, requestCode: number) {
                    const component = intent.getComponent();
                    const action    = intent.getAction() ?? "";
                    const pkg       = component ? (component.getPackageName() ?? "") : "";

                    if (pkg.startsWith("com.google.android.gms") ||
                        action.startsWith("com.google.android.gms")) {
                        Logger.debug(
                            `[GoogleServices] Blocked startActivityForResult → ${pkg || action} (rc=${requestCode})`
                        );
                        this.onActivityResult(requestCode, Activity.RESULT_CANCELED.value, null);
                        return;
                    }
                    origSAFR.call(this, intent, requestCode);
                };
                this.hooks.push({ restore: () => { origSAFR.implementation = null; } });
                Logger.info(`[${this.name}] Hooked Activity.startActivityForResult`);
            } catch (e) {
                Logger.warn(`[${this.name}] startActivityForResult hook failed: ${e}`);
            }

            try {
                const GoogleSignIn  = Java.use("com.google.android.gms.auth.api.signin.GoogleSignIn");
                const origGetLast   = GoogleSignIn.getLastSignedInAccount.overload("android.content.Context");
                origGetLast.implementation = function (_ctx: any) {
                    Logger.debug("[GoogleServices] getLastSignedInAccount → null");
                    return null;
                };
                this.hooks.push({ restore: () => { origGetLast.implementation = null; } });
                Logger.info(`[${this.name}] Hooked GoogleSignIn.getLastSignedInAccount`);
            } catch (e) {
                Logger.warn(`[${this.name}] GoogleSignIn not found: ${e}`);
            }

            try {
                const GoogleApiClient = Java.use("com.google.android.gms.common.api.GoogleApiClient");
                const origConnect     = GoogleApiClient.connect.overload();
                origConnect.implementation = function () {
                    Logger.debug("[GoogleServices] GoogleApiClient.connect → blocked");
                };
                this.hooks.push({ restore: () => { origConnect.implementation = null; } });
                Logger.info(`[${this.name}] Hooked GoogleApiClient.connect`);
            } catch (e) {
                Logger.warn(`[${this.name}] GoogleApiClient not found: ${e}`);
            }

            try {
                const PlayGames             = Java.use("com.google.android.gms.games.PlayGames");
                const origGetGamesSignIn    = PlayGames.getGamesSignInClient.overload("android.app.Activity");
                origGetGamesSignIn.implementation = function (_activity: any) {
                    Logger.debug("[GoogleServices] getGamesSignInClient → null");
                    return null;
                };
                this.hooks.push({ restore: () => { origGetGamesSignIn.implementation = null; } });
                Logger.info(`[${this.name}] Hooked PlayGames.getGamesSignInClient`);
            } catch (e) {
                Logger.warn(`[${this.name}] PlayGames not found: ${e}`);
            }
        });

        Logger.info(`[${this.name}] Google Services blocked`);
    }

    private removeHooks(): void {
        Java.perform(() => {
            for (const hook of this.hooks) {
                try { hook.restore(); }
                catch (e) { Logger.warn(`[${this.name}::removeHooks] ${e}`); }
            }
        });
        this.hooks = [];
        Logger.info(`[${this.name}] Google Services restored`);
    }
}
