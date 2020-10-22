import _ from 'underscore';
import uuid from 'uuid/v4';
import PropTypes from 'prop-types';
import { Transforms } from 'slate';
import React, { useEffect, useState } from 'react';
import { ReactEditor, useEditor } from 'slate-react';
import { Button, Dialog, Icon } from '@atomic-reactor/reactium-ui';

import Reactium, {
    __,
    useDerivedState,
    useFocusEffect,
    useRefs,
} from 'reactium-core/sdk';

const useElements = props => {
    const [elements, setElements] = useState(props.elements);

    useEffect(() => {
        let elms = props.elements;

        Reactium.Hook.runSync('rte-form-elements', elms);

        setElements(elms);
    }, [props.elements]);

    return [elements, setElements];
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Panel
 * -----------------------------------------------------------------------------
 */
const CloseButton = props => (
    <Button
        size={Button.ENUMS.SIZE.XS}
        color={Button.ENUMS.COLOR.CLEAR}
        className='ar-dialog-header-btn dismiss'
        {...props}>
        <Icon name='Feather.X' />
    </Button>
);

const Panel = ({ submitButtonLabel, namespace, title, ...props }) => {
    const refs = useRefs();
    const editor = useEditor();
    const [elements] = useElements(props);

    // Initial state
    const [state, setState] = useDerivedState({
        selection: editor.selection,
    });

    // className prefixer
    const cx = Reactium.Utils.cxFactory(namespace);

    const insertNode = e => {
        if (e) e.preventDefault();

        const element = refs.get('element').value;

        const id = uuid();

        const children = [
            {
                id: `form-element-${id}`,
                type: 'formElement',
                element,
                children: [{ text: element }],
            },
        ];

        const node = {
            blockID: `block-${id}`,
            blocked: true,
            children,
            id: `form-${id}`,
            type: 'form',
        };

        const selection = JSON.parse(JSON.stringify(editor.selection));

        Reactium.RTE.insertBlock(editor, node, { id, className: 'rte-form' });
        Transforms.select(editor, selection);

        // hide();
    };

    const hide = () => {
        editor.panel.hide(true, true);
        ReactEditor.focus(editor);
    };

    const header = () => ({
        elements: [<CloseButton onClick={hide} key='close-btn' />],
        title,
    });

    useFocusEffect(editor.panel.container);

    useEffect(() => {
        if (!editor.selection) return;
        setState({ selection: editor.selection });
    }, [editor.selection]);

    // Renderers
    return (
        <Dialog collapsible={false} dismissable={false} header={header()}>
            <div className='p-xs-12'>
                <div className='form-group'>
                    <select ref={elm => refs.set('element', elm)}>
                        {elements.map(({ value, label }, i) => (
                            <option value={value} key={`element-${i}`}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className={cx('footer')}>
                <Button block color='tertiary' size='md' onClick={insertNode}>
                    {submitButtonLabel}
                </Button>
            </div>
        </Dialog>
    );
};

Panel.propTypes = {
    className: PropTypes.string,
    elements: PropTypes.array,
    namespace: PropTypes.string,
    removeButtonLabel: PropTypes.node,
    submitButtonLabel: PropTypes.node,
    title: PropTypes.string,
};

Panel.defaultProps = {
    elements: [
        { value: 'text', label: __('Text') },
        { value: 'textarea', label: __('Text Area') },
        { value: 'number', label: __('Number') },
        { value: 'email', label: __('Email') },
        { value: 'password', label: __('Password') },
        { value: 'phone', label: __('Phone') },
        { value: 'select', label: __('Select') },
        { value: 'checkbox', label: __('Checkbox') },
        { value: 'radio', label: __('Radio') },
        { value: 'submit', label: __('Button') },
    ],
    namespace: 'rte-form-panel',
    submitButtonLabel: __('Insert Element'),
    title: __('Form Element'),
};

export { Panel as default };
