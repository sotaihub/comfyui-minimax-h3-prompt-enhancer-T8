// Shared presentation only. Each enhancer retains its own output compiler.
export const DIRECTIONAL_SKILLS = Object.freeze([
    { id: "none", label: "Off", legacyDisplayLabel: "关闭 / Off", legacyLabels: ["关闭 / Off"], summary: "Use the node's existing scene and template settings." },
    { id: "continuous_combat", label: "Continuous Combat Long Take", legacyDisplayLabel: "Fisher-连续战斗长镜头 / Continuous combat", legacyLabels: ["Fisher-连续战斗长镜头 / Continuous combat", "连续战斗长镜头 / Continuous combat"], summary: "Use a continuous camera path with readable attack-and-defense escalation, spatial continuity, and impact follow-through.", example: "Example: Two sword fighters clash in a corridor in one continuous take." },
    { id: "high_density_combat", label: "High-Density Continuous Combat", legacyDisplayLabel: "土豆-高密度连续攻防 / High-density combat", legacyLabels: ["土豆-高密度连续攻防 / High-density combat", "高密度连续攻防 / High-density combat"], summary: "Build exchanges from the supplied weapons and abilities so each action's result triggers the next.", example: "Example: An 8-second nonstop unarmed duel." },
    { id: "cinematic_gunfight", label: "Cinematic Gunfight Direction", legacyDisplayLabel: "兔子-电影枪战导演 / Cinematic gunfight", legacyLabels: ["兔子-电影枪战导演 / Cinematic gunfight", "电影枪战导演 / Cinematic gunfight"], summary: "Organize the gunfight, space, action responses, and sound around the characters' objectives.", example: "Example: Cover a teammate's escape during a rainy-night gunfight." },
    { id: "ning_wenwu", label: "Ning - Drama and Action", legacyDisplayLabel: "宁版-文武双全 / Ning · Drama & Action", legacyLabels: ["宁版-文武双全 / Ning · Drama & Action"], summary: "Use information and reaction for dramatic beats, force and impact for action, and emphasize key changes.", example: "Example: Draw a sword after the supplied line, but do not attack." },
    { id: "drama_scene", label: "Dramatic Scene - Relationships and Subtext", legacyDisplayLabel: "戏剧场面｜关系与潜台词 / Dramatic scene", legacyLabels: ["戏剧场面｜关系与潜台词 / Dramatic scene"], summary: "Let dialogue, silence, and established actions express relationships without forcing conflict.", example: "Example: Return a resignation letter and preserve the supplied invitation." },
    { id: "situational_drama", label: "Situational Drama - Setup and Payoff", legacyDisplayLabel: "情境戏剧｜处境与铺垫回收 / Situational drama", legacyLabels: ["情境戏剧｜处境与铺垫回收 / Situational drama"], summary: "Develop a small objective, response, and payoff without assuming comedy or a twist.", example: "Example: Two people move a table through a doorway, misread who yields, then coordinate silently." },
]);

export function directionalSkillId(value) {
    // Malformed saved/API values must reach validation, not turn []/false into
    // a silently disabled Skill. Only absent/string-empty selections are Off.
    if (value != null && typeof value !== "string") return value;
    const original = String(value ?? "");
    const text = original.trim();
    // Preserve unknown values for the backend's explicit, sanitized validation.
    // An unrecognized saved selection must never silently become Off.
    return DIRECTIONAL_SKILLS.find((item) => item.id === text || item.label === text || item.legacyLabels?.includes(text))?.id || (text ? original : "none");
}

export function directionalSkillLabel(value, english = false) {
    const id = directionalSkillId(value);
    const skill = DIRECTIONAL_SKILLS.find((item) => item.id === id);
    return skill ? (english ? skill.label : skill.legacyDisplayLabel) : id;
}

export function isDirectionalSkillEnabled(value) {
    const id = directionalSkillId(value);
    return DIRECTIONAL_SKILLS.some((item) => item.id === id && id !== "none");
}

export const DIRECTIONAL_HELP_HEIGHT = 120;

