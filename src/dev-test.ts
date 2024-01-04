import { App, TFile } from "obsidian";
// import { encoding_for_model } from "tiktoken"
import { PluginSetting } from "./globals/plugin-setting";
import { CjkPatch } from "./integrations/languages/cjk-patch";
import { SearchService } from "./services/obsidian/search-service";
import { LexicalEngine } from "./services/search/search-engine";
import { logger } from "./utils/logger";
import { getInstance } from "./utils/my-lib";
import { AssetsManager } from "./utils/web/assets-manager";

export async function devTest() {
	const settings = getInstance(PluginSetting);
	// ====== API Request =====
	// const httpClient = getInstance(HttpClient);
	// httpClient.testRequest();

	// ====== vault files =====
	// setTimeout(() => {
	// 	monitorExecution(async () => {
	// 		const plugin: CleverSearch = getInstance(THIS_PLUGIN);
	// 		const vault = plugin.app.vault;
	// 		logger.debug(vault.getRoot().path); // /
	// 		logger.debug(vault.configDir); // .obsidian
	// 	});
	// }, 1300);

	// testStemmer();
	// testTsyringe();
	// testUnsupportedExtensions();

	// monitorExecution(testLexicalSearch);
	// monitorExecution(async () => await testLexicalSearch());
	// testLexicalSearch();
	// logger.trace("test");

	// const vault = getInstance(Vault);
	// logger.info(`${vault.configDir}`);


	// testTikToken();
	testTokenizer();
}

function getApp() {
	return getInstance(App);
}

function testStemmer() {
	const words = ["gifs;d", "gifs", "哈哈", "很多只猫", "analyzers"];
}

function testTsyringe() {
	const obj1 = getInstance(SearchService);
	const obj2 = getInstance(SearchService);
	// in tsyringe, the default scope for class is singleton, so it should output "true"
	logger.info(`test equal: ${obj1 === obj2}`);
}

function testUnsupportedExtensions() {
	const vault = getApp().vault as any;
	logger.info(vault.getConfig("showUnsupportedFiles"));
}

async function testLexicalSearch() {
	const lexicalEngine = getInstance(LexicalEngine);
	// await lexicalEngine.initAsync();
	// const query = "camera communiy";
	const query = "whoknowthisfolder/whereisit";
	const resultsOr = await lexicalEngine.searchFiles(query, "or");
	const resultsAnd = await lexicalEngine.searchFiles(query, "and");

	logger.debug(resultsOr);
	// logger.debug(resultsAnd);
	const vault = getApp().vault;
	const tFile = vault.getAbstractFileByPath(resultsOr[0]?.path);
	if (tFile) {
		if (tFile instanceof TFile) {
			// const content = await vault.cachedRead(tFile);
			logger.info(`find first one: ${tFile.path}`);
		} else {
			logger.info(`it's a folder: ${tFile}`);
		}
	} else {
		logger.info(`no document is found`);
	}
}

// async function testTikToken() {
// 	// 获取 GPT-3.5 的 tokenizer
// 	const enc = encoding_for_model("gpt-3.5-turbo");

// 	// 对字符串进行 tokenize、encoding 和 decoding
// 	const inputString = "hello world";
// 	const encoded = enc.encode(inputString);
// 	const decoded = new TextDecoder().decode(enc.decode(encoded));

// 	console.log("Original String:", inputString);
// 	console.log("Encoded Tokens:", encoded);
// 	console.log("Decoded String:", decoded);

// 	// 验证编码后再解码的字符串是否与原始字符串相同

// 	// 释放 encoder 资源
// 	enc.free();
// }

async function testTokenizer() {
	// getInstance(SearchClient).testTickToken()
	getInstance(AssetsManager).startDownload();
	const cutter = getInstance(CjkPatch);
	await cutter.initAsync()
	// const text= "今天天气气候不错啊";
	// const text= "陈志敏今天似乎好像没有来学校学习啊";
	// const text= "In this digital age, 在这个数字时代, let's embrace the wisdom of the past while pushing the boundaries of the future. 让我们在推动未来的同时，拥抱过去的智慧。 past whileaaaaaaa";
	const text= "smart-Connection用起来还不错";
	logger.info(cutter.cutForSearch(text, false));
	logger.info(cutter.cutForSearch(text, true));
}