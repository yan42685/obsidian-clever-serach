import { App, type TFile } from "obsidian";
import { getInstance } from "src/utils/my-lib";
import { singleton } from "tsyringe";

/*
 * APIs in this file are not declared in the official obsidian.d.ts but are available in js
 */
@singleton()
export class PrivateApi {
    app: App = getInstance(App);
    getFileBacklinks(file: TFile) {
        // @ts-ignore
        this.app.metadataCache.getBacklinksForFile(file);
    }
    getAppId() {
        // BUG: 最新的api移除了this.app.appId的定义，以后可能会废除这个属性
        // if this api is removed, use the following code to identify a vault:
        // public readonly vaultAbsolutePath = this.obsidianFs.getBasePath().replace(/\\/g, "/") + "/";
        return (this.app as any).appId;
    }

    executeCommandById(commandId: string) {
        (this.app as any).commands.executeCommandById(commandId);
    }
}
