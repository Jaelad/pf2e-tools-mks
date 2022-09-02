export const SYSTEM = {
	moduleId: 'pf2e-tools-mks',
	foundryVersion: () => game.version ?? game.data.version,
	gameSystem: () => game.system?.id ?? game.data.system.id,
	systemSupported: () => /pf2e/.exec(SYSTEM.gameSystem())
}

export const SELECTORS = {
	spellcasting: /spell\[(arcane|primal|divine|occult)]/,
	skill: /skill\[(\w+)]/,
	strike: /strike\[([\w-]+)]/,
}

export const MODIFIER_TYPE = {
	ABILITY: "ability",
	PROFICIENCY: "proficiency",
	CIRCUMSTANCE: "circumstance",
	ITEM: "item",
	POTENCY: "potency",
	STATUS: "status",
	UNTYPED: "untyped",
}

export const SKILLS = {
	acrobatics: "acr",
	arcana: "arc",
	athletics: "ath",
	crafting: "cra",
	deception: "dec",
	diplomacy: "dip",
	medicine: "med",
	nature: "nat",
	occultism: "occ",
	performance: "prf",
	religion: "rel",
	society: "soc",
	stealth: "ste",
	survival: "sur",
	thievery: "thi"
}

export const ROLL_MODE = {
	PUBLIC: 'publicroll',
	GM: 'gmroll',
	BLIND: 'blindroll',
	SELF: 'selfroll'
}

export const SKILL_LONG_FORMS = Object.keys(SKILLS)
export const SAVE_TYPES = ["fortitude", "reflex", "will"]
export const DC_SLUGS = new Set(["ac", "perception", ...SAVE_TYPES, ...SKILL_LONG_FORMS])

export const PROFICIENCY_RANK_OPTION = [
	"proficiency:untrained",
	"proficiency:trained",
	"proficiency:expert",
	"proficiency:master",
	"proficiency:legendary",
]