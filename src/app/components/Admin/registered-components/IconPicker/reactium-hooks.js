import Component from '.';
import domain from './domain';
import IconSelect from './IconSelect';
import Reactium from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';

Reactium.Plugin.register(domain.name, Reactium.Enums.priority.highest).then(
    async () => {
        // Register the UI Component
        Reactium.Component.register(domain.name, Component);
        Reactium.Component.register('IconSelect', IconSelect);

        // Add icons
        await Reactium.Hook.run('icon-extend', Icon.icons);
    },
);

/**
 * @api {RegisteredComponent} <IconPicker/> IconPicker
 * @apiDescription <img src='https://reactium-cnd.sfo2.digitaloceanspaces.com/actinium-admin-IconPicker.png' style='width: 100%;' />

 Displays a list of the icons associated with the Reactium UI `<Icon />` component.

 You can add icon sets to the component by appending to the `Icon.icons` static property.
 * @apiName IconPicker
 * @apiGroup Registered Component
 * @apiParam {String} [color='#666666'] The color of the icons.
 * @apiParam {Number} [height=250] The height in pixels of the picker.
 * @apiParam {Object} [icons] Manually set the icons object.
 * @apiParam {Boolean} [multiselect=false] Whether to allow multiple icons to be selected.
 * @apiParam {String} [search] Filter the icons by the icon name.
 * @apiParam {Number} [size=18] The size (in pixels) of the icons.
 * @apiParam {Array} [value] Array of selected icons.
 * @apiParam {Function} [onChange] Function to execute when the `change` event is triggered.
 * @apiParam {Function} [onMouseOut] Function to execute when the `mouseout` event is triggered.
 * @apiParam {Function} [onMouseOver] Function to execute when the `mouseover` event is triggered.
 * @apiParam {Function} [onResize] Function to execute when the `resize` event is triggered.
 * @apiParam {Function} [onSearch] Function to execute when the `search` event is triggered.
 * @apiParam {Function} [onSelect] Function to execute when the `select` event is triggered.
 * @apiParam {Function} [onTouchStart] Function to execute when the `touchstart` event is triggered.
 * @apiParam {Function} [onUnselect] Function to execute when the `unselect` event is triggered.
 * @apiParam (Method) {Function} setColor Set the `color` property.
 * @apiParam (Method) {Function} setIcons Set the `icons` property.
 * @apiParam (Method) {Function} setMultiselect Set the `multiselect` property.
 * @apiParam (Method) {Function} setSearch Set the `search` property.
 * @apiParam (Method) {Function} setSize Set the `size` property.
 * @apiParam (Method) {Function} setValue Set the `value` property.
 * @apiParam (Event) {PickerEvent} change dispatched when the `value` property has changed.
 * @apiParam (Event) {PickerEvent} mouseout dispatched when the mouse moves outside an icon bounding rectangle.
 * @apiParam (Event) {PickerEvent} mouseover dispatched when the mouse moves over an icon bounding rectangle.
 * @apiParam (Event) {PickerEvent} resize dispatched when the `size` property has changed.
 * @apiParam (Event) {PickerEvent} search dispatched when the `search` property has changed.
 * @apiParam (Event) {PickerEvent} select dispatched when an icon is clicked.
 * @apiParam (Event) {PickerEvent} touchstart dispatched when an icon is touched (mobile only).
 * @apiParam (Event) {PickerEvent} unselect dispatched when an icon is unselected. Only applicable when `multiselect=true`.
 * @apiExample useHookComponent() hook import
import { useHookComponent } from 'reactium-core/sdk';

const MyComponent = () => {
    const IconPicker = useHookComponent('IconPicker');

    const onChange = e => {
        const { value } = e.target;
        console.log(value);
    };

    return (
        <IconPicker onChange={onChange} />
    );
}

* @apiExample Simple Usage:
import IconPicker from 'components/Admin/registered-components/IconPicker';

...

<IconPicker />
 */