export function directionalSkillDescription(value, target = "h3") {
    const skill = DIRECTIONAL_SKILLS.find((item) => item.id === directionalSkillId(value));
    const format = target === "seedance20" ? "The existing Seedance output format is preserved." : "The H3 core contract and selected output format are preserved.";
    if (!skill) return `Unknown directing Skill. Select an available option again.\n${format}\nThe selection was not silently disabled or replaced; it remains available for validation.`;
    const priority = target === "seedance20"
        ? "T8 cases and manual templates are paused for this run and resume when this Skill is disabled."
        : "Official scene presets, T8 cases, and manual templates are paused for this run and resume when this Skill is disabled.";
    return [
        skill.id === "none" ? "Directional creation: Off" : `Active creation profile: ${skill.label} (unofficial)`,
        ...(skill.example ? [skill.example] : []),
        skill.summary,
        ...(["drama_scene", "situational_drama"].includes(skill.id)
            ? ["Preserve supplied lines by default; add dialogue only when explicitly requested. Character Performance Bible is optional."] : []),
        format,
        skill.id === "none" ? "Select a directing Skill to enable it; no extra connection or form is required." : priority,
        "Restoring the previous result does not regenerate it with the current Skill.",
    ].join("\n");
}

export function addDirectionalSkillUI(node, skillWidget, { target = "h3", onChange, english = false } = {}) {
    if (!skillWidget || node.t8DirectionalSkillUI) return node.t8DirectionalSkillUI || null;
    const root = document.createElement("div");
    root.style.cssText = "box-sizing:border-box;height:120px;min-height:120px;max-height:120px;padding:8px 10px;overflow:auto;white-space:pre-wrap;font:12px/17px sans-serif;color:#ddd;background:#202832;border:1px solid #496784;border-radius:6px;";
    root.setAttribute("role", "note");
    const detail = node.addDOMWidget("t8_directional_skill_help", "custom", root, {
        getValue: () => "",
        setValue: () => {},
        getMinHeight: () => DIRECTIONAL_HELP_HEIGHT,
        getMaxHeight: () => DIRECTIONAL_HELP_HEIGHT,
        getHeight: () => DIRECTIONAL_HELP_HEIGHT,
        // Modern DOM widgets subtract two margins from their host height.
        // The element already owns padding; reserve its full 120px footprint.
        margin: 0,
        hideOnZoom: false,
        serialize: false,
    });
    // Legacy LiteGraph reads computeSize rather than computeLayoutSize.
    detail.computeSize = () => [0, DIRECTIONAL_HELP_HEIGHT];
    detail.serializeValue = () => undefined;
    skillWidget.label = "Directional Creation Skill (Unofficial)";
    skillWidget.tooltip = "Select one creation method. The output language, model format, media, and explicit user requirements remain unchanged. Disable it to restore the original template settings.";
    const originals = new Map();
    for (const name of ["case_template", "prompt_mode", "reference_template"]) {
        const widget = node.widgets?.find((item) => item.name === name);
        if (widget) originals.set(widget, { label: widget.label, tooltip: widget.tooltip });
    }
    const update = () => {
        skillWidget.value = directionalSkillLabel(skillWidget.value, english);
        const active = isDirectionalSkillEnabled(skillWidget.value);
        root.textContent = directionalSkillDescription(skillWidget.value, target);
        for (const [widget, original] of originals) {
            widget.label = active ? `${original.label || widget.name} (Directional Skill takes priority; paused)` : original.label;
            widget.tooltip = active
                ? "The directional creation Skill takes priority. The original selection and content are preserved and resume when this Skill is disabled."
                : original.tooltip;
        }
        node.setDirtyCanvas?.(true, true);
    };
    const originalCallback = skillWidget.callback;
    skillWidget.callback = function () {
        originalCallback?.apply(this, arguments);
        update();
        onChange?.(isDirectionalSkillEnabled(skillWidget.value));
        node.graph?.change?.();
    };
    // UI order can differ from serialization order: append-only named storage is
    // maintained by each enhancer, never derived from this visual position.
    const caseWidget = node.widgets?.find((item) => item.name === "case_template");
    if (caseWidget && Array.isArray(node.widgets)) {
        for (const widget of [skillWidget, detail]) {
            const index = node.widgets.indexOf(widget);
            if (index >= 0) node.widgets.splice(index, 1);
        }
        node.widgets.splice(node.widgets.indexOf(caseWidget) + 1, 0, skillWidget, detail);
    }
    node.t8UpdateDirectionalSkill = update;
    node.t8DirectionalSkillUI = detail;
    update();
    return detail;
}
