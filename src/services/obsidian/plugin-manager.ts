import { singleton } from "tsyringe";
import { getInstance } from "../../utils/my-lib";
import { LexicalEngine } from "../search/search-engine";
import { SettingManager } from "./setting-manager";
import { SearchService } from "./search-service";

@singleton()
export class PluginManager {
	// private readonly obFileUtil = getInstance(Vault).adapter as FileSystemAdapter;
	async initAsync() {
		await getInstance(SettingManager).initAsync();
		await getInstance(SearchService).initAsync();
	}

}
