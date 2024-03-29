import {default as i18n} from "../../lang/pf2e-i18n.js"
import $$strings from "../../utils/strings.js";
import Check from "../check.js";
import Compendium from "../compendium.js";

export default class Dialogs  {

	static inputNumber(title = 'PF2E.MKS.Dialog.InputNumber.Title', label, {currentValue = 0, min = 0, max = 10, step = 1}) {
		const dialogContent = `
		<form>
		<div class="form-group" data-setting-id="dialog.numberValue">
			<label>${i18n.$(label)}</label>
			<div class="form-fields">
				<input type="range" name="dialog.numberValue" data-dtype="Number" value="${currentValue}" min="${min}" max="${max}" step="${step}">
			</div>
		</div>
		</form>
		`
		return new Promise((resolve) => {
			new Dialog({
				title: i18n.$(title),
				content: dialogContent,
				buttons: {
					yes: {
						icon: '<i class="fas fa-slider"></i>',
						label: i18n.uiAction("set"),
						callback: ($html) => {
							const value = $html[0].querySelector('[name="dialog.numberValue"]').value
							resolve(value)
						},
					},
				},
				default: 'yes',
				close: () => resolve(null)
			}).render(true)
		})
	}

	static addModifier(title = 'PF2E.MKS.Dialog.AddModifier.Title') {
		const dialogContent = `
		<form>
		<div class="add-modifier-panel">
            <input type="text" name="label" class="add-modifier-name" placeholder="${i18n.$('PF2E.MKS.Dialog.AddModifier.Label')}">
            <select class="add-modifier-type" name="type">
                <option value="untyped" selected>${i18n.modifierType('untyped')}</option>
				<option value="circumstance">${i18n.modifierType('circumstance')}</option>
				<option value="status">${i18n.modifierType('status')}</option>
            </select>
            <input type="text" name="bonus" class="add-modifier-value" placeholder="+1">
        </div>
		</form>
		`
		return new Promise((resolve) => {
			new Dialog({
				title: i18n.$(title),
				content: dialogContent,
				buttons: {
					yes: {
						icon: '<i class="fas fa-plus"></i>',
						label: i18n.uiAction("add"),
						callback: ($html) => {
							const label = $html[0].querySelector('[name="label"]').value
							const type = $html[0].querySelector('[name="type"]').value
							const bonus = parseInt($html[0].querySelector('[name="bonus"]').value, 10)
							resolve(new game.pf2e.Modifier({
								label,
								type,
								modifier: bonus
							}))
						},
					},
				},
				default: 'yes',
				close: () => resolve(null)
			}).render(true)
		})
	}

	static selectOne(elems, selectLabel, labelFunc, valueFunc, title = 'PF2E.MKS.Dialog.SelectOne.Title') {
		const uuid = $$strings.generateUUID()
		let selectedItem = true
		const dialogContent = `
		<form>
		<div class="form-group">
			<label>${i18n.$(selectLabel)}</label>
			<select name="${uuid}">
				${elems.map((e) =>
					`<option value="${valueFunc?.(e) ?? e.value}" ${selectedItem ? 'selected' : ''} ${selectedItem = false}>${$$strings.escapeHtml(labelFunc ? labelFunc(e) : e.name)}</option>`
				).join('')}
			</select>
		</div>
		</form>
		`
		return new Promise((resolve) => {
			new Dialog({
				title: i18n.$(title),
				content: dialogContent,
				buttons: {
					// no: {
					// 	icon: '<i class="fas fa-times"></i>',
					// 	label: i18n.$("PF2E.MKS.UI.Actions.cancel"),
					// },
					yes: {
						icon: '<i class="fas fa-check-circle"></i>',
						label: i18n.uiAction('ok'),
						callback: ($html) => {
							const selectedValue = $html[0].querySelector('[name="' + uuid + '"]').value
							resolve(selectedValue)
						},
					},
				},
				default: 'yes',
				close: () => resolve(null)
			}).render(true)
		})
	}

	static selectItem(tokenOrActor, filter, title = 'PF2E.MKS.Dialog.SelectOne.Title') {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const items = actor.items.filter(filter)

		const dialogContent = `
			<ol class="directory-list">
				${items.map((item) =>
				`<li class="directory-item document actor selectable-item" onclick="$(this).children(':first').prop('checked', true)">
					<input type="radio" name="selectedItem" value="${item.id}">
					<img class="thumbnail" title="${item.name}" src="${item.img}">
					<h4 class="document-name">
						<a>${item.name}</a>
						<span class="actor-level">Level ${item.level}</span>
					</h4>
				</li>`
				).join('')}
			</ol>
		`
		return new Promise((resolve) => {
			if (items.length === 0) {
				ui.notifications.info(i18n.$("PF2E.MKS.Dialog.SelectItem.NoItemFound"))
				resolve(undefined)
				return
			}
			new Dialog({
				title: i18n.$(title),
				content: dialogContent,
				buttons: {
					no: {
						icon: '<i class="fas fa-times"></i>',
						label: i18n.uiAction('remove'),
						callback: () => resolve(null),
					},
					yes: {
						icon: '<i class="fas fa-check-circle"></i>',
						label: i18n.uiAction('ok'),
						callback: ($html) => {
							const selectedValue = $html[0].querySelector("input:checked")?.value
							resolve(items.find(i=>i.id === selectedValue))
						},
					},
				},
				default: 'yes',
				close: () => resolve(undefined)
			}, {width: 300}).render(true)
		})
	}

	static multipleButtons(elems, label, title = 'PF2E.MKS.Dialog.MultipleButtons.Title') {
		const dialogContent = `
		<form>
		<div class="form-group">
			<label>${i18n.$(label)}</label>
		</div>
		</form>
		`

		return new Promise((resolve) => {
			const buttons = {}
			elems.forEach((e, i) => {
				buttons['_' + i] = {
					icon: '<i class="fas fa-dot-circle"></i>',
					label: i18n.$(e.name),
					callback: () => resolve(e.value)
				}
			})

			new Dialog({
				title: i18n.$(title),
				content: dialogContent,
				buttons,
				default: '_0',
				close: () => resolve(null)
			}).render(true)
		})
	}
}