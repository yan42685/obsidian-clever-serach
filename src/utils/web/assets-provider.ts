import { PluginSetting } from "src/globals/plugin-setting";
import { singleton } from "tsyringe";
import { FileUtil, fsUtil, pathUtil } from "../file-util";
import { logger } from "../logger";
import { getInstance } from "../my-lib";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const electron = require("electron");
const userDataPath = (electron.app || electron.remote.app).getPath("userData");

const assetsDir = pathUtil.join(userDataPath, "clever-search");

const unpkgUrl = "https://unpkg.com/";
const myRemoteDirUrl1 =
	unpkgUrl + "obsidian-clever-search@latest/assets/for-program/";
const myRemoteDirUrl2 =
	"https://raw.githubusercontent.com/yan42685/obsidian-clever-search/dev/assets/for-program/";
const myRemoteDirUrl3 =
	"https://gitee.com/alexyan333777/obsidian-clever-search/raw/dev/assets/for-program/";


const tiktokenSourceUrl = unpkgUrl + "@dqbd/tiktoken@1.0.7/tiktoken_bg.wasm";
const tiktokenTargetUrl = pathUtil.join(assetsDir, "tiktoken_bg.wasm");

const jiebaSourceUrl =
	unpkgUrl + "jieba-wasm@0.0.2/pkg/web/jieba_rs_wasm_bg.wasm";
const jiebaTargetUrl = pathUtil.join(assetsDir, "jieba_rs_wasm_bg.wasm");

const stopWordsZhSourceUrl = myRemoteDirUrl1 + "stop-words-zh.txt";
const stopWordsZhTargetUrl = pathUtil.join(assetsDir, "stop-words-zh.txt");
const stopWordsEnSourceUrl = myRemoteDirUrl1 + "stop-words-en.txt";
export const stopWordsEnTargetUrl = pathUtil.join(
	assetsDir,
	"stop-words-en.txt",
);

@singleton()
export class AssetsProvider {
	private readonly setting = getInstance(PluginSetting);
	private readonly _assets: Assets = EMPTY_ASSETS;
	get assets() {
		return this._assets;
	}

	async initAsync() {
		logger.trace("preparing assets...");
		logger.trace(`target dir: ${assetsDir}`);
		// logger.info("tiktoken source url: " + tiktokenSourceUrl);
		// logger.info("tiktoken target url: " + tiktokenTargetUrl);
		// await this.downloadFile(tiktokenTargetUrl, tiktokenSourceUrl);
		if (this.setting.enableChinesePatch) {
			await this.downloadFile(jiebaTargetUrl, jiebaSourceUrl);
			await this.downloadFile(stopWordsZhTargetUrl, stopWordsZhSourceUrl);
			this._assets.jiebaBinary = fsUtil.promises.readFile(jiebaTargetUrl);
			this._assets.stopWordsZh =
				await this.readLinesAsSet(stopWordsZhTargetUrl);
		}
		await this.downloadFile(stopWordsEnTargetUrl, stopWordsEnSourceUrl);
		this._assets.stopWordsEn =
			await this.readLinesAsSet(stopWordsEnTargetUrl);
	}

	private async readLinesAsSet(path: string): Promise<Set<string>> {
		return new Set(
			(await fsUtil.promises.readFile(path, { encoding: "utf-8" })).split(
				FileUtil.SPLIT_EOL,
			),
		);
	}

	private async downloadFile(
		targetPath: string,
		sourceUrl: string,
	): Promise<void> {
		// check if the file already exists
		try {
			await fsUtil.promises.access(targetPath);
			logger.trace("file exists:", targetPath);
			return;
		} catch (error) {
			if (error.code !== "ENOENT") throw error; // rethrow if it's an error other than "file not found"
		}

		// create dir recursively if not exists
		const targetDir = pathUtil.dirname(targetPath);
		await fsUtil.promises
			.mkdir(targetDir, { recursive: true })
			.catch((error) => {
				if (error.code !== "EEXIST") throw error; // only ignore the error if the directory already exists
			});

		// download the file
		const response = await fetch(sourceUrl);
		if (!response.ok)
			throw new Error(`unexpected response ${response.statusText}`);

		try {
			await fsUtil.promises.writeFile(
				targetPath,
				Buffer.from(await response.arrayBuffer()),
				"utf-8",
			);
			logger.info(`successfully download from ${sourceUrl}`);
		} catch (error) {
			logger.error(`failed to download ${sourceUrl}`);
			throw error;
		}
	}
}

type Assets = {
	stopWordsZh: Set<string> | null;
	stopWordsEn: Set<string> | null;
	jiebaBinary: Promise<ArrayBuffer | null>;
};

const EMPTY_ASSETS: Assets = {
	stopWordsZh: null,
	stopWordsEn: null,
	jiebaBinary: new Promise(() => null),
};
