import _ from 'underscore';
import op from 'object-path';
import { Transforms } from 'slate';
import { useEditor } from 'slate-react';
import React, { useEffect } from 'react';
import Settings from '../withBlock/Settings';

import Reactium, {
    __,
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

    const getNode = () => Reactium.RTE.getNodeByID(editor, props.id);

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
        const node = getNode();
        const Modal = op.get(tools, 'Modal');

        const item = _.last(e.selection);
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

    useEffect(() => {
        const zid = Reactium.Zone.addComponent({
            component: otherProps => {
                const { node, path } = getNode();
                const newNode = {
                    ...node,
                    linkable: true,
                    nodeProps: getNodeProps(props),
                };
                return (
                    <SettingsButton
                        {...otherProps}
                        node={newNode}
                        path={path}
                    />
                );
            },
            order: Reactium.Enums.priority.highest,
            zone: 'block-actions-left',
        });

        return () => {
            Reactium.Zone.removeComponent(zid);
        };
    }, []);

    return (
        <div className='ar-rte-image'>
            {isStatus(COMPLETE) ? (
                <img
                    src={state.src}
                    {...state.nodeProps}
                    onClick={showPicker}
                    contentEditable={false}
                />
            ) : (
                <Spinner className='flex flex-center' />
            )}
            {children}
        </div>
    );
};

const SettingsButton = ({ editor, handle, node, path }) => {
    const { id, blockID } = node;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const visible = blockID === handle.id;

    const _onClick = () =>
        handle.showDialog(
            { editor, id },
            <Settings
                id={id}
                node={node}
                path={path}
                selection={editor.selection}
            />,
        );

    return !visible ? null : (
        <Button onClick={_onClick} title={__('Image Properties')}>
            <Icon name='Feather.Camera' size={14} />
        </Button>
    );
};
