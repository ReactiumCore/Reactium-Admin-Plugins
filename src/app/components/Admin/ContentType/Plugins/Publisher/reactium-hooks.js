import React from 'react';
import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import Publisher from './index';
import op from 'object-path';
import _ from 'underscore';

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
