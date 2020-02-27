import React from 'react';
import Reactium, {
    __,
    useHookComponent,
    useCapabilityCheck,
    useAsyncEffect,
    useFulfilledObject,
} from 'reactium-core/sdk';

import {
    Button,
    Icon,
    DatePicker,
    TimePicker,
    DropDown,
} from '@atomic-reactor/reactium-ui';

import op from 'object-path';
import _ from 'underscore';
import cn from 'classnames';

const ENUMS = {
    DEFAULT_STATUSES: ['DRAFT', 'PUBLISHED'],
    MODES: {
        LOADING: 'LOADING',
        LOADED: 'LOADED',
    },
    CAPS: {
        PUBLISH: collection => [
            [`${collection}.publish`, 'publish-content'],
            false,
        ],
        UNPUBLISH: collection => [
            [`${collection}.unpublish`, 'unpublish-content'],
            false,
        ],
        STATUS: (collection, status) => [
            [`${collection}.setStatus-${status}`, 'set-content-status'],
            false,
        ],
    },
    BUTTON_MODES: {
        PUBLISH: {
            text: __('Publish'),
            tooltip: __('Publish current version of content'),
        },
        UNPUBLISH: {
            text: __('Unpublish'),
            tooltip: __('Unpublish current version of content'),
        },
        SET_STATUS: {
            text: __('Set Status'),
            tooltip: __('Set status on current version of content.'),
        },
        DISABLED: {
            text: __('Disabled'),
            tooltip: __(
                'You do not have permission to do anything to this content.',
            ),
        },
    },
};

const usePublisherSettings = props => {
    const contentType = op.get(props, 'editor.contentType');
    const collection = op.get(contentType, 'collection');
    const statuses = _.chain(
        (op.get(props, 'statuses', '') || '')
            .split(',')
            .concat(ENUMS.DEFAULT_STATUSES),
    )
        .compact()
        .uniq()
        .sort()
        .value();
    const simple = !!op.get(props, 'simple');

    const can = {
        publish: useCapabilityCheck(...ENUMS.CAPS.PUBLISH(collection)),
        unpublish: useCapabilityCheck(...ENUMS.CAPS.UNPUBLISH(collection)),
    };

    const config = { can, simple };
    const cans = useFulfilledObject(config, [
        'can.publish',
        'can.unpublish',
        // 'can.statuses',
    ]);
    console.log({ cans });
    // return useFulfilledObject(config, [can, simple]);
    return config;
};

const PublisherEditor = props => {
    const config = usePublisherSettings(props);
    const ElementDialog = useHookComponent('ElementDialog');

    const contentType = op.get(props, 'editor.contentType');
    const collection = op.get(contentType, 'collection');

    console.log({ props, config });
    return <ElementDialog {...props}>PUBLISHER</ElementDialog>;
};

export default PublisherEditor;
