import { app } from "../../scripts/app.js";
import { addCaseTemplateUI, serializedCaseTemplateValue } from "./case_template_ui.js";
import { addOfficialPresetUI } from "./official_preset_previews.js";
import {
    copyLocalModelDirectory,
    openLlamaCppPythonWheels,
    showLocalQwenStatus,
} from "./local_qwen_status.js";
import { showRedactedDiagnostics } from "./diagnostics_viewer.mjs";
import { showProviderCapability } from "./provider_capability_ui.mjs";
import { addCompletionRecoveryButton } from "./completion_recovery_ui.mjs";
import { addDirectionalSkillUI, directionalSkillId, directionalSkillLabel, isDirectionalSkillEnabled } from "./h3_directional_skill_ui.mjs";
import { addQualityUI, qualityLabel, creationLabel } from "./h3_quality_ui.mjs";
import {
    bindOpenAIProviderPersistence,
    expandNamedWidgetValues,
    namedWidgetValueMap,
    restoreOpenAIProviderState,
    restoreNamedWidgetValues,
    serializedOpenAIProviderState,
    serializeOpenAIProviderState,
    serializeNamedWidgetValues,
} from "./widget_state.mjs";


const NODE_ID = "MiniMaxH3PromptEnhancerT8";
const SIGN_UP_URL = "https://api.seedance.nz/sign-up?aff=5f4w";
const AI_WORKSHOP_SIGN_UP_URL = "https://ai.t8star.org/register?aff=dP7j";
const LOCAL_SKILL_BUNDLE_URL = "https://github.com/T8mars/minimax-h3-prompt-skill-T8";
const SEEDANCE_API_MODE = "Seedance (Recommended)";
const AI_WORKSHOP_API_MODE = "T8 AI Workshop (Images / Video)";
const OPENAI_API_MODE = "OpenAI-Compatible API (Backup)";
const LOCAL_QWEN_API_MODE = "Local GGUF (llama.cpp / Qwen, Offline)";
const LEGACY_LOCAL_QWEN_API_MODE = "本地 Qwen3.8-27B（GGUF，离线）";
const LEGACY_API_MODE_LABELS = {
    "贞贞平价小屋（推荐）": SEEDANCE_API_MODE,
    "贞贞的AI工坊（图片/视频）": AI_WORKSHOP_API_MODE,
    "OpenAI兼容接口（备用）": OPENAI_API_MODE,
    "本地 GGUF（llama.cpp / Qwen，离线）": LOCAL_QWEN_API_MODE,
};
const isLocalApiMode = (value) => [LOCAL_QWEN_API_MODE, LEGACY_LOCAL_QWEN_API_MODE, "本地 GGUF（llama.cpp / Qwen，离线）"].includes(value);
const AI_WORKSHOP_DEFAULT_MODEL = "gemini-3.5-flash";
const CUSTOM_MODEL_OPTION = "Custom";
const AUTO_SHOT_COUNT = "AUTO (System Decides)";
const SHOT_COUNT_OPTIONS = [AUTO_SHOT_COUNT, ...Array.from({ length: 20 }, (_, index) => String(index + 1))];
const COMPAT_SKILL_PROFILE = "Compatibility (Preserve Chinese/English)";
const STRICT_SKILL_PROFILE = "Strict Official Skill (English-Only Protocol)";
const OFFICIAL_SKILL_PROFILES = [COMPAT_SKILL_PROFILE, STRICT_SKILL_PROFILE];
const NO_CREATIVE_PRESET = "No Preset (Core Rules Only)";
const NO_CASE_TEMPLATE = "None (not using T8 case)";
const MV_CREATIVE_PRESET = "Official Music Video Kinetic Typography";
const LEGACY_MV_CREATIVE_PRESET = "MV / 歌词贴字";
const CREATIVE_PRESET_OPTIONS = [
    NO_CREATIVE_PRESET,
    "AUTO (Infer from User Intent)",
    "Minimalist Product Advertisement",
    "3D Animation Short",
    "Brand Promotional Video",
    MV_CREATIVE_PRESET,
    "Two-Player Co-op Game Intro",
    "Paper-Collage Explainer",
    "Papercraft Stop-Motion Explainer",
    "Hand-Drawn and Live-Action Fusion",
];
const LEGACY_CREATIVE_PRESET_LABELS = {
    "无（仅核心规则）": NO_CREATIVE_PRESET,
    "AUTO（根据意图判断）": "AUTO (Infer from User Intent)",
    "极简产品广告": "Minimalist Product Advertisement",
    "3D 动画短片": "3D Animation Short",
    "品牌宣传短片": "Brand Promotional Video",
    "音乐 MV 动态字幕（官方）": MV_CREATIVE_PRESET,
    "MV / 歌词贴字": MV_CREATIVE_PRESET,
    "双人合作游戏开场": "Two-Player Co-op Game Intro",
    "纸拼贴讲解": "Paper-Collage Explainer",
    "立体纸艺停格讲解": "Papercraft Stop-Motion Explainer",
    "手绘实拍融合": "Hand-Drawn and Live-Action Fusion",
};
const OFFICIAL_ENHANCEMENT = "Official Enhancement";
const REFERENCE_TEMPLATE_FUSION = "Reference Template Fusion";
const LEGACY_PROMPT_MODE_LABELS = {
    "官方增强": OFFICIAL_ENHANCEMENT,
    "参考模板融合": REFERENCE_TEMPLATE_FUSION,
};
const LEGACY_SKILL_PROFILE_LABELS = {
    "现有兼容（保留中英文）": COMPAT_SKILL_PROFILE,
    "官方 Skill 严格（全英文协议）": STRICT_SKILL_PROFILE,
};
const LEGACY_SHOT_COUNT_LABELS = { "AUTO（系统自动判断）": AUTO_SHOT_COUNT };
const LOCAL_THINK_OPTIONS = ["Off (Recommended, Faster)", "On (Higher Quality)"];
const LEGACY_LOCAL_THINK_LABELS = {
    "关闭（推荐，速度优先）": LOCAL_THINK_OPTIONS[0],
    "开启（质量优先）": LOCAL_THINK_OPTIONS[1],
};
const LOCAL_UNLOAD_OPTIONS = ["Unload After Run (Recommended)", "Keep Loaded", "Unload After 10 Minutes Idle"];
const LEGACY_LOCAL_UNLOAD_LABELS = {
    "执行后卸载（推荐）": LOCAL_UNLOAD_OPTIONS[0],
    "保持驻留": LOCAL_UNLOAD_OPTIONS[1],
    "空闲10分钟后卸载": LOCAL_UNLOAD_OPTIONS[2],
};
const LOCAL_COMFY_MEMORY_OPTIONS = ["AUTO (Release ComfyUI Models if VRAM Is Low)", "Keep ComfyUI Models Loaded"];
const LEGACY_LOCAL_COMFY_MEMORY_LABELS = {
    "AUTO（显存不足时释放）": LOCAL_COMFY_MEMORY_OPTIONS[0],
    "不主动释放 ComfyUI 模型": LOCAL_COMFY_MEMORY_OPTIONS[1],
};
const MV_PROMPT_PLACEHOLDER = [
    "MV类型/音乐类型/视觉风格：",
    "歌词原文（逐字锁定，可空）：",
    "无歌词时：器乐 / 允许生成原创歌词",
    "演唱者或离屏人声：",
    "已知 BPM、歌词时间点或节拍事件（可空，节点不分析音频）：",
    "目标平台/画幅（可空）：",
    "字体包装与禁止项：",
].join("\n");
const MV_PROMPT_TOOLTIP = "官方 music-video-subtitle-generator v0.6.6：基础提示词可按占位模板填写。用户歌词会逐字锁定；只有明确写出“允许生成原创歌词”时才会补写短篇原创歌词。器乐、纯文字或离屏人声 MV 可以不填写演唱者。";
const MV_REFERENCE_CONTEXT_TOOLTIP = "MV 参考角色映射示例：<Picture 1>=人物外观；<Picture 2>=场景与灯光；<Picture 3>=字体包装，只参考字体、版式和动效，不参考人物与场景。";
const MV_CONSTRAINTS_TOOLTIP = "MV 硬性要求示例：不增加歌词；不遮挡眼睛与关键口型；不用淡入淡出；固定保留指定服装或场景。";
const MV_TEMPLATE_TOOLTIP = "仅迁移模板的镜头组织、节奏、运镜、转场和视觉语法；模板人物、歌词、BPM、标题、剧情和镜头数不会覆盖用户内容。";

