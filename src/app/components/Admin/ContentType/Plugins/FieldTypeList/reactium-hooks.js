import Reactium from 'reactium-core/sdk';
import FieldTypeList from './index';
import { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import op from 'object-path';

const registerFieldTypePlugin = async () => {
    await Reactium.Plugin.register('FieldTypeList');
    Reactium.Component.register('FieldTypeList', FieldTypeList);

    await Reactium.Hook.register('field-type-enums', async Enums => {
        op.set(Enums, 'TYPES.LIST', {
            type: 'List',
            label: __('List Field'),
            icon: Icon.Linear.List,
            tooltip: __('Adds a list field to your content type.'),
            component: 'FieldTypeList',
            order: Reactium.Enums.priority.neutral,
        });
    });
};

registerFieldTypePlugin();
