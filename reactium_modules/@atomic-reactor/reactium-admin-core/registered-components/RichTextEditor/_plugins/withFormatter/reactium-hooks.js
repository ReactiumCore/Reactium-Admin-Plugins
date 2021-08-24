import Reactium from 'reactium-core/sdk';
import { FontSelect } from './Panel/FontSelect';
import { ColorSelect } from './Panel/ColorSelect';
import { hexToRgb, rgbToHex } from './Panel/utils';
import { TextStyleSelect } from './Panel/TextStyleSelect';
import { TextAlignSelect } from './Panel/TextAlignSelect';

Reactium.Plugin.register(
    'RichTextEditorFormatter',
    Reactium.Enums.priority.highest,
).then(() => {
    Reactium.Component.register('RichTextEditorFormatter', {
        ColorSelect,
        FontSelect,
        TextAlignSelect,
        TextStyleSelect,
        hexToRgb,
        rgbToHex,
    });
});
