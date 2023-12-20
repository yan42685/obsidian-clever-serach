import { jest } from "@jest/globals";
import { LanguageEnum } from "./entities/language-enum";
import { testOnLoad } from "./test-on-load";
import { detectLanguage, printLanguageProportions } from "./utils/nlp";

import { debounce } from "throttle-debounce";

// 定义测试字符串数组
const testArrays = [
	[
		"This is the first test sentence. It is written in English.",
		"这是第一句测试语句。",
		"It's definitely in English.",
	],
	[
		"This text is mostly in English but it has some 中文 characters.",
		"Here is some more English text.",
		"这里有一些中文字符。",
	],
	[
		"这是主要的中文文本，但它有一些English words.",
		"这里还有更多的中文。",
		"Here is an English sentence to mix things up.",
	],
];

// 模拟 console.log
const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

describe("NLP functions", () => {
	afterEach(() => {
		// 清除 console.log 的模拟调用信息
		logSpy.mockClear();
	});

	afterAll(() => {
		// 恢复 console.log
		logSpy.mockRestore();
	});

	describe("detectLanguage function", () => {
		it("should detect the correct main language and proportions", () => {
			// 测试 detectLanguage 函数的逻辑
			const expectedResults = [
				{
					mainLanguage: LanguageEnum.en,
					mainProportion: "89.47%",
					details: {
						[LanguageEnum.en]: "89.47%",
						[LanguageEnum.zh]: "10.53%",
						[LanguageEnum.other]: "0.00%",
					},
				},
				{
					mainLanguage: LanguageEnum.en,
					mainProportion: "100.00%",
					details: {
						[LanguageEnum.en]: "100.00%",
						[LanguageEnum.zh]: "0.00%",
						[LanguageEnum.other]: "0.00%",
					},
				},
				{
					mainLanguage: LanguageEnum.en,
					mainProportion: "65.48%",
					details: {
						[LanguageEnum.en]: "65.48%",
						[LanguageEnum.zh]: "34.52%",
						[LanguageEnum.other]: "0.00%",
					},
				},
			];

			testArrays.forEach((array, index) => {
				const result = detectLanguage(array);
				expect(result).toEqual(expectedResults[index]);
			});
		});
	});

	describe("printLanguageProportions function", () => {
		it("should print language proportions correctly", () => {
			const result = {
				mainLanguage: LanguageEnum.en,
				mainProportion: "50%",
				details: {
					[LanguageEnum.en]: "50%",
					[LanguageEnum.zh]: "50%",
					[LanguageEnum.other]: "0%",
				},
			};
			printLanguageProportions(result);

			// 验证 console.log 是否被调用
			expect(logSpy).toHaveBeenCalledWith(
				expect.stringContaining(
					"Main Language: English, Main Proportion: 50%",
				),
			);
			// ... 根据 printLanguageProportions 函数的输出格式添加更多的断言
		});
	});

	describe("testOnLoad function", () => {
		it("should call detectLanguage and printLanguageProportions for each array", () => {
			testOnLoad();

			// 由于有三个数组，所以预期 console.log 被调用了三次
			expect(logSpy).toHaveBeenCalledTimes(3);
			// ... 根据 testOnLoad 函数的具体行为添加更多的断言
		});
	});
});
const fn = (a: number, b: number) => a + b;
const fnDebounced = debounce(100, fn);
