import op from 'object-path';
import Settings from './Settings';
import ReactPlayer from 'react-player';
import React, { useEffect } from 'react';
import Reactium, { useStatus } from 'reactium-core/sdk';

const STATUS = {
    PENDING: 'pending',
    LOADING: 'loading',
    CHANGE: 'change',
    READY: 'ready',
};

export default props => {
    const [status, setStatus, isStatus] = useStatus(STATUS.LOADING);

    useEffect(() => {
        const comps = [
            Reactium.Zone.addComponent({
                component: () => <Settings {...props} />,
                order: Reactium.Enums.priority.highest,
                zone: `type-${props.blockID}-toolbar`,
            }),
        ];

        return () => {
            comps.forEach(zid => Reactium.Zone.removeComponent(zid));
        };
    }, []);

    useEffect(() => {
        if (isStatus(STATUS.PENDING)) return;
        setStatus(STATUS.CHANGE, true);
    }, [props]);

    useEffect(() => {
        switch (status) {
            case STATUS.CHANGE:
                setStatus(STATUS.PENDING, true);
                break;

            case STATUS.PENDING:
                setStatus(STATUS.READY, true);
                break;
        }
    }, [status]);

    return !op.get(props, 'src') || !ReactPlayer.canPlay(props.src) ? null : (
        <div contentEditable={false} className='ar-rte-video'>
            {isStatus(STATUS.READY) ? (
                <ReactPlayer
                    url={props.src}
                    loop={op.get(props, 'loop')}
                    muted={op.get(props, 'muted')}
                    playing={op.get(props, 'autoplay')}
                    width={op.get(props, 'width', '640px')}
                    height={op.get(props, 'height', '360px')}
                    light={op.get(props, 'thumbnail', false)}
                    controls={op.get(props, 'controls', false)}
                    onReady={() => setStatus(STATUS.READY, true)}
                    volume={Number(op.get(props, 'volume', 0)) / 100}
                />
            ) : (
                <div
                    style={{
                        width: op.get(props, 'width', 640),
                        height: op.get(props, 'height', 360),
                    }}
                />
            )}
        </div>
    );
};
