import React from 'react';
import cc from 'camelcase';
import _ from 'underscore';
import op from 'object-path';
import { Transforms } from 'slate';
import { Scrollbars } from 'react-custom-scrollbars';
import AttributeInput from '../Panel/AttributeInput';

import Reactium, {
    __,
    useDerivedState,
    useEventHandle,
    useHookComponent,
    useRefs,
} from 'reactium-core/sdk';

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

const Settings = ({ editor, node, ...props }) => {
    const refs = useRefs();

    const keys = op.get(node, 'block.attributes', []);

    const attributes = JSON.parse(
        JSON.stringify(op.get(node, 'block.attribute', {})),
    );

    const { Button, Dialog } = useHookComponent('ReactiumUI');

    const cx = Reactium.Utils.cxFactory('blocks-rte');

    const [value, update] = useDerivedState(attributes);

    const getNode = () => Reactium.RTE.getNodeByID(editor, props.id);

    const hide = () => editor.panel.hide(false, true).setID('rte-panel');

    const header = () => ({
        elements: [<CloseButton key='close-btn' onClick={() => hide()} />],
        title: __('Attributes'),
    });

    const setValue = (key, val) => {
        let newValue = JSON.parse(JSON.stringify(value));

        if (!_.isObject(key)) {
            op.set(newValue, key, val);
        } else {
            newValue = key;
        }

        update(newValue);
    };

    const _onChange = e => setValue(e.target.name, e.target.value);

    const _submit = () => {
        const { node, path } = getNode();

        if (!node) return;

        const block = JSON.parse(JSON.stringify(node.block));
        op.set(block, 'attribute', value);
        Transforms.setNodes(editor, { block }, { at: path });
        hide();
    };

    const _value = field => op.get(value, cc(field));

    const _handle = () => ({
        refs,
        setValue,
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
                                        onChange={_onChange}
                                        defaultValue={_value(key)}
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

export default Settings;
