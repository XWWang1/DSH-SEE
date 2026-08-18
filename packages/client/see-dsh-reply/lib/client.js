window.__ModuleLoader__.load({
	id: "see-dsh-reply",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:E:\deepseek-harness\packages\client\see-dsh-reply\src\client\ReplyAction.module.css.mjs
		const css = ".HDYzWG_capsule{color:#fff;white-space:nowrap;cursor:pointer;background:#1a73e8;border:none;border-radius:999px;justify-content:center;align-items:center;height:24px;margin:0 2px;padding:0 14px;font-size:12px;line-height:1;display:inline-flex}.HDYzWG_capsule:hover{color:#fff;background:#1557b0}";
		const tagId = "see-dsh-reply/ReplyAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "see-dsh-reply";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ReplyAction_module_css_default = { "capsule": "HDYzWG_capsule" };
		//#endregion
		//#region lib/types/client/ReplyAction.js
		/**
		* The SEE reply capsule: a blue pill labeled 回复 sitting in the assistant
		* message's action strip between the like/dislike icons and branch. Clicking
		* it hands the message text and session identity to the SEE host page.
		* @module see-dsh-reply/client/ReplyAction
		*/
		/** Rendered only when a host page embeds the app; standalone hides it. */
		const embedded = typeof window !== "undefined" && window.parent !== window;
		/**
		* One message's SEE reply capsule.
		* @param props - the owner's message identity, the session standard kit, and copy.
		* @returns the capsule button, or null when not iframe-embedded.
		*/
		function ReplyAction({ messageId, sessionId, useSession, t }) {
			const text = useSession((snapshot) => {
				for (const node of snapshot.chat.nodes.values()) {
					if (node.kind !== "turn-tail") continue;
					const data = node.data;
					if (data?.closing?.finalNode.messageId !== messageId) continue;
					return data.closing.blocks.filter((b) => b.kind === "text").map((b) => b.text ?? "").join("");
				}
				return "";
			});
			const onReply = (0, react.useCallback)(() => {
				if (!embedded || text === "") return;
				window.parent.postMessage({
					type: "see-dsh-reply",
					sessionId,
					text
				}, "*");
			}, [sessionId, text]);
			if (!embedded) return null;
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: t("capsule"),
				side: "bottom",
				children: (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ReplyAction_module_css_default.capsule,
					"aria-label": t("capsule"),
					onClick: onReply,
					children: t("label")
				})
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** `seeReply` namespace dictionaries. */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"capsule": "回复给提交人",
			"label": "回复"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"capsule": "Reply to submitter",
			"label": "Reply"
		};
		//#endregion
		//#region lib/types/client/index.js
		/**
		* SEE reply bridge plugin, browser half: a blue "回复" capsule in the
		* conversation.chat.assistant-actions strip. Clicking it forwards the closing
		* assistant message's text plus the sessionId to the SEE host page via
		* window.parent.postMessage, which then drives the reply delivery. Renders
		* nothing unless embedded in an iframe (standalone DSH has no listener).
		* @module see-dsh-reply/client
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "seeReply";
		/** Required services: the slot registry and the copy. */
		const inject = ["slots", "locale"];
		/**
		* Client plugin body: the SEE reply capsule entry.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "see-dsh-reply: dictionaries");
			ctx.slots.inject("conversation.chat.assistant-actions", () => {
				const dispose = ctx.slots.register({
					name: "conversation.chat.assistant-actions",
					id: "see-reply",
					order: 20,
					locale: NS
				}, ReplyAction);
				return () => {
					dispose();
				};
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map