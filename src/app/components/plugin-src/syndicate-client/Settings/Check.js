import React, { memo, useState } from 'react';
import Reactium, {
    useHookComponent,
    useAsyncEffect,
    __,
} from 'reactium-core/sdk';
import op from 'object-path';
import shallow from 'shallow-equals';

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

const Check = memo(({ settingGroup }) => {
    const { Spinner, Alert, Icon, Button } = useHookComponent('ReactiumUI');
    const [state, setState] = useState({
        loading: true,
        valid: false,
        forceUpdated: new Date(),
    });

    const updateState = newState => {
        setState({
            ...state,
            ...newState,
        });
    };

    const retest = () => {
        updateState({
            forceUpdated: new Date(),
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

    if (!(appId && host && token)) return null;
    if (state.loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    height: '60px',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Spinner />
            </div>
        );
    }

    const msgs = {
        success: __('Connection test successful.'),
        failure: __('Connection test failed.'),
    };

    return (
        <div className='p-xs-20'>
            <Alert
                dismissable
                color={
                    state.valid
                        ? Alert.ENUMS.COLOR.SUCCESS
                        : Alert.ENUMS.COLOR.DANGER
                }
                icon={
                    <Icon
                        name={
                            state.valid
                                ? 'Feather.Check'
                                : 'Feather.AlertOctagon'
                        }
                    />
                }>
                {state.valid ? msgs.success : msgs.failure}
                <Button
                    className='ml-xs-16'
                    size='xs'
                    appearance='pill'
                    onClick={() => retest()}>
                    {__('Refresh')}
                </Button>
            </Alert>
        </div>
    );
}, checkEqual);

export default Check;