const TASK_TYPE_LABELS = {
    T2VA: "T2VA (Text-to-Video and Audio)",
    I2VA: "I2VA (First-Frame Image-to-Video and Audio)",
    FL2VA: "FL2VA (First/Last-Frame Image-to-Video and Audio)",
    L2VA: "L2VA (Last-Frame Image-to-Video and Audio)",
    Ref2VA: "Ref2VA (Reference Image/Video-to-Video and Audio)",
};
const LEGACY_TASK_TYPE_LABELS = {
    "T2VA（文生音视频）": TASK_TYPE_LABELS.T2VA,
    "I2VA（首帧图生音视频）": TASK_TYPE_LABELS.I2VA,
    "FL2VA（首尾帧生音视频）": TASK_TYPE_LABELS.FL2VA,
    "L2VA（尾帧图生音视频）": TASK_TYPE_LABELS.L2VA,
    "Ref2VA（参考图/视频生音视频）": TASK_TYPE_LABELS.Ref2VA,
};
const LEGACY_UI_VALUES = new Set(["展开", "收起", "提交当前工作流", "打开 Seedance 注册页面"]);
const API_KEY_PATTERN = /^sk-[A-Za-z0-9_-]{16,}$/;
const SERIALIZED_WIDGET_NAMES = [
    "prompt",
    "task_type",
    "duration_seconds",
    "shot_count",
    "rewrite_mode",
    "description_word_target",
    "output_language",
    "prompt_mode",
    "official_skill_profile",
    "creative_preset",
    "case_template",
    "api_mode",
    "ai_workshop_model",
    "custom_model",
    "reference_context",
    "constraints",
    "api_key",
    "reference_template",
    "openai_base_url",
    "openai_video_urls",
    "seed",
    "control_after_generate",
    "local_model",
    "local_mmproj",
    "local_context_size",
    "local_max_tokens",
    "local_think_mode",
    "local_reasoning_effort",
    "local_video_sample_fps",
    "local_unload_policy",
    "local_comfy_memory_policy",
    "relay_mode",
    "relay_event_count",
    "relay_duration_seconds",
    "relay_time_ranges",
    "director_skill",
    "quality_mode",
    "creation_mode",
];
const LOCAL_WIDGET_DEFAULTS = {
    local_model: "Qwen3.8-27B-Q4_K_M.gguf",
    local_mmproj: "mmproj-F16.gguf",
    local_context_size: 32768,
    local_max_tokens: 16384,
    local_think_mode: "关闭（推荐，速度优先）",
    local_reasoning_effort: "medium",
    local_video_sample_fps: 2.0,
    local_unload_policy: "执行后卸载（推荐）",
    local_comfy_memory_policy: "AUTO（显存不足时释放）",
    relay_mode: "普通增强 / Normal",
    relay_event_count: 0,
    relay_duration_seconds: 0,
    relay_time_ranges: "",
    director_skill: "关闭 / Off",
    quality_mode: "保持原样 / Off",
    creation_mode: "原有编排 / Original",
};


