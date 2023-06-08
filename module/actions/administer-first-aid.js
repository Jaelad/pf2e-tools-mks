import {SimpleAction} from "../action.js"
import Dialogs from "../apps/dialogs.js"
import {default as i18n} from "../../lang/pf2e-i18n.js"
import CommonUtils from "../helpers/common-utils.js"
import Condition, { CONDITION_DYING } from "../model/condition.js"
import PersistentDamage, { PERSISTENT_BLEED, PERSISTENT_POISON } from "../model/persistent-damage.js"
import Equipments, { EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED } from "../model/equipments.js"
import Effect, { EFFECT_POISON_TREATED } from "../model/effect.js"

export default class ActionAdministerFirstAid extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'administerFirstAid',
			checkType: 'skill[medicine]',
			traits: ['manipulate'],
			icon: "systems/pf2e/icons/spells/heal-companion.webp",
			tags: ['combat'],
			actionGlyph: 'D',
			targetCount: 1
		})
	}
	
	pertinent(engagement, warn) {
		return engagement.isAdjacent && engagement.isAlly
			&& (Condition.hasAny(engagement.targeted, CONDITION_DYING) || PersistentDamage.hasAny(engagement.targeted, [PERSISTENT_BLEED, PERSISTENT_POISON]))
	}
	
	async act(engagement, {overrideDC}) {
		const targeted = engagement.targeted
		const healersTools = new Equipments(engagement.initiator).hasEquippedAny([EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED])
		
		const dying = new Condition(targeted, CONDITION_DYING)
		const bleeding = new PersistentDamage(targeted, PERSISTENT_BLEED)
		const poisoned = new PersistentDamage(targeted, PERSISTENT_POISON)
		
		const ok = (dying.value > 0 || bleeding.exists || poisoned.exists) && healersTools.length > 0
		if (!ok) return
		
		const buttons = []
		if (dying.value > 0)
			buttons.push({ value: 'dying', name: 'PF2E.Actions.AdministerFirstAid.Dying'})
		if (bleeding.exists)
			buttons.push({ value: 'bleeding', name: 'PF2E.Actions.AdministerFirstAid.Bleeding'})
		if (poisoned.exists)
			buttons.push({ value: 'poisoned', name: 'PF2E.Actions.AdministerFirstAid.Poisoned'})
		
		let dc, affliction, formula, id
		if (buttons.length > 1)
			affliction = await Dialogs.multipleButtons(buttons, "PF2E.MKS.Dialog.AdministerFirstAid.SelectType") ?? 'dying'
		else if (dying.value > 0)
			affliction = 'dying'
		else if (bleeding.exists)
			affliction = 'bleeding'
		else if (poisoned.exists)
			affliction = 'poisoned'
		
		if (affliction === 'dying') {
			dc = dying.value + 15
			id = dying.item.id
		}
		else if (affliction === 'bleeding') {
			dc = bleeding.dc
			formula = bleeding.formula
			id = bleeding.item.id
		}
		else if (affliction === 'poisoned') {
			dc = poisoned.dc
			formula = poisoned.formula
			id = poisoned.item.id
		}
		
		return await super.act( engagement, {overrideDC: dc, affliction, formula, conditionId: id})
	}
	
	async apply(engagement, result) {
		const targeted = engagement.targeted, options = result.options
		const degreeOfSuccess = result.roll.degreeOfSuccess
		if (options.affliction === 'dying') {
			const dying = new Condition(targeted, CONDITION_DYING)
			if (degreeOfSuccess > 1) {
				await dying.purge()
			}
			else if (degreeOfSuccess === 0) {
				await dying.setValue(1, true)
			}
		}
		else if (options.affliction === 'bleeding') {
			const bleeding = new PersistentDamage(PERSISTENT_BLEED)
			if (degreeOfSuccess > 1) {
				const flatCheckRoll = new Roll('1d20').roll({async: false})
				CommonUtils.chat(targeted, i18n.$$("PF2E.Actions.AdministerFirstAid.BleedingFlatCheck", {roll: flatCheckRoll.result}))
				
				if (flatCheckRoll.result >= 15) {
					await bleeding.purge()
				}
			}
			else if (degreeOfSuccess === 0) {
				const healthLost = new Roll(options.formula).roll({async: false})
				this._.actorManager.applyHPChange(targeted, {value: -1 * healthLost}).then(()=> {
					CommonUtils.chat(targeted, i18n.$$("PF2E.MKS.Chat.HealthLost", {healthLost}))
				})
			}
		}
		else if (options.affliction === 'poisoned') {
			const bonus = degreeOfSuccess === 2 ? 2 : degreeOfSuccess === 3 ? 4 : degreeOfSuccess === 0 ? -2 : 0
			if (bonus !== 0) {
				const poisonTreated = new Effect(targeted, EFFECT_POISON_TREATED)
				poisonTreated.ensure().then(() => {
					poisonTreated.setFlag("treatPoisonBonus", bonus)
				})
			}
		}
	}
}