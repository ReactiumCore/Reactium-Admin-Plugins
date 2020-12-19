import _ from 'underscore';
import op from 'object-path';
import { useEditor } from 'slate-react';
import React, { useEffect } from 'react';
import { Editor, Transforms } from 'slate';
import Settings from '../withBlock/Settings';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useHandle,
    useHookComponent,
    useStatus,
} from 'reactium-core/sdk';

const INIT = 'INIT';
const LOADING = 'LOADING';
const COMPLETE = 'COMPLETE';

const getNodeProps = props => {
    const { nodeProps = {} } = props;
    let allowed = ['alt', 'className', 'crossorigin', 'data', 'style'];

    Reactium.Hook.runSync('rte-node-props-allowed', allowed, props);

    const output = allowed.reduce((obj, key) => {
        const val = op.get(nodeProps, key);

        if (val && allowed.includes(key)) {
            op.set(obj, key, val);
        }
        return obj;
    }, {});

    Reactium.Hook.runSync('rte-node-props', output, props);

    return output;
};

export default ({ children, ...props }) => {
    const editor = useEditor();
    const tools = useHandle('AdminTools');

    const MediaPicker = useHookComponent('MediaPicker');
    const { Spinner } = useHookComponent('ReactiumUI');

    const [, setStatus, isStatus] = useStatus(INIT);

    const [state, setState] = useDerivedState({
        src: null,
        nodeProps: getNodeProps(props),
    });

    const showPicker = () => {
        const Modal = op.get(tools, 'Modal');
        Modal.show(
            <MediaPicker
                confirm={false}
                dismissable
                filters='IMAGE'
                onSubmit={_onMediaSelect}
                onDismiss={() => Modal.hide()}
                title={__('Select Image')}
            />,
        );
    };

    const _onMediaSelect = e => {
        const Modal = op.get(tools, 'Modal');

        const nodes = Editor.nodes(editor, {
            at: [],
            match: ({ id }) => id === props.id,
        });

        let node = _.first(Array.from(nodes));
        if (!node) {
            Modal.hide();
            return;
        }
        node = _.object(['node', 'path'], node);

        const item = _.last(e.selection);
        if (!item) {
            Modal.hide();
            return;
        }

        const { objectId, url } = item;

        Transforms.setNodes(editor, { objectId, src: url }, { at: node.path });
        Modal.hide();
    };

    const onLoad = url => () => {
        setStatus(COMPLETE);
        setState({ src: url });
    };

    const loadImage = url => {
        setStatus(LOADING, true);
        const img = new Image();
        img.addEventListener('load', onLoad(url));
        img.crossOrigin = 'anonymous';
        img.src = url;
    };

    useEffect(() => {
        if (props.src === state.src) return;
        if (isStatus(LOADING)) return;
        loadImage(props.src);
    }, [props.src]);

    useEffect(() => {
        setState({ nodeProps: getNodeProps(props) });
    }, [props.nodeProps]);

    useAsyncEffect(async () => {
        const zid = await Reactium.Zone.addComponent({
            component: () => (
                <Settings
                    {...props}
                    linkable
                    nodeProps={getNodeProps(props)}
                    icon='Feather.Camera'
                />
            ),
            order: Reactium.Enums.priority.highest,
            zone: `type-${props.blockID}-toolbar`,
        });

        return () => {
            Reactium.Zone.removeComponent(zid);
        };
    }, [props]);

    return (
        <div contentEditable={false} className='ar-rte-image'>
            {children}
            {isStatus(COMPLETE) ? (
                <img
                    {...state.nodeProps}
                    src={state.src}
                    contentEditable={false}
                    onClick={showPicker}
                />
            ) : (
                <Spinner className='flex flex-center' />
            )}
        </div>
    );
};