function setWidgetVisible(widget, visible) {
    if (!("t8OriginalType" in widget)) {
        widget.t8OriginalType = widget.type;
        widget.t8OriginalComputeSize = widget.computeSize;
        widget.t8OriginalDisplay = widget.element?.style.display || "";
        widget.t8OriginalHidden = Boolean(widget.hidden);
    }

    widget.type = visible ? widget.t8OriginalType : "converted-widget";
    widget.computeSize = visible ? widget.t8OriginalComputeSize : () => [0, -4];
    widget.hidden = visible ? widget.t8OriginalHidden : true;
    if (widget.element) {
        widget.element.dataset.shouldHide = visible ? "false" : "true";
        widget.element.style.display = visible ? widget.t8OriginalDisplay : "none";
        widget.element.hidden = !visible;
    }
}


function resizeNode(node) {
    const apply = () => {
        for (const widget of node.widgets || []) {
            if (widget.element) delete widget.computedHeight;
        }
        node.setSize([node.size[0], node.computeSize()[1]]);
        node.setDirtyCanvas(true, true);
        app.canvas?.setDirty?.(true, true);
    };
    requestAnimationFrame(() => {
        apply();
        requestAnimationFrame(apply);
    });
}


function isApiKeyLinked(node) {
    const input = node.inputs?.find((item) => item.name === "api_key" || item.widget?.name === "api_key");
    return input?.link != null;
}


function normalizeChoice(widget, options, fallback, aliases = {}) {
    if (!widget) return;
    if (Object.prototype.hasOwnProperty.call(aliases, widget.value)) widget.value = aliases[widget.value];
    if (!options.includes(widget.value)) widget.value = fallback;
}


function setTextWidgetValue(widget, value) {
    if (!widget) return;
    widget.value = value;
    const input = widget.inputEl
        || (widget.element?.matches?.("textarea, input") ? widget.element : null)
        || widget.element?.querySelector?.("textarea, input");
    if (input) input.value = value;
}


function getWidgetInput(widget) {
    return widget?.inputEl
        || (widget?.element?.matches?.("textarea, input") ? widget.element : null)
        || widget?.element?.querySelector?.("textarea, input")
        || null;
}


function addMvPresetBehavior(node, presetWidget, promptWidget, referenceContextWidget, constraintsWidget, templateWidget) {
    const tracked = [
        [promptWidget, MV_PROMPT_TOOLTIP, MV_PROMPT_PLACEHOLDER],
        [referenceContextWidget, MV_REFERENCE_CONTEXT_TOOLTIP, ""],
        [constraintsWidget, MV_CONSTRAINTS_TOOLTIP, ""],
        [templateWidget, MV_TEMPLATE_TOOLTIP, ""],
    ].filter(([widget]) => Boolean(widget));

    for (const [widget] of tracked) {
        if (!("t8MvOriginalTooltip" in widget)) widget.t8MvOriginalTooltip = widget.tooltip || "";
    }

    const update = (preset = presetWidget.value) => {
        const isMv = preset === MV_CREATIVE_PRESET && !isDirectionalSkillEnabled(node.widgets?.find((widget) => widget.name === "director_skill")?.value);
        for (const [widget, mvTooltip, mvPlaceholder] of tracked) {
            widget.tooltip = isMv ? mvTooltip : widget.t8MvOriginalTooltip;
            const input = getWidgetInput(widget);
            if (!input) continue;
            if (!("t8MvOriginalPlaceholder" in widget)) {
                widget.t8MvOriginalPlaceholder = input.placeholder || "";
            }
            input.placeholder = isMv && mvPlaceholder ? mvPlaceholder : widget.t8MvOriginalPlaceholder;
            input.title = widget.tooltip;
        }
        node.setDirtyCanvas(true, true);
    };

    const originalCallback = presetWidget.callback;
    presetWidget.callback = function (value) {
        originalCallback?.apply(this, arguments);
        update(value);
    };
    node.t8UpdateMvPreset = update;
    update();
    requestAnimationFrame(() => update());
}


function addAdvancedToggle(node, widgets) {
    let expanded = false;
    for (const widget of widgets) setWidgetVisible(widget, expanded);

    const toggle = node.addWidget(
        "button",
        "⚙️ Advanced Options (Optional)",
        "Expand",
        () => {
            expanded = !expanded;
            for (const widget of widgets) setWidgetVisible(widget, expanded);
            toggle.value = expanded ? "Collapse" : "Expand";
            resizeNode(node);
        },
        { serialize: false },
    );
    toggle.serializeValue = () => undefined;
}


function addReferenceTemplateBehavior(node, modeWidget, templateWidget) {
    const update = (mode = modeWidget.value) => {
        if (LEGACY_UI_VALUES.has(String(templateWidget.value || "").trim())) {
            setTextWidgetValue(templateWidget, "");
        }
        setWidgetVisible(templateWidget, mode === REFERENCE_TEMPLATE_FUSION && !isDirectionalSkillEnabled(node.widgets?.find((widget) => widget.name === "director_skill")?.value));
        resizeNode(node);
    };
    const originalCallback = modeWidget.callback;
    modeWidget.callback = function (value) {
        originalCallback?.apply(this, arguments);
        update(value);
    };
    node.t8UpdateReferenceTemplate = update;
    update();
}


