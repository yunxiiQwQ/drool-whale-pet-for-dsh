window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-client-plugin-drool-whale-pet",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		//#region src/client/config-writes.ts
		function createConfigWriteQueue(endpoint, fetcher) {
			let tail = Promise.resolve();
			return (patch) => {
				const execute = async () => {
					const response = await (fetcher ?? fetch)(endpoint, {
						method: "PATCH",
						headers: { "content-type": "application/json" },
						body: JSON.stringify(patch)
					});
					if (!response.ok) throw new Error(`settings write failed: ${response.status}`);
					return await response.json();
				};
				const result = tail.then(execute, execute);
				tail = result.then(() => void 0, () => void 0);
				return result;
			};
		}
		const writeCompanionConfig = createConfigWriteQueue("/plugins/drool-whale-pet/config");
		//#endregion
		//#region src/client/companion-settings.ts
		const CONFIG_ENDPOINT$1 = "/plugins/drool-whale-pet/config";
		const SLOT_NAME = "settings.plugin.item";
		const SLOT_KEY = "drool-whale-pet";
		const cardStyle = {
			listStyle: "none",
			border: "1px solid var(--border-color, #d8d8d8)",
			borderRadius: 12,
			padding: 16,
			background: "var(--surface-color, transparent)",
			display: "grid",
			gap: 14
		};
		const rowStyle = {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			gap: 20
		};
		const selectStyle = {
			minWidth: 120,
			padding: "6px 10px",
			borderRadius: 8
		};
		const BUBBLE_STATE_OPTIONS = [
			["IDLE", "空闲"],
			["THINKING", "思考中"],
			["WORKING", "工作中"],
			["WAITING", "等待确认"],
			["SUCCESS", "完成"],
			["ERROR", "错误"]
		];
		const bubbleGridStyle = {
			display: "grid",
			gridTemplateColumns: "repeat(3, auto)",
			gap: "6px 14px",
			padding: "10px 12px",
			border: "1px solid var(--border-color, #d8d8d8)",
			borderRadius: 8
		};
		function createCardModule(React) {
			const h = React.createElement;
			function Field({ label, hint, children }) {
				return h("label", { style: rowStyle }, h("span", null, h("span", { style: {
					display: "block",
					fontWeight: 600
				} }, label), h("small", { style: {
					display: "block",
					opacity: .65,
					marginTop: 3
				} }, hint)), children);
			}
			function BubbleStatePicker({ value, disabled, onChange }) {
				const selected = Array.isArray(value) ? value : [];
				const toggle = (state, checked) => {
					const next = new Set(selected);
					if (checked) next.add(state);
					else next.delete(state);
					onChange([...next]);
				};
				return h("div", { style: bubbleGridStyle }, ...BUBBLE_STATE_OPTIONS.map(([state, label]) => h("label", {
					key: state,
					style: {
						display: "flex",
						alignItems: "center",
						gap: 4
					}
				}, h("input", {
					type: "checkbox",
					checked: selected.includes(state),
					disabled,
					onChange: (event) => toggle(state, event.target.checked)
				}), label)));
			}
			function CompanionCard() {
				const [status, setStatus] = React.useState("loading");
				const [value, setValue] = React.useState({});
				const [busy, setBusy] = React.useState(false);
				const patchSeq = React.useRef(0);
				const sliderTimers = React.useRef(/* @__PURE__ */ new Map());
				const writable = status === "ready";
				React.useEffect(() => {
					let active = true;
					fetch(CONFIG_ENDPOINT$1, { cache: "no-store" }).then(async (response) => {
						if (!response.ok) throw new Error(`settings request failed: ${response.status}`);
						return await response.json();
					}).then((next) => {
						if (active) {
							setValue(next);
							setStatus("ready");
						}
					}).catch(() => {
						if (active) setStatus("unavailable");
					});
					return () => {
						active = false;
						for (const timer of sliderTimers.current.values()) clearTimeout(timer);
						sliderTimers.current.clear();
					};
				}, []);
				const write = async (field, next) => {
					const seq = ++patchSeq.current;
					setValue((prev) => ({
						...prev,
						[field]: next
					}));
					setBusy(true);
					try {
						const updated = await writeCompanionConfig({ [field]: next });
						if (seq === patchSeq.current) {
							setValue(updated);
							setStatus("ready");
						}
					} catch {
						if (seq === patchSeq.current) setStatus("unavailable");
					} finally {
						if (seq === patchSeq.current) setBusy(false);
					}
				};
				const writeSlider = (field, next) => {
					setValue((prev) => ({
						...prev,
						[field]: next
					}));
					patchSeq.current += 1;
					const pending = sliderTimers.current.get(field);
					if (pending) clearTimeout(pending);
					const timer = setTimeout(() => {
						sliderTimers.current.delete(field);
						write(field, next);
					}, 250);
					sliderTimers.current.set(field, timer);
				};
				return h("li", {
					style: cardStyle,
					"data-testid": "drool-whale-pet-settings",
					"data-skin-chrome": "companion-card"
				}, h("div", null, h("strong", { style: { fontSize: 16 } }, "鲸鱼桌宠"), h("p", { style: {
					margin: "5px 0 0",
					opacity: .72
				} }, "入口和状态属于 DSH，鲸鲸始终显示在 Windows 桌面最上层；DSH 最小化时也会继续陪伴。")), status === "unavailable" ? h("span", { role: "status" }, "鲸鱼桌宠设置尚未连接到 DSH Host。") : status === "loading" ? h("span", null, "正在读取设置…") : h(React.Fragment, null, h(Field, {
					label: "启用鲸鱼桌宠",
					hint: "关闭后立即退出；重新开启无需单独启动程序。"
				}, h("input", {
					type: "checkbox",
					checked: value.enabled !== false,
					disabled: !writable,
					onChange: (event) => void write("enabled", event.target.checked)
				})), h(Field, {
					label: "角色大小",
					hint: `${Math.round((value.scale ?? 1) * 100)}%`
				}, h("input", {
					type: "range",
					min: .4,
					max: 1.4,
					step: 1e-4,
					value: value.scale ?? 1,
					disabled: status !== "ready",
					onChange: (event) => void writeSlider("scale", Number(event.target.value))
				})), h(Field, {
					label: "活跃程度",
					hint: "控制空闲时微动作的出现频率。"
				}, h("select", {
					value: value.activityLevel ?? "normal",
					disabled: !writable,
					style: selectStyle,
					onChange: (event) => void write("activityLevel", event.target.value)
				}, h("option", { value: "quiet" }, "安静"), h("option", { value: "normal" }, "标准"), h("option", { value: "lively" }, "活泼"))), h(Field, {
					label: "减少动态效果",
					hint: "减少走动、循环帧和程序化晃动。"
				}, h("input", {
					type: "checkbox",
					checked: value.reducedMotion === true,
					disabled: !writable,
					onChange: (event) => void write("reducedMotion", event.target.checked)
				})), h(Field, {
					label: "气泡显示",
					hint: "常驻显示、完全隐藏，或自定义哪些状态显示气泡。"
				}, h("select", {
					value: value.bubbleMode ?? "always",
					disabled: !writable,
					style: selectStyle,
					onChange: (event) => void write("bubbleMode", event.target.value)
				}, h("option", { value: "always" }, "常驻显示"), h("option", { value: "hidden" }, "完全隐藏"), h("option", { value: "custom" }, "自定义显示状态"))), (value.bubbleMode ?? "always") !== "hidden" ? h(Field, {
					label: "气泡大小",
					hint: `${Math.round((value.bubbleScale ?? 1) * 100)}%`
				}, h("input", {
					type: "range",
					min: .6,
					max: 1.2,
					step: .01,
					value: value.bubbleScale ?? 1,
					disabled: status !== "ready",
					onChange: (event) => void writeSlider("bubbleScale", Number(event.target.value))
				})) : null, (value.bubbleMode ?? "always") === "custom" ? h(Field, {
					label: "自定义显示状态",
					hint: "勾选后，只有这些状态出现时才会显示气泡。"
				}, h(BubbleStatePicker, {
					value: value.bubbleStates ?? [
						"SUCCESS",
						"ERROR",
						"WAITING"
					],
					disabled: !writable,
					onChange: (next) => void write("bubbleStates", next)
				})) : null, h(Field, {
					label: "响应子 Agent",
					hint: "默认只跟随顶层任务，避免状态过度跳动。"
				}, h("input", {
					type: "checkbox",
					checked: value.includeSubagents === true,
					disabled: !writable,
					onChange: (event) => void write("includeSubagents", event.target.checked)
				})), busy ? h("small", { role: "status" }, "正在保存…") : null));
			}
			return { CompanionCard };
		}
		/** Register the companion settings card; react and slot failures stay local to this card. */
		function registerCompanionSettingsCard(ctx) {
			const slotsCtx = ctx;
			const { CompanionCard } = createCardModule(react);
			const registerCard = () => {
				try {
					slotsCtx.slots?.register?.({
						name: SLOT_NAME,
						key: SLOT_KEY,
						id: SLOT_KEY,
						order: 30,
						inject: () => ({})
					}, CompanionCard);
				} catch (error) {
					console.error("[drool-whale-pet] failed to register companion settings card:", error);
				}
			};
			try {
				slotsCtx.slots?.inject?.(SLOT_NAME, registerCard);
			} catch (error) {
				console.error("[drool-whale-pet] failed to inject settings slot:", error);
			}
		}
		//#endregion
		//#region \0dsh-css:src/client/companion.module.css.mjs
		const css = ".vkmUDG_quickToggle{right:max(16px, env(safe-area-inset-right));bottom:max(16px, env(safe-area-inset-bottom));z-index:8;border:2px solid var(--border-color,#8cb9d0);width:44px;height:44px;color:var(--text-color,#17364a);background:var(--surface-color,#f6fbfd);cursor:pointer;opacity:.94;border-radius:15px;justify-content:center;align-items:center;padding:0;transition:opacity .14s,filter .14s,border-color .14s;display:inline-flex;position:fixed;box-shadow:0 8px 20px #315d7829}.vkmUDG_quickToggle:hover{opacity:1}.vkmUDG_quickToggle[data-pet-on=off]{opacity:.5;filter:grayscale(.85)}.vkmUDG_quickToggleIcon{pointer-events:none;font-size:25px;line-height:1}";
		const tagId = "@dsh-external/dsh-client-plugin-drool-whale-pet/companion.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@dsh-external/dsh-client-plugin-drool-whale-pet";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var companion_module_css_default = {
			"quickToggle": "vkmUDG_quickToggle",
			"quickToggleIcon": "vkmUDG_quickToggleIcon"
		};
		//#endregion
		//#region src/client/quick-toggle.ts
		const CONFIG_ENDPOINT = "/plugins/drool-whale-pet/config";
		function createQuickToggle(root) {
			const button = document.createElement("button");
			button.type = "button";
			button.className = companion_module_css_default.quickToggle ?? "";
			button.dataset.droolWhalePet = "toggle";
			button.setAttribute("aria-label", "鲸鱼桌宠开关");
			const icon = document.createElement("span");
			icon.className = companion_module_css_default.quickToggleIcon ?? "";
			icon.textContent = "🐳";
			icon.setAttribute("aria-hidden", "true");
			button.append(icon);
			let enabled = true;
			let patchSeq = 0;
			let disposed = false;
			let positionFrame;
			const sync = () => {
				button.dataset.petOn = enabled ? "on" : "off";
				button.setAttribute("aria-pressed", String(enabled));
				button.title = enabled ? "鲸鱼桌宠：开（点击关闭）" : "鲸鱼桌宠：关（点击开启）";
			};
			const position = () => {
				positionFrame = void 0;
				const bounds = root.querySelector("[role=\"tree\"]")?.getBoundingClientRect();
				if (bounds && bounds.width > 0 && bounds.height > 0) {
					button.style.left = `${Math.round(bounds.right - 54)}px`;
					button.style.right = "auto";
					return;
				}
				button.style.removeProperty("left");
				button.style.removeProperty("right");
			};
			const schedulePosition = () => {
				if (positionFrame !== void 0) return;
				positionFrame = window.requestAnimationFrame(position);
			};
			const writeEnabled = async (next) => {
				const seq = ++patchSeq;
				enabled = next;
				sync();
				try {
					const config = await writeCompanionConfig({ enabled: next });
					if (seq === patchSeq) {
						enabled = config.enabled !== false;
						if (!disposed) sync();
					}
				} catch {}
			};
			const onClick = () => {
				writeEnabled(!enabled);
			};
			button.addEventListener("click", onClick);
			root.append(button);
			sync();
			schedulePosition();
			const observer = new MutationObserver(schedulePosition);
			observer.observe(root, {
				childList: true,
				subtree: true
			});
			window.addEventListener("resize", schedulePosition);
			fetch(CONFIG_ENDPOINT, { cache: "no-store" }).then(async (response) => {
				if (!response.ok) return;
				enabled = (await response.json()).enabled !== false;
				if (!disposed) sync();
			}).catch(() => {});
			return { dispose: () => {
				if (disposed) return;
				disposed = true;
				observer.disconnect();
				window.removeEventListener("resize", schedulePosition);
				if (positionFrame !== void 0) window.cancelAnimationFrame(positionFrame);
				button.removeEventListener("click", onClick);
				button.remove();
			} };
		}
		//#endregion
		//#region src/client/index.ts
		const inject = ["slots"];
		function apply(ctx) {
			registerCompanionSettingsCard(ctx);
			const toggle = createQuickToggle(document.body);
			ctx.effect(() => () => toggle.dispose(), "drool-whale-pet: quick toggle");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map