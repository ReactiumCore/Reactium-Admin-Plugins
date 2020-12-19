import _ from 'underscore';
import op from 'object-path';
import Settings from './Settings';
import ReactPlayer from 'react-player';
import React, { useEffect } from 'react';
import Reactium, {
    useDerivedState,
    useHookComponent,
    useStatus,
} from 'reactium-core/sdk';

const STATUS = {
    PENDING: 'pending',
    LOADING: 'loading',
    CHANGE: 'change',
    READY: 'ready',
};

const propsToState = props => ({
    src: op.get(props, 'src'),
    loop: op.get(props, 'loop'),
    muted: op.get(props, 'muted'),
    autoplay: op.get(props, 'autoplay'),
    width: op.get(props, 'width', '640px'),
    height: op.get(props, 'height', '360px'),
    thumbnail: op.get(props, 'thumbnail', false),
    controls: op.get(props, 'controls', false),
    volume: Number(op.get(props, 'volume', 0)) / 100,
});

export default ({ children, ...props }) => {
    const { Spinner } = useHookComponent('ReactiumUI');

    const initialState = propsToState(props);

    const [state, setState] = useDerivedState(initialState);

    const style = {
        minHeight: op.get(state, 'height', 360),
        minWidth: op.get(state, 'width', 640),
    };

    const spinnerStyle = {
        top: '50%',
        left: '50%',
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
    };

    const [status, setStatus, isStatus] = useStatus(STATUS.LOADING);

    const isBusy = () => !isStatus(STATUS.READY);

    useEffect(() => {
        const comps = [
            Reactium.Zone.addComponent({
                component: () => <Settings {...props} node={state} />,
                order: Reactium.Enums.priority.highest,
                zone: `type-${props.blockID}-toolbar`,
            }),
        ];

        return () => {
            comps.forEach(zid => Reactium.Zone.removeComponent(zid));
        };
    }, [state]);

    useEffect(() => {
        if (isStatus(STATUS.LOADING)) return;
        let newState = propsToState(props);
        if (_.isEqual(newState, state)) return;
        setStatus(STATUS.CHANGE);
        setState(newState);
    }, [props]);

    useEffect(() => {
        if (isStatus(STATUS.LOADING)) return;

        switch (status) {
            case STATUS.CHANGE:
                setStatus(STATUS.PENDING, true);
                break;

            case STATUS.PENDING:
                setStatus(STATUS.READY, true);
                break;
        }
    }, [status]);

    return !op.get(state, 'src') || !ReactPlayer.canPlay(state.src) ? null : (
        <div contentEditable={false} className='ar-rte-video' style={style}>
            <ReactPlayer
                url={op.get(state, 'src')}
                loop={op.get(state, 'loop')}
                muted={op.get(state, 'muted')}
                playing={op.get(state, 'autoplay')}
                width={op.get(state, 'width', '640px')}
                height={op.get(state, 'height', '360px')}
                light={op.get(state, 'thumbnail', false)}
                controls={op.get(state, 'controls', false)}
                onReady={() => setStatus(STATUS.READY, true)}
                volume={Number(op.get(state, 'volume', 0)) / 100}
            />
            {children}
            {isBusy() && <Spinner style={spinnerStyle} />}
        </div>
    );
};