function addApiModeBehavior(node, modeWidget, baseUrlWidget, videoUrlsWidget, modelWidget, customModelWidget, localWidgets) {
    const updateModel = () => {
        const workshop = modeWidget.value === AI_WORKSHOP_API_MODE;
        const compatible = modeWidget.value === OPENAI_API_MODE;
        setWidgetVisible(modelWidget, workshop);
        setWidgetVisible(customModelWidget, compatible || (workshop && modelWidget.value === CUSTOM_MODEL_OPTION));
        customModelWidget.label = compatible ? "OpenAI Model ID (Required)" : "AI Workshop Custom Model ID";
    };
    const originalModelCallback = modelWidget.callback;
    modelWidget.callback = function (value) {
        originalModelCallback?.apply(this, arguments);
        updateModel();
        resizeNode(node);
    };
    const update = (mode = modeWidget.value) => {
        for (const widget of [baseUrlWidget, videoUrlsWidget]) {
            if (LEGACY_UI_VALUES.has(String(widget.value || "").trim())) setTextWidgetValue(widget, "");
        }
        const compatible = mode === OPENAI_API_MODE;
        const local = isLocalApiMode(mode);
        baseUrlWidget.label = "OpenAI Base URL";
        videoUrlsWidget.label = "Video URLs (Optional, One Per Line)";
        setWidgetVisible(baseUrlWidget, compatible);
        setWidgetVisible(videoUrlsWidget, compatible);
        for (const widget of localWidgets || []) setWidgetVisible(widget, local);
        updateModel();
        if (node.t8SignUpWidget) {
            setWidgetVisible(node.t8SignUpWidget, !compatible && !local);
            const signupLabel = mode === AI_WORKSHOP_API_MODE
                ? "🔑 Get AI Workshop API Key"
                : "🔑 Get Seedance API Key";
            node.t8SignUpWidget.label = signupLabel;
            node.t8SignUpWidget.name = signupLabel;
        }
        if (node.t8ApiKeySecureWidget) setWidgetVisible(node.t8ApiKeySecureWidget, !local);
        if (node.t8LocalQwenStatusWidget) setWidgetVisible(node.t8LocalQwenStatusWidget, local);
        node.t8UpdateApiKeyPlaceholder?.();
        resizeNode(node);
    };
    const originalCallback = modeWidget.callback;
    modeWidget.callback = function (value) {
        originalCallback?.apply(this, arguments);
        update(value);
    };
    node.t8UpdateApiMode = update;
    update();
}


function addApiKeyWidget(node, sourceWidget, apiModeWidget) {
    const container = document.createElement("div");
    container.style.cssText = [
        "display:flex",
        "flex-direction:column",
        "gap:6px",
        "width:100%",
    ].join(";");

    const inputRow = document.createElement("div");
    inputRow.style.cssText = [
        "display:flex",
        "align-items:center",
        "gap:6px",
        "width:100%",
        "height:30px",
    ].join(";");

    const input = document.createElement("input");
    input.type = "password";
    const updatePlaceholder = () => {
        if (isApiKeyLinked(node)) {
            input.placeholder = "External API Key STRING connected (connected value takes priority)";
        } else if (apiModeWidget?.value === OPENAI_API_MODE) {
            input.placeholder = "OpenAI-compatible API Key (saved to workflow when entered)";
        } else if (apiModeWidget?.value === AI_WORKSHOP_API_MODE) {
            input.placeholder = "AI Workshop API Key (saved to workflow when entered)";
        } else if (isLocalApiMode(apiModeWidget?.value)) {
            input.placeholder = "API Key is not required in local mode";
        } else {
            input.placeholder = "Seedance API Key (saved to workflow when entered)";
        }
    };
    node.t8UpdateApiKeyPlaceholder = updatePlaceholder;
    updatePlaceholder();
    input.autocomplete = "new-password";
    input.spellcheck = false;
    input.style.cssText = [
        "flex:1",
        "min-width:0",
        "height:28px",
        "box-sizing:border-box",
        "border:1px solid var(--border-color, #555)",
        "border-radius:6px",
        "background:var(--comfy-input-bg, #1f1f1f)",
        "color:var(--input-text, #ddd)",
        "padding:0 9px",
    ].join(";");

    const reveal = document.createElement("button");
    reveal.type = "button";
    reveal.textContent = "Show";
    reveal.title = "Show or hide the API Key";
    reveal.style.cssText = [
        "height:28px",
        "padding:0 9px",
        "border:1px solid var(--border-color, #555)",
        "border-radius:6px",
        "background:var(--comfy-input-bg, #2a2a2a)",
        "color:var(--input-text, #ddd)",
        "cursor:pointer",
    ].join(";");
    reveal.onclick = () => {
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        reveal.textContent = show ? "Hide" : "Show";
    };

    inputRow.append(input, reveal);

    const actionRow = document.createElement("div");
    actionRow.style.cssText = [
        "display:flex",
        "gap:6px",
        "width:100%",
        "height:28px",
    ].join(";");

    const save = document.createElement("button");
    save.type = "button";
    save.textContent = "💾 Save to Workflow";
    save.title = "The API Key will be written to the workflow JSON. Clear it before sharing.";

    const clear = document.createElement("button");
    clear.type = "button";
    clear.textContent = "Clear";
    clear.title = "Remove the API Key from the input and workflow";

    for (const button of [save, clear]) {
        button.style.cssText = [
            "flex:1",
            "height:28px",
            "border:1px solid var(--border-color, #555)",
            "border-radius:6px",
            "background:var(--comfy-input-bg, #2a2a2a)",
            "color:var(--input-text, #ddd)",
            "cursor:pointer",
        ].join(";");
    }
    actionRow.append(save, clear);
    container.append(inputRow, actionRow);

    let value = String(sourceWidget.value || "");
    if (LEGACY_UI_VALUES.has(value.trim())) value = "";
    Object.defineProperty(sourceWidget, "value", {
        configurable: true,
        get() {
            return value;
        },
        set(nextValue) {
            const next = String(nextValue || "");
            value = LEGACY_UI_VALUES.has(next.trim()) ? "" : next;
            input.value = value;
        },
    });
    input.value = value;
    input.addEventListener("input", () => {
        save.textContent = "💾 Save to Workflow";
        node.setDirtyCanvas(true, true);
    });

    const commit = () => {
        if (isApiKeyLinked(node)) {
            updateConnectionState();
            return;
        }
        sourceWidget.value = input.value.trim();
        sourceWidget.callback?.(sourceWidget.value);
        node.graph?.change?.();
        node.setDirtyCanvas(true, true);
        save.textContent = "✓ Saved to Workflow";
    };
    save.onclick = commit;
    clear.onclick = () => {
        input.value = "";
        sourceWidget.value = "";
        sourceWidget.callback?.(sourceWidget.value);
        node.graph?.change?.();
        node.setDirtyCanvas(true, true);
        save.textContent = "💾 Save to Workflow";
    };
    node.t8CommitApiKey = commit;

    const updateConnectionState = () => {
        const linked = isApiKeyLinked(node);
        input.disabled = linked;
        reveal.disabled = linked;
        save.disabled = linked;
        input.title = linked
            ? "Using the external STRING connected to the api_key input. The workflow key below will not override it."
            : "Enter an API Key here and choose whether to save it to the workflow.";
        save.textContent = linked ? "✓ External STRING Connected" : "💾 Save to Workflow";
        updatePlaceholder();
    };
    node.t8UpdateApiKeyConnection = updateConnectionState;
    updateConnectionState();

    setWidgetVisible(sourceWidget, false);
    const secureWidget = node.addDOMWidget("seedance_api_key_secure", "custom", container, {
        getValue: () => "",
        setValue: () => {},
        getMinHeight: () => 78,
        getMaxHeight: () => 78,
        hideOnZoom: false,
        serialize: false,
        beforeResize() {
            delete this.width;
        },
        afterResize(resizedNode) {
            delete this.width;
            resizedNode.setDirtyCanvas(true, true);
        },
        onDraw(widget) {
            if (!("width" in widget)) return;
            delete widget.width;
        },
    });
    delete secureWidget.width;
    secureWidget.serializeValue = () => undefined;
    node.t8ApiKeySecureWidget = secureWidget;
}


