import React, { useState } from 'react';
import Reactium, {
    __,
    useHandle,
    useHookComponent,
    useAsyncEffect,
    useFulfilledObject,
} from 'reactium-core/sdk';

import op from 'object-path';
import _ from 'underscore';
import cn from 'classnames';
import ENUMS from './enums';

import ContentStatus from './ContentStatus';
import Scheduler from './Scheduler';
import PublishButton from './PublishButton';

// TODO: Make backend content-capabilities call, that give matrix is capabilities
// for the content type, instead of checking these individually
// Make this part of the editor handle
const usePublisherSettings = props => {
    const contentType = op.get(props, 'editor.contentType');
    const collection = op.get(contentType, 'collection');
    const statuses = _.chain((op.get(props, 'statuses', '') || '').split(','))
        .without('PUBLISHED', 'TRASH')
        .compact()
        .uniq()
        .sort()
        .value();

    const simple = !!op.get(props, 'simple');

    const can = {};

    const [config, setConfig] = useState({ can, simple, statuses });

    useAsyncEffect(
        async isMounted => {
            const can = {
                publish: await Reactium.Capability.check(
                    ...ENUMS.CAPS.PUBLISH(collection),
                ),
                unpublish: await Reactium.Capability.check(
                    ...ENUMS.CAPS.UNPUBLISH(collection),
                ),
            };

            const canStatus = {};
            for (const status of statuses) {
                const can = await Reactium.Capability.check(
                    ...ENUMS.CAPS.STATUS(collection, status),
                );
                op.set(canStatus, status, can);
            }

            if (isMounted())
                setConfig({
                    ...config,
                    can: {
                        ...can,
                        status: canStatus,
                    },
                });
        },
        [contentType.objectId],
    );

    return useFulfilledObject(config, [
        'statuses',
        'can.publish',
        'can.unpublish',
        'can.status',
    ]);
};

const UnsavedNotice = props => {
    return (
        <div className='p-xs-20'>
            {__('Save content to see publishing options.')}
        </div>
    );
};

const PublisherEditor = props => {
    const id = op.get(props, 'editor.value.objectId');
    const [ready, config] = usePublisherSettings(props);
    const ElementDialog = useHookComponent('ElementDialog');
    const editor = op.get(props, 'editor');
    const unsaved = !id;
    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');
    const ConfirmBox = useHookComponent('ConfirmBox');

    const dirtyCheck = action => () => {
        if (editor.isDirty()) {
            Modal.show(
                <ConfirmBox
                    message={__('You have unsaved changes. Save?')}
                    onCancel={() => Modal.hide()}
                    onConfirm={async () => {
                        await editor.save();
                        await action();
                        Modal.dismiss();
                    }}
                    title={__('Unsaved Changes')}
                />,
            );
        } else {
            action();
        }
    };

    const render = () => {
        if (!id) return <UnsavedNotice {...props} />;

        return (
            <>
                <ContentStatus
                    editor={editor}
                    config={config}
                    dirtyCheck={dirtyCheck}
                />
                <Scheduler
                    editor={editor}
                    config={config}
                    dirtyCheck={dirtyCheck}
                />
                <PublishButton
                    editor={editor}
                    config={config}
                    dirtyCheck={dirtyCheck}
                />
            </>
        );
    };

    return (
        ready && (
            <ElementDialog {...props}>
                <div className={cn('publisher-editor', { unsaved })}>
                    {render()}
                </div>
            </ElementDialog>
        )
    );
};

export default PublisherEditor;
