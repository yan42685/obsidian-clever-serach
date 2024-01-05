import type { SearchResult as MiniResult } from "minisearch";
import { FileType, FileUtil } from "src/utils/file-util";
export type MiniSearchResult = MiniResult;

export type IndexedDocument = {
	path: string;
	basename: string;
	folder: string;
	aliases?: string;
	content?: string;
};

export type DocumentFields = Array<keyof IndexedDocument>;

export type DocumentWeight = {
	[K in keyof IndexedDocument]?: number;
};

export type DocumentRef = {
	id?: number;
	path: string;
	lexicalMtime: number;
	embeddingMtime: number;
};

export type InFileDataSource = {
	lines: Line[];
	path: string;
};

export class Line {
	text: string;
	row: number;
	constructor(text: string, row: number) {
		this.text = text;
		this.row = row;
	}
}

export type LineFields = Array<keyof Line>;

// text: highlighted text
// col: the first highlighted col text
export type HighlightedContext = Line & { col: number };

export type MatchedLine = Line & { positions: Set<number> }; // positions: columns of matched chars

export type MatchedFile = {
	path: string;
	matchedTerms: string[];
};

export class SearchResult {
	currPath: string;
	items: Item[];
	constructor(currPath: string, items: Item[]) {
		this.currPath = currPath;
		this.items = items;
	}
}

export enum SearchType {
	NONE,
	IN_FILE,
	IN_VAULT,
}

export enum EngineType {
	LEXICAL,
	SEMANTIC,
}

export abstract class Item {
	element?: HTMLElement;
}

export class LineItem extends Item {
	line: HighlightedContext;
	context: string;

	constructor(line: HighlightedContext, context: string) {
		super();
		this.line = line;
		this.context = context;
	}
}

export class FileItem extends Item {
	engineType: EngineType;
	path: string;
	matchedTerms: string[];
	subItems: FileSubItem[]; // for plaintext filetype
	// TODO: impl this
	previewContent: any; // for non-plaintext filetype
	get fileType(): FileType {
		return FileUtil.getFileType(this.path);
	}
	get basename() {
		return FileUtil.getBasename(this.path);
	}
	get extension() {
		return FileUtil.getExtension(this.path);
	}
	get folderPath() {
		return FileUtil.getFolderPath(this.path);
	}

	constructor(
		engineType: EngineType,
		path: string,
		matchedTerms: string[],
		subItems: FileSubItem[],
		previewContent: any,
	) {
		super();
		this.engineType = engineType;
		this.path = path;
		this.matchedTerms = matchedTerms;
		this.subItems = subItems;
		this.previewContent = previewContent;
	}
}

export class FileSubItem extends Item {
	text: string;
	row: number; // for precisely jumping to the original file location
	col: number;
	constructor(text: string, originRow: number, originCol: number) {
		super();
		this.text = text;
		this.row = originRow;
		this.col = originCol;
	}
}

export type Location = {
	row: number;
	col: number;
};

export type LocatableFile = Location & {
	type: FileType;
	path: string;
};