export function configureRelayWidgets(node) {
    const mode = node.widgets?.find((widget) => widget.name === "relay_mode");
    const controls = ["relay_event_count", "relay_duration_seconds", "relay_time_ranges"]
        .map((name) => node.widgets?.find((widget) => widget.name === name)).filter(Boolean);
    node.t8UpdateRelayMode = () => {
        if (mode?.value === "普通增强 / Normal") mode.value = "Standard Enhancement";
        if (mode?.value === "Prompt Relay 编排") mode.value = "Prompt Relay Orchestration";
        const enabled = mode?.value === "Prompt Relay Orchestration";
        for (const widget of controls) setWidgetVisible(widget, enabled);
    };
    if (mode) {
        mode.tooltip = "Standard enhancement preserves existing behavior. Connect Relay outputs to Plan's global/local/time + length with timing_mode=seconds; do not also connect typed events. Usually one generation is needed; language or format correction may each require one additional request.";
        const callback = mode.callback;
        mode.callback = (...args) => {
            callback?.apply(mode, args);
            node.t8UpdateRelayMode();
            resizeNode(node);
        };
    }
    node.t8UpdateRelayMode();
}

app.registerExtension({
    name: "T8.MiniMaxH3PromptEnhancer",

    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== NODE_ID) return;

        const originalOnNodeCreated = nodeType.prototype.onNodeCreated;
        const originalOnConfigure = nodeType.prototype.onConfigure;
        const originalOnSerialize = nodeType.prototype.onSerialize;
        const originalOnConnectionsChange = nodeType.prototype.onConnectionsChange;
        nodeType.prototype.onNodeCreated = function () {
            originalOnNodeCreated?.apply(this, arguments);

            const promptWidget = this.widgets?.find((widget) => widget.name === "prompt");
            const outputLanguageWidget = this.widgets?.find((widget) => widget.name === "output_language");
            const rewriteModeWidget = this.widgets?.find((widget) => widget.name === "rewrite_mode");
            const taskTypeWidget = this.widgets?.find((widget) => widget.name === "task_type");
            const shotCountWidget = this.widgets?.find((widget) => widget.name === "shot_count");
            const promptModeWidget = this.widgets?.find((widget) => widget.name === "prompt_mode");
            const officialSkillProfileWidget = this.widgets?.find((widget) => widget.name === "official_skill_profile");
            const creativePresetWidget = this.widgets?.find((widget) => widget.name === "creative_preset");
            const caseTemplateWidget = this.widgets?.find((widget) => widget.name === "case_template");
            const directorSkillWidget = this.widgets?.find((widget) => widget.name === "director_skill");
            const referenceTemplateWidget = this.widgets?.find((widget) => widget.name === "reference_template");
            const referenceContextWidget = this.widgets?.find((widget) => widget.name === "reference_context");
            const constraintsWidget = this.widgets?.find((widget) => widget.name === "constraints");
            const apiKeyWidget = this.widgets?.find((widget) => widget.name === "api_key");
            const apiModeWidget = this.widgets?.find((widget) => widget.name === "api_mode");
            const aiWorkshopModelWidget = this.widgets?.find((widget) => widget.name === "ai_workshop_model");
            const customModelWidget = this.widgets?.find((widget) => widget.name === "custom_model");
            const openaiBaseUrlWidget = this.widgets?.find((widget) => widget.name === "openai_base_url");
            const openaiVideoUrlsWidget = this.widgets?.find((widget) => widget.name === "openai_video_urls");
            const seedWidget = this.widgets?.find((widget) => widget.name === "seed");
            configureRelayWidgets(this);
            addQualityUI(this, { english: true });
            const localWidgets = [
                "local_model", "local_mmproj", "local_context_size", "local_max_tokens",
                "local_think_mode", "local_reasoning_effort", "local_video_sample_fps",
                "local_unload_policy", "local_comfy_memory_policy",
            ].map((name) => this.widgets?.find((widget) => widget.name === name)).filter(Boolean);
            bindOpenAIProviderPersistence(this, openaiBaseUrlWidget, customModelWidget);
            const seedControlWidget = seedWidget?.linkedWidgets?.[0]
                || this.widgets?.find((widget) => widget.name === "control_after_generate");
            if (seedControlWidget) {
                seedControlWidget.label = "Seed Behavior (After Run)";
                seedControlWidget.tooltip = "fixed: keep; randomize: choose randomly; increment: add one; decrement: subtract one.";
            }
            if (rewriteModeWidget) {
                rewriteModeWidget.tooltip = "Rewrite mode controls only the degree of enrichment: strict is conservative, balanced adds detail, and creative allows more stylistic expansion. It does not control the Official Skill language profile.";
            }
            if (officialSkillProfileWidget) {
                officialSkillProfileWidget.label = "H3 Core Writing Skill (Always Active)";
                officialSkillProfileWidget.tooltip = "The nine Official Skills comprise one always-active H3 core writing Skill and eight optional scene Skills. This setting controls the core output language protocol: compatibility mode follows Chinese/English selection, while strict mode requires English descriptions. This is separate from strict rewrite mode.";
            }
            if (creativePresetWidget) {
                creativePresetWidget.label = "MiniMax Official Scene Skill (8 Available)";
                creativePresetWidget.tooltip = "Selecting an Official Scene Skill displays its purpose, recommended input, structural anchors, official GIF, and source below. The GIF is not sent to the LLM. A selected T8 unofficial template takes priority and temporarily disables this setting.";
            }

            this.t8IsT8CaseTemplateActive = () => {
                const value = String(caseTemplateWidget?.value || "").trim();
                return isDirectionalSkillEnabled(directorSkillWidget?.value) || Boolean(value && value !== NO_CASE_TEMPLATE);
            };
            this.t8UpdateSkillPriority = () => {
                if (!creativePresetWidget) return;
                const directionalActive = isDirectionalSkillEnabled(directorSkillWidget?.value);
                const t8Active = this.t8IsT8CaseTemplateActive();
                creativePresetWidget.label = directionalActive
                    ? "MiniMax Official Scene Skill (Directional Skill Takes Priority; Inactive)"
                    : t8Active
                    ? "MiniMax Official Scene Skill (T8 Takes Priority; Inactive)"
                    : "MiniMax Official Scene Skill (8 Available)";
                creativePresetWidget.tooltip = directionalActive
                    ? "A separate directional creation Skill is active. The Official Scene Skill selection is preserved and will resume when the directional Skill is disabled. H3 core formatting remains active."
                    : t8Active
                    ? "A T8 unofficial template is selected. Only the T8 template applies for this run; the eight optional Official Scene Skills, including AUTO, are inactive. The H3 core writing Skill remains active. This setting resumes when the T8 template is cleared."
                    : "Selecting an Official Scene Skill displays its purpose, recommended input, structural anchors, official GIF, and source below. The GIF is not sent to the LLM. A selected T8 unofficial template takes priority and temporarily disables this setting.";
                this.t8UpdateOfficialPreset?.();
                if (directionalActive) this.t8UpdateCaseTemplate?.(NO_CASE_TEMPLATE);
                this.t8UpdateDirectionalSkill?.();
                this.setDirtyCanvas?.(true, true);
            };

            if (promptModeWidget && referenceTemplateWidget) {
                addReferenceTemplateBehavior(this, promptModeWidget, referenceTemplateWidget);
            }
            if (apiModeWidget && openaiBaseUrlWidget && openaiVideoUrlsWidget && aiWorkshopModelWidget && customModelWidget) {
                addApiModeBehavior(
                    this, apiModeWidget, openaiBaseUrlWidget, openaiVideoUrlsWidget,
                    aiWorkshopModelWidget, customModelWidget, localWidgets,
                );
            }
            if (creativePresetWidget && promptWidget) {
                addMvPresetBehavior(this, creativePresetWidget, promptWidget, referenceContextWidget, constraintsWidget, referenceTemplateWidget);
            }
            this.t8NormalizePromptOptions = () => {
                    if (TASK_TYPE_LABELS[taskTypeWidget?.value]) taskTypeWidget.value = TASK_TYPE_LABELS[taskTypeWidget.value];
                    normalizeChoice(taskTypeWidget, Object.values(TASK_TYPE_LABELS), TASK_TYPE_LABELS.T2VA, LEGACY_TASK_TYPE_LABELS);
                if (caseTemplateWidget?.value === "无（不使用 T8 案例）") caseTemplateWidget.value = NO_CASE_TEMPLATE;
                    normalizeChoice(shotCountWidget, SHOT_COUNT_OPTIONS, AUTO_SHOT_COUNT, LEGACY_SHOT_COUNT_LABELS);
                    normalizeChoice(outputLanguageWidget, ["Chinese", "English"], "Chinese", { "中文": "Chinese" });
                    normalizeChoice(promptModeWidget, [OFFICIAL_ENHANCEMENT, REFERENCE_TEMPLATE_FUSION], OFFICIAL_ENHANCEMENT, LEGACY_PROMPT_MODE_LABELS);
                    normalizeChoice(officialSkillProfileWidget, OFFICIAL_SKILL_PROFILES, COMPAT_SKILL_PROFILE, LEGACY_SKILL_PROFILE_LABELS);
                if (creativePresetWidget?.value === LEGACY_MV_CREATIVE_PRESET) {
                    creativePresetWidget.value = MV_CREATIVE_PRESET;
                }
                normalizeChoice(creativePresetWidget, CREATIVE_PRESET_OPTIONS, NO_CREATIVE_PRESET, LEGACY_CREATIVE_PRESET_LABELS);
                if (directorSkillWidget) directorSkillWidget.value = directionalSkillLabel(directorSkillWidget.value, true);
                normalizeChoice(
                    apiModeWidget,
                    [SEEDANCE_API_MODE, AI_WORKSHOP_API_MODE, OPENAI_API_MODE, LOCAL_QWEN_API_MODE],
                    SEEDANCE_API_MODE,
                    { ...LEGACY_API_MODE_LABELS, [LEGACY_LOCAL_QWEN_API_MODE]: LOCAL_QWEN_API_MODE },
                );
                normalizeChoice(
                    aiWorkshopModelWidget,
                    [AI_WORKSHOP_DEFAULT_MODEL, CUSTOM_MODEL_OPTION],
                    AI_WORKSHOP_DEFAULT_MODEL,
                    { "Custom（自定义）": CUSTOM_MODEL_OPTION },
                );
                normalizeChoice(this.widgets?.find((widget) => widget.name === "local_think_mode"), LOCAL_THINK_OPTIONS, LOCAL_THINK_OPTIONS[0], LEGACY_LOCAL_THINK_LABELS);
                normalizeChoice(this.widgets?.find((widget) => widget.name === "local_unload_policy"), LOCAL_UNLOAD_OPTIONS, LOCAL_UNLOAD_OPTIONS[0], LEGACY_LOCAL_UNLOAD_LABELS);
                normalizeChoice(this.widgets?.find((widget) => widget.name === "local_comfy_memory_policy"), LOCAL_COMFY_MEMORY_OPTIONS, LOCAL_COMFY_MEMORY_OPTIONS[0], LEGACY_LOCAL_COMFY_MEMORY_LABELS);
                if (LEGACY_UI_VALUES.has(String(apiKeyWidget?.value || "").trim())) apiKeyWidget.value = "";
                for (const widget of [referenceContextWidget, constraintsWidget, referenceTemplateWidget, customModelWidget, openaiBaseUrlWidget, openaiVideoUrlsWidget]) {
                    const value = String(widget?.value || "").trim();
                    if (LEGACY_UI_VALUES.has(value)) setTextWidgetValue(widget, "");
                    if (API_KEY_PATTERN.test(value)) {
                        if (!String(apiKeyWidget?.value || "").trim()) apiKeyWidget.value = value;
                        setTextWidgetValue(widget, "");
                    }
                }
                this.t8UpdateReferenceTemplate?.();
                this.t8UpdateApiMode?.();
                this.t8UpdateMvPreset?.();
                this.t8UpdateOfficialPreset?.();
                this.t8UpdateSkillPriority?.();
                this.t8UpdateRelayMode?.();
            };
            this.t8NormalizePromptOptions();

            addDirectionalSkillUI(this, directorSkillWidget, {
                target: "h3",
                english: true,
                onChange: (active) => {
                    this.t8UpdateReferenceTemplate?.();
                    this.t8UpdateMvPreset?.();
                    this.t8UpdateCaseTemplate?.(active ? NO_CASE_TEMPLATE : undefined);
                    this.t8UpdateSkillPriority?.();
                    resizeNode(this);
                },
            });

            addOfficialPresetUI(this, creativePresetWidget, promptWidget, () => resizeNode(this));
            addCaseTemplateUI(this, caseTemplateWidget, promptWidget, () => resizeNode(this), {
                useIds: true,
                noneValue: NO_CASE_TEMPLATE,
            });

            const advancedWidgets = [referenceContextWidget, constraintsWidget].filter(Boolean);
            if (advancedWidgets.length) addAdvancedToggle(this, advancedWidgets);

            if (apiKeyWidget) addApiKeyWidget(this, apiKeyWidget, apiModeWidget);

            const capabilityWidget = this.addWidget(
                "button",
                "🧭 Check Provider Capabilities",
                "View known and unknown support for images, videos, URLs, and optional parameters",
                () => showProviderCapability(apiModeWidget?.value, openaiBaseUrlWidget?.value),
                { serialize: false },
            );
            capabilityWidget.serializeValue = () => undefined;

            const diagnosticsWidget = this.addWidget(
                "button",
                "🩺 View/Copy Redacted Diagnostics",
                "Shows only safe fields; excludes keys, prompts, templates, media, and response text",
                () => showRedactedDiagnostics(NODE_ID),
                { serialize: false },
            );
            diagnosticsWidget.serializeValue = () => undefined;

            addCompletionRecoveryButton(this, NODE_ID, {
                beforeQueue: () => {
                    this.t8CommitOpenAIProviderState?.();
                    this.t8CommitApiKey?.();
                },
            });

            let queuing = false;
            const runWidget = this.addWidget(
                "button",
                "▶ Run Prompt Enhancement",
                "Queue the current workflow",
                async () => {
                    if (queuing) return;
                    queuing = true;
                    try {
                        this.t8CommitOpenAIProviderState?.();
                        this.t8CommitApiKey?.();
                        await app.queuePrompt(0, 1, [String(this.id)]);
                    } finally {
                        queuing = false;
                    }
                },
                { serialize: false },
            );
            runWidget.serializeValue = () => undefined;

            const signUpWidget = this.addWidget(
                "button",
                "🔑 Get Seedance API Key",
                "Open the registration page for the selected provider",
                () => window.open(
                    apiModeWidget?.value === AI_WORKSHOP_API_MODE ? AI_WORKSHOP_SIGN_UP_URL : SIGN_UP_URL,
                    "_blank",
                    "noopener,noreferrer",
                ),
                { serialize: false },
            );
            signUpWidget.serializeValue = () => undefined;
            this.t8SignUpWidget = signUpWidget;

            const localStatusWidget = this.addWidget(
                "button",
                "🧩 Check Local Qwen Setup / Scan GGUF",
                "Rescan models/LLM, refresh the model list, and check the llama.cpp runtime",
                () => showLocalQwenStatus(this),
                { serialize: false },
            );
            localStatusWidget.serializeValue = () => undefined;
            this.t8LocalQwenStatusWidget = localStatusWidget;

            const localWheelWidget = this.addWidget(
                "button",
                "🛞 Get a Prebuilt llama-cpp-python Wheel",
                "Open JamePeng Releases and select a Wheel matching ComfyUI Python, your OS, and CUDA",
                openLlamaCppPythonWheels,
                { serialize: false },
            );
            localWheelWidget.serializeValue = () => undefined;

            const localPathWidget = this.addWidget(
                "button",
                "📁 Model Path: ComfyUI/models/LLM (Click to Copy)",
                "The main model and mmproj can be placed in any LLM subdirectory",
                copyLocalModelDirectory,
                { serialize: false },
            );
            localPathWidget.serializeValue = () => undefined;

            const localSkillBundleWidget = this.addWidget(
                "button",
                "MiniMax & Seedance Local Skills and Bundle",
                "Open the local Skills and bundle in a new tab",
                () => window.open(LOCAL_SKILL_BUNDLE_URL, "_blank", "noopener,noreferrer"),
                { serialize: false },
            );
            localSkillBundleWidget.serializeValue = () => undefined;
            const relayHelp = this.addWidget("button", "📖 Prompt Relay Wiring Guide", "global / local / time + length",
                () => window.open(new URL("./docs/h3_prompt_relay.md", import.meta.url).href, "_blank", "noopener,noreferrer"), { serialize: false });
            relayHelp.serializeValue = () => undefined;
            this.t8UpdateApiMode?.();
            resizeNode(this);
        };
        nodeType.prototype.onConfigure = function () {
            const args = [...arguments];
            const serialized = args[0];
            const openAIProviderState = serializedOpenAIProviderState(serialized);
            const hadLegacyUploadUrl = serialized?.inputs?.some((input) => input.name === "openai_upload_url");
            if (Array.isArray(serialized?.widgets_values)
                && [16, 17, 19, 21].includes(serialized.widgets_values.length)) {
                args[0] = { ...serialized, widgets_values: [...serialized.widgets_values] };
            }
            if (Array.isArray(args[0]?.widgets_values) && args[0].widgets_values.length === 16) {
                args[0].widgets_values.splice(3, 0, AUTO_SHOT_COUNT);
            }
            if (Array.isArray(args[0]?.widgets_values) && args[0].widgets_values.length === 17) {
                args[0].widgets_values.splice(8, 0, COMPAT_SKILL_PROFILE, NO_CREATIVE_PRESET);
            }
            if (Array.isArray(args[0]?.widgets_values) && args[0].widgets_values.length === 19) {
                args[0].widgets_values.splice(11, 0, AI_WORKSHOP_DEFAULT_MODEL, "");
            }
            if (Array.isArray(args[0]?.widgets_values) && args[0].widgets_values.length === 21) {
                args[0].widgets_values.splice(10, 0, NO_CASE_TEMPLATE);
            }
            let restoredValues = namedWidgetValueMap(
                SERIALIZED_WIDGET_NAMES,
                args[0]?.widgets_values,
                [22, 31, 35, 36, SERIALIZED_WIDGET_NAMES.length],
            );
            if (restoredValues) {
                args[0] = {
                    ...args[0],
                    widgets_values: expandNamedWidgetValues(
                        SERIALIZED_WIDGET_NAMES,
                        args[0].widgets_values,
                        LOCAL_WIDGET_DEFAULTS,
                        [22, 31, 35, 36, SERIALIZED_WIDGET_NAMES.length],
                    ),
                };
                args[0].widgets_values[35] = directionalSkillLabel(args[0].widgets_values[35], true);
                args[0].widgets_values[36] = qualityLabel(args[0].widgets_values[36], true);
                args[0].widgets_values[37] = creationLabel(args[0].widgets_values[37], true);
                // Restore appended defaults by name as well: the optional
                // director control is displayed beside templates, not at the end.
                restoredValues = namedWidgetValueMap(SERIALIZED_WIDGET_NAMES, args[0].widgets_values);
            }
            if (Array.isArray(args[0]?.widgets_values)) {
                this.t8PendingCaseTemplateValue = args[0].widgets_values[10];
            }
            originalOnConfigure?.apply(this, args);
            restoreOpenAIProviderState(this, openAIProviderState);
            requestAnimationFrame(() => {
                const excluded = new Set(["case_template"]);
                if (hadLegacyUploadUrl) excluded.add("openai_video_urls");
                restoreNamedWidgetValues(this, restoredValues, excluded);
                restoreOpenAIProviderState(this, openAIProviderState);
                if (hadLegacyUploadUrl) {
                    setTextWidgetValue(this.widgets?.find((widget) => widget.name === "openai_video_urls"), "");
                }
                this.t8RestoreCaseTemplate?.(this.t8PendingCaseTemplateValue);
                if (this.t8RestoreCaseTemplate) this.t8PendingCaseTemplateValue = "";
                this.t8NormalizePromptOptions?.();
                this.t8UpdateQuality?.();
                this.t8EnsureRecoverySlot?.();
            });
        };
        nodeType.prototype.onConnectionsChange = function () {
            const result = originalOnConnectionsChange?.apply(this, arguments);
            requestAnimationFrame(() => this.t8UpdateApiKeyConnection?.());
            return result;
        };
        nodeType.prototype.onSerialize = function (serialized) {
            originalOnSerialize?.apply(this, arguments);
            serializeOpenAIProviderState(this, serialized);
            serialized.widgets_values = serializeNamedWidgetValues(
                this,
                SERIALIZED_WIDGET_NAMES,
                (name, value, widget) => name === "case_template"
                    ? serializedCaseTemplateValue(this, widget)
                    : name === "director_skill" ? directionalSkillId(value) : value,
            );
        };
    },
});
