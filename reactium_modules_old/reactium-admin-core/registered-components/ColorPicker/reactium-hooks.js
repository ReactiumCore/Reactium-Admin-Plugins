import { ColorPicker } from '.';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('ColorPicker').then(() => {
    Reactium.Component.register('ColorPicker', ColorPicker);
});
