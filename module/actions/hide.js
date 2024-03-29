import {SimpleAction} from "../action.js"
import {default as i18n} from "../../lang/pf2e-i18n.js"
import RelativeConditions from "../model/relative-conditions.js"
import Condition, { CONDITION_CONCEALED, UUID_CONDITONS } from "../model/condition.js"
import DCHelper from "../helpers/dc-helper.js"
import { AWARENESS } from "../constants.js"

export default class ActionHide extends SimpleAction {
	constructor(MKS) {
		super(MKS, 'hide', 'encounter', true, true, {
			icon: "systems/pf2e/icons/spells/zealous-conviction.webp",
			tags: ['stealth'],
			actionGlyph: 'A',
			targetCount: 2,
			requiresEncounter: true,
			opposition: 'enemy',
			checkType: 'skill[stealth]',
			traits: ['secret'],
		})
	}

	pertinent(engagement, warn) {
		const relative = new RelativeConditions()
		const concealed = new Condition(engagement.initiator, CONDITION_CONCEALED).exists

		let result = true
		for (const target of engagement.targets) {
			const awareness = relative.getAwarenessTowardMe(target)
			const cover = relative.getMyCoverFrom(target) ?? 0
			if (awareness < 3) {
				result = false
				if (warn) this._.warn("PF2E.MKS.Warning.Target.AlreadyHidden")
				break
			}
			
			if (cover < 2 && !concealed) {
				result = false
				if (warn) this._.warn("PF2E.MKS.Warning.Target.NoCoverOrConcealment")
				break
			}
		}
		return result
	}

	async apply(engagement, result) {
		const relative = new RelativeConditions()
		const roll = result.roll

		for (const target of engagement.targets) {
			const dc =  target.actor.perception.dc.value
				, awareness = relative.getAwarenessTowardMe(target)
				, cover = relative.getMyCoverFrom(target) ?? 0
			const coverBonus = Math.max(0, 2 * (cover-1))
			const degree = DCHelper.calculateRollSuccess(roll, dc - coverBonus)
			const conditionUuid = degree < 2 ? UUID_CONDITONS.observed : UUID_CONDITONS.hidden
			
			if (degree > 1)
				relative.setAwarenessTowardMe(target, Math.min(awareness, 2))
				
			const message = i18n.$$('PF2E.Actions.Stealth.Result', {target: target.name
				, roll: roll.total, dc, cover: coverBonus
				, currentCondRef: `@UUID[${UUID_CONDITONS[AWARENESS[awareness]]}]`
				, conditionRef: `@UUID[${conditionUuid}]`})
			this.messageToChat(engagement.initiator, message, true)
		}
	}
}