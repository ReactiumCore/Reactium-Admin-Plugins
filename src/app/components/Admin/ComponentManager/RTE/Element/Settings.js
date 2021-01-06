import React from 'react';
import cc from 'camelcase';
import _ from 'underscore';
import op from 'object-path';
import { useEditor } from 'slate-react';
import { Editor, Transforms } from 'slate';
import { Scrollbars } from 'react-custom-scrollbars';
import AttributeInput from '../Panel/AttributeInput';

import Reactium, {
    __,
    useEventHandle,
    useHookComponent,
    useRefs,
} from 'reactium-core/sdk';

const noop = () => {};

const CloseButton = props => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <Button
            size={Button.ENUMS.SIZE.XS}
            color={Button.ENUMS.COLOR.CLEAR}
            className='ar-dialog-header-btn dismiss'
            {...props}>
            <Icon name='Feather.X' />
        </Button>
    );
};

const Settings = ({ children, editor, ...props }) => {
    const refs = useRefs();

    const keys = op.get(children, 'props.node.block.attributes', []);

    const attributes = JSON.parse(
        JSON.stringify(op.get(children, 'props.node.block.attribute', {})),
    );

    const { Button, Dialog } = useHookComponent('ReactiumUI');

    const cx = Reactium.Utils.cxFactory('blocks-rte');

    const getNode = () => {
        const nodes = Editor.nodes(editor, {
            at: [],
            match: ({ ID }) => ID === props.id,
        });

        let node = _.first(Array.from(nodes));
        return node ? _.object(['node', 'path'], node) : null;
    };

    const hide = () => editor.panel.hide(false, true).setID('rte-panel');

    const header = () => ({
        elements: [<CloseButton key='close-btn' onClick={() => hide()} />],
        title: __('Attributes'),
    });

    const _value = () =>
        Object.entries(refs.get('input')).reduce((obj, [field, elm]) => {
            if (!elm) return obj;
            op.set(obj, field, elm.value);
            return obj;
        }, {});

    const _submit = (val = {}) => {
        const value = { ...val, ..._value() };
        const { node, path } = getNode();

        if (!node) return;

        const block = JSON.parse(JSON.stringify(node.block));
        op.set(block, 'attribute', value);
        Transforms.setNodes(editor, { block }, { at: path });
        hide();
    };

    const _handle = () => ({
        refs,
        setValue: noop,
        submit: _submit,
    });

    const [handle] = useEventHandle(_handle());

    return (
        <Dialog
            header={header()}
            collapsible={false}
            dismissable={false}
            ref={elm => refs.set('container', elm)}>
            <div className={cx()}>
                <div className={cx('form-fields')}>
                    <Scrollbars
                        autoHeight
                        autoHeightMin={324}
                        autoHeightMax='80vh'>
                        <div className='fieldset'>
                            {keys.map(key => (
                                <div
                                    className='form-group'
                                    key={`attribute-${key}`}>
                                    <AttributeInput
                                        name={cc(key)}
                                        handle={handle}
                                        placeholder={key}
                                        defaultValue={op.get(
                                            attributes,
                                            key,
                                            '',
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                    </Scrollbars>
                </div>
                <div className={cx('form-footer')}>
                    <Button block type='button' onClick={_submit}>
                        {__('Update Attributes')}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default props => {
    const editor = useEditor();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const showPanel = () => {
        const x = window.innerWidth / 2 - 150;

        editor.panel
            .setID('rte-components')
            .setContent(<Settings {...props} editor={editor} />)
            .moveTo(x, 50)
            .show();
    };

    return (
        <Button color={Button.ENUMS.COLOR.SECONDARY} onClick={showPanel}>
            <Icon name='Linear.Beaker' size={props.iconSize || 14} />
        </Button>
    );
};
