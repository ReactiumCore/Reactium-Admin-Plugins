import React from 'react';
import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import Publisher from './index';

const registerPublisher = async () => {
    await Reactium.Plugin.register('Publisher');

    Reactium.Component.register('Publisher', Publisher);

    Reactium.ContentType.FieldType.register({
        id: 'publisher',
        type: 'Publisher',
        label: __('Publisher'),
        icon: Icon.Feather.Send,
        tooltip: __('Place publisher widget.'),
        component: 'Publisher',
        order: Reactium.Enums.priority.neutral,
        defaultRegion: 'sidebar',
        singular: true,
        showHelpText: false,
        defaultValues: {
            fieldName: __('Publish'),
            simple: false,
        },
        autoInclude: true,
    });
};

registerPublisher();
