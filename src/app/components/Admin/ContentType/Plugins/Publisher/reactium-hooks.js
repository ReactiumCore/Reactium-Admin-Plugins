import React from 'react';
import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import { FieldType, Editor } from './index';

import op from 'object-path';
import _ from 'underscore';

const registerPublisher = async () => {
    await Reactium.Plugin.register('Publisher');

    const ID = 'PublisherFieldType';
    Reactium.Component.register(ID, FieldType);
    Reactium.Component.register(`${ID}-editor`, Editor);

    Reactium.ContentType.FieldType.register({
        id: 'publisher',
        type: 'Publisher',
        label: __('Publisher'),
        icon: Icon.Feather.Send,
        tooltip: __('Place publisher widget.'),
        component: 'PublisherFieldType',
        order: Reactium.Enums.priority.neutral,
        // this is 'default' by default :)
        defaultRegion: 'sidebar',
        // only one per content type
        singular: true,
        // don't automatically include help text field in form
        showHelpText: false,
        // use these default values to fill in my form on new
        defaultValues: {
            fieldName: __('Publish'),
            simple: false,
        },
        // add this field type automatically on new content type
        autoInclude: true,
    });

    Reactium.Hook.register(
        'content-type-capabilities',
        async (
            capabilities,
            type,
            collection,
            machineName,
            savedRef,
            context,
        ) => {
            const statuses = _.compact(
                op
                    .get(
                        savedRef.current,
                        'fields.publisher.statuses',
                        'DRAFT,PUBLISHED',
                    )
                    .split(',')
                    .filter(status => !['DRAFT', 'PUBLISHED'].includes(status)),
            );

            context.capabilities = [...capabilities];

            if (statuses.length) {
                statuses.forEach(status => {
                    context.capabilities.push({
                        capability: `${collection}.setStatus-${status}`,
                        title: __('%type: Set %status status')
                            .replace('%type', type)
                            .replace('%status', status),
                        tooltip: __(
                            'Able to set content status of type %type (%machineName) to %status',
                        )
                            .replace('%type', type)
                            .replace('%machineName', machineName)
                            .replace('%status', status),
                    });
                });
            }
        },
    );
};

registerPublisher();
