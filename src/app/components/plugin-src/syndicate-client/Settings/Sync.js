import Reactium, {
    __,
    useAsyncEffect,
    useHookComponent,
} from 'reactium-core/sdk';

import op from 'object-path';
import shallow from 'shallow-equals';
import React, { memo, useState } from 'react';

const settings = group => ({
    appId: op.get(group, 'appId'),
    host: op.get(group, 'host'),
    token: op.get(group, 'token'),
});

const checkEqual = (pv, nx) => {
    return (
        op.get(pv, 'groupName') === op.get(nx, 'groupName') &&
        shallow(op.get(pv, 'settingGroup'), op.get(nx, 'settingGroup'))
    );
};

const defaultSyncContext = {
    label: '',
    count: [0, 0],
};

const Sync = memo(({ settingGroup }) => {
    const { Icon, Button } = useHookComponent('ReactiumUI');
    const [state, setState] = useState({
        loading: true,
        valid: false,
        forceUpdated: new Date(),
    });
    const [syncState, setSyncState] = useState({
        syncStatus: 'end',
        syncContext: defaultSyncContext,
    });

    const updateState = newState => {
        setState({
            ...state,
            ...newState,
        });
    };

    const { appId, host, token } = settings(settingGroup);
    useAsyncEffect(
        async isMounted => {
            if ((appId, host, token)) {
                updateState({ loading: true });
                // console.log('state change, call syndicate-satellite-test');
                const valid = await Reactium.Cloud.run(
                    'syndicate-satellite-test',
                );

                // console.log('syndicate-satellite-test back, mounted', { mounted: isMounted() });
                if (isMounted()) {
                    updateState({
                        loading: false,
                        valid,
                    });
                }
            }
        },
        [appId, host, token, state.forceUpdated],
    );

    const syncStatusLabels = {
        end: __('Sync Content'),
        begin: __('Starting...'),
        taxonomies: __('Syncing Taxonomies...'),
        media: __('Syncing Media...'),
        types: __('Syncing Types...'),
        content: __('Syncing %context...'),
        relations: __('Syncing %context...'),
    };

    Reactium.Hook.runSync('syndicate-client-status-labels', syncStatusLabels);

    const sync = async () => {
        const {
            syncStatus = 'end',
            syncContext = defaultSyncContext,
        } = await Reactium.Cloud.run('syndicate-satellite-sync');
        // console.log('sync', { syncStatus, syncContext });

        setSyncState({ syncStatus, syncContext });
    };

    const { syncStatus, syncContext } = syncState;
    useAsyncEffect(
        async isMounted => {
            if (syncStatus !== 'end') {
                const check = setInterval(async () => {
                    const {
                        syncStatus = 'end',
                        syncContext = defaultSyncContext,
                    } = await Reactium.Cloud.run('syndicate-satellite-status');

                    // console.log('check', { syncStatus, syncContext });

                    if (isMounted()) setSyncState({ syncStatus, syncContext });
                }, 500);

                return () => clearInterval(check);
            }

            // return;
            // if (syncStatus === 'end') {
            //     await Reactium.Cloud.run('syndicate-satellite-sync-reset');
            //     if (isMounted())
            //         setSyncState({
            //             syncStatus: 'idle',
            //             syncContext: defaultSyncContext,
            //         });
            // } else {
            // }
        },
        [syncStatus, ...op.get(syncContext, 'count', defaultSyncContext.count)],
    );

    if (!(appId && host && token)) return null;
    if (state.loading || state.valid) null;

    const contextLabel = op.get(syncContext, 'label', '');
    const [n, of] = op.get(syncContext, 'count', [0, 0]);
    // console.log({ syncStatus, contextLabel, n, of });
    return (
        <div className='m-xs-20'>
            <Button
                size='md'
                color={syncStatus === 'end' ? 'danger' : 'clear'}
                onClick={() => sync()}
                disabled={syncStatus !== 'end'}>
                {syncStatus !== 'end' && (
                    <div
                        className='mr-xs-8'
                        style={{ width: '20px', height: '20px' }}>
                        <Icon name={'Feather.DownloadCloud'} />
                    </div>
                )}{' '}
                {op
                    .get(syncStatusLabels, [syncStatus], syncStatusLabels.start)
                    .replace(
                        '%context',
                        `${contextLabel} ${of > 0 && `${n}/${of}`}`,
                    )}
            </Button>
        </div>
    );
}, checkEqual);

export default Sync;
