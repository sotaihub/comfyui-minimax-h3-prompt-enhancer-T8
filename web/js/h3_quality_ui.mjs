export const QUALITY_HELP_HEIGHT = 112;
const QUALITY_MODES = {
    off: { english: "Off (Preserve Existing Behavior)", legacy: "保持原样 / Off" },
    check: { english: "Check Only", legacy: "质量检查 / Check" },
    repair: { english: "Repair (At Most One Correction)", legacy: "质量纠正（最多追加1次） / Repair" },
};
const CREATION_MODES = {
    off: { english: "Original Orchestration", legacy: "原有编排 / Original" },
    causal: { english: "Causal Action Refinement", legacy: "因果动作优化 / Causal" },
};
const QUALITY_ALIASES = {
    none: "off",
    "保持原样 / Off": "off",
    "质量检查 / Check": "check",
    "质量纠正（最多追加1次） / Repair": "repair",
};
const CREATION_ALIASES = {
    none: "off",
    "原有编排 / Original": "off",
    "因果动作优化 / Causal": "causal",
};
export const qualityLabel = (value, english = false) => {
    const mode = QUALITY_MODES[QUALITY_ALIASES[value] || value];
    return mode ? mode[english ? "english" : "legacy"] : value ?? QUALITY_MODES.off[english ? "english" : "legacy"];
};
export const creationLabel = (value, english = false) => {
    const mode = CREATION_MODES[CREATION_ALIASES[value] || value];
    return mode ? mode[english ? "english" : "legacy"] : value ?? CREATION_MODES.off[english ? "english" : "legacy"];
};
const RESULTS = {
    checked: ["Check complete", "检查完成 / Checked"],
    corrected: ["Correction accepted", "纠正已接受 / Corrected"],
    candidate_rejected: ["Candidate rejected; complete draft retained", "候选未通过，保留完整稿 / Candidate rejected"],
    correction_failed_draft_kept: ["Correction request failed; complete draft retained", "纠正请求失败，保留完整稿 / Draft kept"],
    check_failed_draft_kept: ["Check failed; complete draft retained", "检查失败，保留完整稿 / Check failed"],
    protocol_repair_failed_draft_kept: ["Protocol repair incomplete; complete draft retained", "协议修复未完成，保留完整稿 / Draft kept"],
    budget_exhausted_draft_kept: ["Correction budget exhausted; complete draft retained", "纠正预算已用完，保留完整稿 / Budget exhausted"],
};
export function qualityStatusText(value, english = false) {
    const result = RESULTS[value?.result]?.[english ? 0 : 1] || (english ? "Waiting to run" : "等待运行 / Awaiting run");
    const count = Array.isArray(value?.issue_codes) ? value.issue_codes.filter((s) => typeof s === "string" && /^[a-z_]{1,60}$/.test(s)).length : 0;
    const calls = value?.correction_calls === 1 ? 1 : 0;
    if (english) {
        return `${result}; issues ${count}; correction requests ${calls}.${value?.cleanup_failed === true ? " Local cleanup failed; check the runtime." : ""}\nText checks are not video acceptance; review pending items in redacted diagnostics.`;
    }
    return `${result}；失败项 ${count}；追加纠正 ${calls} 次。${value?.cleanup_failed === true ? " 本地清理失败，请检查运行时。" : ""}\n文本检查 ≠ 成片验收；待确认项见脱敏诊断 / Text only.`;
}
export function addQualityUI(node, { english = false } = {}) {
    if (node.t8QualityUI) return node.t8QualityUI;
    const quality = node.widgets?.find((w) => w.name === "quality_mode");
    const creation = node.widgets?.find((w) => w.name === "creation_mode");
    if (!quality || !creation) return null;
    const root = document.createElement("div");
    root.style.cssText = "box-sizing:border-box;height:112px;min-height:112px;max-height:112px;overflow:auto;padding:8px 10px;white-space:pre-wrap;font:12px/17px sans-serif;color:#eee;background:#202832;border:1px solid #496784;border-radius:6px";
    root.setAttribute("role", "status");
    const update = () => {
        quality.value = qualityLabel(quality.value, english);
        creation.value = creationLabel(creation.value, english);
        const help = english
            ? "Quality: Off preserves the original flow; Check only reports issues; Repair makes at most one correction request.\nCausal refinement (experimental): improves action continuity in the same run without another request; verify facts and ending state.\n"
            : "质量 / Quality：Off 原流程；Check 只检查；Repair 最多1次计费纠正。\n因果 / Causal（实验）：同次优化衔接，不加请求；事实与尾态须复核。\n";
        root.textContent = help + qualityStatusText(node.t8QualityStatus, english);
        node.setDirtyCanvas?.(true, true);
    };
    const widget = node.addDOMWidget("t8_quality_help", "custom", root, {
        getValue: () => "", setValue() {}, margin: 0, hideOnZoom: false, serialize: false,
        getHeight: () => QUALITY_HELP_HEIGHT, getMinHeight: () => QUALITY_HELP_HEIGHT, getMaxHeight: () => QUALITY_HELP_HEIGHT,
    });
    widget.computeSize = () => [0, QUALITY_HELP_HEIGHT];
    widget.serializeValue = () => undefined;
    for (const item of [quality, creation]) {
        const old = item.callback;
        item.callback = function () { old?.apply(this, arguments); node.t8QualityStatus = null; update(); node.graph?.change?.(); };
    }
    const executed = node.onExecuted;
    node.onExecuted = function (message) {
        executed?.apply(this, arguments);
        try { node.t8QualityStatus = JSON.parse(message?.t8_quality_status?.[0] || "null"); }
        catch (_) { node.t8QualityStatus = null; }
        update();
    };
    node.t8UpdateQuality = update;
    node.t8QualityUI = widget;
    update();
    return widget;
}
