import Reactium from 'reactium-core/sdk';
import FieldTypeLink from './index';
import { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import op from 'object-path';

const registerFieldTypePlugin = async () => {
    await Reactium.Plugin.register('FieldTypeLink');
    Reactium.Component.register('FieldTypeLink', FieldTypeLink);

    await Reactium.Hook.register('field-type-enums', async Enums => {
        op.set(Enums, 'TYPES.LINK', {
            type: 'Link',
            label: __('Link Field'),
            icon: Icon.Feather.Link,
            tooltip: __('Adds a link field to your content type.'),
            component: 'FieldTypeLink',
            order: Reactium.Enums.priority.high,
        });
    });
};

registerFieldTypePlugin();
