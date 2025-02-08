import { OuterSetting } from "src/globals/plugin-setting";
import { SettingManager } from "src/services/obsidian/setting-manager";
import { singleton } from "tsyringe";
import { SearchType } from "../globals/search-types";
import { TO_BE_IMPL, getInstance } from "../utils/my-lib";
import MountedModal from "./MountedModal.svelte";

@singleton()
export class FloatingWindowManager {
	toggle(windowType: "inFile" | "inVault") {
		if (windowType === "inFile") {
			getInstance(InFileFloatingWindow).toggle();
		} else {
			throw Error(TO_BE_IMPL);
		}
	}

	resetAllPositions() {
		const uiSetting = getInstance(OuterSetting).ui;

		uiSetting.inFileFloatingWindowLeft = "2.7em";
		uiSetting.inFileFloatingWindowTop = "2.5em";
		getInstance(FloatingWindowManager).toggle("inFile");
		getInstance(FloatingWindowManager).toggle("inFile");
	}

	onunload() {
		getInstance(InFileFloatingWindow).onClose();
	}
}
abstract class FloatingWindow {
	private isDragging = false;
	private dragStartX = 0;
	private dragStartY = 0;
	private isResizing = false;
	private resizeStartX = 0;
	private resizeStartY = 0;
	private resizeStartWidth = 0;
	private resizeStartHeight = 0;
	protected uiSetting = getInstance(OuterSetting).ui;
	protected containerEl: HTMLDivElement;
	private frameEl: HTMLDivElement;
	protected contentEl: HTMLDivElement;
	protected mountedElement: MountedModal | null = null;

	toggle(): FloatingWindow {
		if (this.mountedElement !== null) {
			this.onClose();
			return this;
		}
		this.containerEl = document.body.createDiv();
		this.frameEl = this.containerEl.createDiv();
		this.contentEl = this.containerEl.createDiv();

		this.frameEl.addEventListener("mousedown", this.handleMouseDown);
		document.addEventListener("mousemove", this.handleMouseMove);
		document.addEventListener("mouseup", this.handleMouseUp);

		this.containerEl.addClass("cs-floating-window-container");
		this.containerEl.style.position = "fixed";
		this.containerEl.style.minWidth = "200px";
		this.containerEl.style.minHeight = "100px";
		// load position and other states from setting
		this.loadContainerElStates();
		this.containerEl.style.zIndex = "20";
		this.containerEl.style.border = "1px solid #454545";
		this.containerEl.style.borderRadius = "10px";
		// avoid the frameEl overflowing so that borderRadius of containerEl is covered
		this.containerEl.style.overflow = "hidden";
		this.containerEl.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

		this.frameEl.style.width = "100%";
		this.frameEl.style.height = "20px";
		this.frameEl.style.backgroundColor = "#333";
		this.frameEl.style.cursor = "move";
		this.frameEl.style.color = "#fff";
		this.frameEl.style.display = "flex";
		this.frameEl.style.alignItems = "center";
		this.frameEl.style.justifyContent = "right";
		this.frameEl.style.padding = "10px 0 10px 10px";

		const closeButton = this.frameEl.createSpan();
		closeButton.innerText = "✖";
		closeButton.style.cursor = "pointer";
		closeButton.style.fontSize = "13px";
		closeButton.style.margin = "5px";
		closeButton.addEventListener("click", this.onClose);

		this.contentEl.style.padding = "10px 0 10px 10px";

		// 添加调整大小的手柄
		const resizeHandle = this.containerEl.createDiv();
		resizeHandle.addClass("cs-resize-handle");
		resizeHandle.style.position = "absolute";
		resizeHandle.style.right = "0";
		resizeHandle.style.bottom = "0";
		resizeHandle.style.width = "10px";
		resizeHandle.style.height = "10px";
		resizeHandle.style.cursor = "se-resize";
		
		resizeHandle.addEventListener("mousedown", this.handleResizeStart);
		document.addEventListener("mousemove", this.handleResize);
		document.addEventListener("mouseup", this.handleResizeEnd);

		this.mountComponent();
		return this;
	}

	// should be called on unload
	onClose = () => {
		document.removeEventListener("mousemove", this.handleMouseMove);
		document.removeEventListener("mouseup", this.handleMouseUp);
		document.removeEventListener("mousemove", this.handleResize);
		document.removeEventListener("mouseup", this.handleResizeEnd);
		// destroy svelte component
		this.mountedElement?.$destroy();
		this.mountedElement = null;
		this.containerEl?.remove();
	};

	protected abstract loadContainerElStates(): void;
	protected abstract saveContainerElStates(): void;
	protected abstract mountComponent(): void;

	private handleMouseDown = (e: MouseEvent) => {
		this.isDragging = true;
		this.containerEl.style.opacity = "0.75";
		this.dragStartX = e.pageX - this.containerEl.offsetLeft;
		this.dragStartY = e.pageY - this.containerEl.offsetTop;
		e.preventDefault(); // prevents text selection during drag
	};

	private handleMouseMove = (e: MouseEvent) => {
		if (this.isDragging) {
			this.containerEl.style.left = `${e.pageX - this.dragStartX}px`;
			this.containerEl.style.top = `${e.pageY - this.dragStartY}px`;
		}
	};

	private handleMouseUp = () => {
		this.isDragging = false;
		this.containerEl.style.opacity = "1";
		// remember position and other stated
		this.saveContainerElStates();
		getInstance(SettingManager).postSettingUpdated();
	};

	private handleResizeStart = (e: MouseEvent) => {
		this.isResizing = true;
		this.resizeStartX = e.pageX;
		this.resizeStartY = e.pageY;
		this.resizeStartWidth = this.containerEl.offsetWidth;
		this.resizeStartHeight = this.containerEl.offsetHeight;
		e.preventDefault();
	};

	private handleResize = (e: MouseEvent) => {
		if (!this.isResizing) return;
		
		const newWidth = this.resizeStartWidth + (e.pageX - this.resizeStartX);
		const newHeight = this.resizeStartHeight + (e.pageY - this.resizeStartY);
		
		// 设置最小尺寸限制
		this.containerEl.style.width = `${Math.max(200, newWidth)}px`;
		this.containerEl.style.height = `${Math.max(100, newHeight)}px`;
	};

	private handleResizeEnd = () => {
		if (!this.isResizing) return;
		this.isResizing = false;
		this.saveContainerElStates();
		getInstance(SettingManager).postSettingUpdated();
	};
}

@singleton()
class InFileFloatingWindow extends FloatingWindow {
	protected mountComponent(): void {
		this.mountedElement = new MountedModal({
			target: this.contentEl,
			props: {
				uiType: "floatingWindow",
				onConfirmExternal: () => {},
				searchType: SearchType.IN_FILE,
				isSemantic: false,
				queryText: "",
			},
		});
	}
	protected loadContainerElStates(): void {
		this.containerEl.style.top = this.uiSetting.inFileFloatingWindowTop;
		this.containerEl.style.left = this.uiSetting.inFileFloatingWindowLeft;
		this.containerEl.style.width = this.uiSetting.inFileFloatingWindowWidth || "300px";
		this.containerEl.style.height = this.uiSetting.inFileFloatingWindowHeight || "200px";
	}
	protected saveContainerElStates(): void {
		this.uiSetting.inFileFloatingWindowLeft = this.containerEl.style.left;
		this.uiSetting.inFileFloatingWindowTop = this.containerEl.style.top;
		this.uiSetting.inFileFloatingWindowWidth = this.containerEl.style.width;
		this.uiSetting.inFileFloatingWindowHeight = this.containerEl.style.height;
	}
}
