import {default as i18n} from "../../lang/pf2e-i18n.js"
import {SYSTEM} from "../constants.js"
import BasePanel from "./base-panel.js"
import $$strings from "../../utils/strings.js"

export default class RelativeCondPanel extends BasePanel {
	
	constructor(dialogData = {}, options = {}) {
		super(dialogData, options)
		
		this.labels = {
			cover: [
				i18n.$("PF2E.Concept.Cover.None"),
				i18n.$("PF2E.Concept.Cover.Lesser"),
				i18n.$("PF2E.Concept.Cover.Standard"),
				i18n.$("PF2E.Concept.Cover.Greater")
			],
			awareness: [
				i18n.$("PF2E.Concept.Awareness.Unnoticed"),
				i18n.$("PF2E.Concept.Awareness.Undetected"),
				i18n.$("PF2E.Concept.Awareness.Hidden"),
				i18n.$("PF2E.Concept.Awareness.Observed"),
			],
			attitude: [
				i18n.$("PF2E.Concept.Attitude.Hostile"),
				i18n.$("PF2E.Concept.Attitude.Unfriendly"),
				i18n.$("PF2E.Concept.Attitude.Indifferent"),
				i18n.$("PF2E.Concept.Attitude.Friendly"),
				i18n.$("PF2E.Concept.Attitude.Helpful"),
			]
		}
		
		setInterval(() => {
			const relativeData = game.combat?.flags?.[SYSTEM.moduleId]?.relative
			if (relativeData && relativeData.changed) {
				relativeData.changed = false
				game.combat.setFlag(SYSTEM.moduleId, "relative", relativeData).then(() => {
					console.log("Updated Relative Data")
				})
			}
		}, 10000)
	}
	
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "relative-cond-panel",
			title: game.i18n.localize("PF2E.MKS.UI.RelativeCondPanel.Label"),
			template: `modules/pf2e-tools-mks/templates/relative-cond-panel.hbs`,
			//template: `modules/pf2e-tools-mks/templates/test.hbs`,
			classes: ["form"],
			width: 500,
			height: "auto",
			top: 150,
			left: 150,
			resizable: false
		})
	}
	
	activateListeners(html) {
		super.activateListeners(html)
		
		html.find("a[data-action]").click((event) => this._conditionChange(event))
	}
	
	async _conditionChange(event) {
		const relativeData = game.combat.flags?.[SYSTEM.moduleId]?.relative
		const shift = event.shiftKey
		const dataset = event?.currentTarget?.dataset
		if (relativeData && dataset?.action && dataset.reference && dataset.target) {
			const length = this.labels[dataset.action].length
			const val = relativeData[dataset.reference][dataset.target][dataset.action]
			let relativeValue = (val + length + (shift ? -1 : 1)) % length
			relativeData[dataset.reference][dataset.target][dataset.action] = relativeValue
			relativeData.changed = true
			
			const targetCombatant = game.combat.combatants.find(c => c.token.id === dataset.target)
			await game.MKS.encounterManager["apply" + $$strings.camelize(dataset.action)](game.combat.combatant, targetCombatant, relativeValue)
			RelativeCondPanel.rerender()
		}
	}
	
	getData(options = {}) {
		let data = super.getData()
		if (!game.combat)
			return data
		
		const relativeData = game.combat.flags?.[SYSTEM.moduleId]?.relative
		if (relativeData) {
			data.referenceTokenId = game.combat.combatant.token.id
			data.relative = relativeData[data.referenceTokenId]
		}
		data.editable = game.user.isGM
		data.labels = this.labels
		return data
	}
	
	
}