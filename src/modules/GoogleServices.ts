import Java from "frida-java-bridge";

import { BaseModule } from "../core/BaseModule";
import { State } from "../data/State";
import { Logger } from "../logger/Logger";

export class GoogleServicesModule extends BaseModule {
    public readonly name = "GoogleServices";

    private hooks: Array<{ restore: () => void }> = [];

    public init(): void {
        if (State.disableGoogleServices) this.applyHooks();
        Logger.debug(`[${this.name}::init] Ready`);
    }

    public override initHooks(): void {
        const module = this;

        this.tryHook("AndroidClient.Authenticate", () => {
            const AndroidClient = this.findClass("GooglePlayGames.Android.AndroidClient");
            const SignInStatus = this.findClass("GooglePlayGames.BasicApi.SignInStatus");
            const canceled = Number(SignInStatus.field("Canceled").value);

            const authenticate = AndroidClient.method<void>("Authenticate", 2);
            //@ts-ignore
            authenticate.implementation = function (interactivity: any, callback: any): void {
                if (State.disableGoogleServices && callback && !callback.isNull()) {
                    try {
                        Logger.debug("[GoogleServices] AndroidClient.Authenticate blocked, answering Canceled");
                        callback.method("Invoke", 1).invoke(canceled);
                        return;
                    } catch (e) {
                        module.failOnce("authenticate", e);
                    }
                }
                return this.method<void>("Authenticate", 2).invoke(interactivity, callback);
            };
        });

        this.tryHook("AndroidTokenClient.FetchTokens", () => {
            const AndroidTokenClient = this.findClass("GooglePlayGames.Android.AndroidTokenClient");
            let canceled = 16; // CommonStatusCodes.Canceled
            try {
                canceled = Number(this.findClass("GooglePlayGames.BasicApi.CommonStatusCodes").field("Canceled").value);
            } catch (e) {
            }

            const fetchTokens = AndroidTokenClient.method<void>("FetchTokens", 2);
            //@ts-ignore
            fetchTokens.implementation = function (silent: any, callback: any): void {
                if (State.disableGoogleServices && callback && !callback.isNull()) {
                    try {
                        Logger.debug("[GoogleServices] AndroidTokenClient.FetchTokens blocked, answering Canceled");
                        callback.method("Invoke", 1).invoke(canceled);
                        return;
                    } catch (e) {
                        module.failOnce("fetchTokens", e);
                    }
                }
                return this.method<void>("FetchTokens", 2).invoke(silent, callback);
            };
        });
    }

    private failed = new Set<string>();

    private failOnce(key: string, error: unknown): void {
        if (this.failed.has(key)) return;
        this.failed.add(key);
        Logger.warn(`[${this.name}] ${key} failed (further errors suppressed): ${error}`);
    }

    private tryHook(label: string, install: () => void): void {
        try {
            install();
        } catch (e) {
            Logger.warn(`[${this.name}::initHooks] Skipping "${label}" (not in this game version): ${e}`);
        }
    }

    private findClass(fullName: string): Il2Cpp.Class {
        for (const assembly of Il2Cpp.domain.assemblies) {
            const klass = assembly.image.tryClass(fullName);
            if (klass) return klass;
        }
        throw new Error(`${fullName} not found`);
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
                const Intent = Java.use("android.content.Intent");

                // overload(Intent, int)
                const origSAFR = Activity.startActivityForResult.overload("android.content.Intent", "int");
                origSAFR.implementation = function (intent: any, requestCode: number) {
                    const component = intent.getComponent();
                    const action = intent.getAction() ?? "";
                    const pkg = component ? (component.getPackageName() ?? "") : "";

                    if (pkg.startsWith("com.google.android.gms") || action.startsWith("com.google.android.gms")) {
                        Logger.debug(`[GoogleServices] Blocked startActivityForResult → ${pkg || action} (rc=${requestCode})`);
                        this.onActivityResult(requestCode, Activity.RESULT_CANCELED.value, null);
                        return;
                    }
                    origSAFR.call(this, intent, requestCode);
                };
                this.hooks.push({
                    restore: () => {
                        origSAFR.implementation = null;
                    }
                });
                Logger.info(`[${this.name}] Hooked Activity.startActivityForResult`);
            } catch (e) {
                Logger.warn(`[${this.name}] startActivityForResult hook failed: ${e}`);
            }

            try {
                const GoogleSignIn = Java.use("com.google.android.gms.auth.api.signin.GoogleSignIn");
                const origGetLast = GoogleSignIn.getLastSignedInAccount.overload("android.content.Context");
                origGetLast.implementation = function (_ctx: any) {
                    Logger.debug("[GoogleServices] getLastSignedInAccount → null");
                    return null;
                };
                this.hooks.push({
                    restore: () => {
                        origGetLast.implementation = null;
                    }
                });
                Logger.info(`[${this.name}] Hooked GoogleSignIn.getLastSignedInAccount`);
            } catch (e) {
                Logger.warn(`[${this.name}] GoogleSignIn not found: ${e}`);
            }

            try {
                const GoogleApiClient = Java.use("com.google.android.gms.common.api.GoogleApiClient");
                const origConnect = GoogleApiClient.connect.overload();
                origConnect.implementation = function () {
                    Logger.debug("[GoogleServices] GoogleApiClient.connect → blocked");
                };
                this.hooks.push({
                    restore: () => {
                        origConnect.implementation = null;
                    }
                });
                Logger.info(`[${this.name}] Hooked GoogleApiClient.connect`);
            } catch (e) {
                Logger.warn(`[${this.name}] GoogleApiClient not found: ${e}`);
            }

            try {
                const PlayGames = Java.use("com.google.android.gms.games.PlayGames");
                const origGetGamesSignIn = PlayGames.getGamesSignInClient.overload("android.app.Activity");
                origGetGamesSignIn.implementation = function (_activity: any) {
                    Logger.debug("[GoogleServices] getGamesSignInClient → null");
                    return null;
                };
                this.hooks.push({
                    restore: () => {
                        origGetGamesSignIn.implementation = null;
                    }
                });
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
                try {
                    hook.restore();
                } catch (e) {
                    Logger.warn(`[${this.name}::removeHooks] ${e}`);
                }
            }
        });
        this.hooks = [];
        Logger.info(`[${this.name}] Google Services restored`);
    }
}
