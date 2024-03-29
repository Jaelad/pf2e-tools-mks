import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Effect, { EFFECT_COVER_TAKEN } from "../model/effect.js"

export default class ActionTakeCover extends Action {
	constructor(MKS) {
		super(MKS, 'takeCover', 'encounter', false, false, {
			icon: "systems/pf2e/icons/conditions-2/status_acup.webp",
			actionGlyph: 'A',
			tags: ['combat']
		})
	}
	
	act(engagement, options) {
		new Effect(engagement.initiator, EFFECT_COVER_TAKEN).toogle().then()
	}
}
