import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import Select from './Select';
import { Transforms } from 'slate';
import { useEditor } from 'slate-react';

import Reactium, {
    __,
    useDerivedState,
    useFocusEffect,
    useHookComponent,
    useRefs,
} from 'reactium-core/sdk';

const clone = value => JSON.parse(JSON.stringify(value));

const Panel = props => {
    const editor = useEditor();

    const refs = useRefs();

    const [state] = useDerivedState({
        nodeProps: op.get(props, 'nodeProps', { style: {} }),
        previous: op.get(props, 'nodeProps', { style: {} }),
        type: op.get(props, 'node.element'),
    });

    const { Settings } = useHookComponent('RichTextEditorSettings');

    const { Toggle, Dialog } = useHookComponent('ReactiumUI');

    const cx = Reactium.Utils.cxFactory('rte-settings');

    const heading = title => ({ title });

    const pref = suffix => `admin.rte.settings.form.${suffix}`;

    const onSubmit = ({ value }) => {
        const { node, path } = Reactium.RTE.getNode(editor, props.id);

        Reactium.Hook.runSync('rte-settings-apply', value, {
            node,
            path,
            state,
        });
        Transforms.select(editor, path);
        Transforms.collapse(editor, { edge: 'end' });
        Transforms.setNodes(editor, { nodeProps: value }, { at: path });
    };

    const _onChange = ({ value }) => setValue(value);
    const onChange = _.debounce(_onChange, 500);

    const mergeValue = newValue => {
        let value = clone(state.nodeProps);
        value.style = !value.style ? {} : value.style;

        Object.entries(newValue).forEach(([key, val]) => {
            if (key === 'style') return;
            op.set(value, key, val);
        });

        if (op.get(newValue, 'style')) {
            Object.entries(newValue.style).forEach(([key, val]) =>
                op.set(value.style, key, val),
            );
        }

        Reactium.Hook.runSync('rte-settings-value', value, {
            state,
            props,
        });

        return value;
    };

    const setOptions = e => {
        const options = e.target.value;
        const nodeProps = clone(state.nodeProps) || {};
        nodeProps.options = options;
        setValue(nodeProps);
    };

    const setValue = newValue => {
        const next = mergeValue(newValue);
        const prev = state.previous;

        const equal = _.isEqual(clone(next), clone(prev));

        if (equal) return;

        state.nodeProps = next;

        onSubmit({ value: next });

        state.previous = clone(next);
    };

    // const updateStyle = ({ key, value }) => {
    //     const style = JSON.parse(
    //         JSON.stringify(op.get(state, 'nodeProps.style', {})),
    //     );
    //
    //     if (Array.isArray(key) && _.isObject(value)) {
    //         key.forEach(k => op.set(style, k, op.get(value, k)));
    //     } else {
    //         op.set(style, key, value);
    //     }
    //
    //     setValue({ style });
    // };

    const isElement = match => {
        const checkbox = ['checkbox'];
        const checkradio = ['checkbox', 'radio'];
        const hidden = ['hidden'];
        const number = ['number'];
        const radio = ['radio'];
        const select = ['select'];
        const button = ['button'];
        const textarea = ['textarea'];
        const text = [
            'text',
            'textarea',
            'number',
            'email',
            'password',
            'tel',
            'search',
            'url',
        ];

        const matches = {
            button,
            checkbox,
            checkradio,
            hidden,
            number,
            radio,
            select,
            text,
            textarea,
        };

        return op.get(matches, match, []).includes(state.type);
    };

    useFocusEffect(editor.panel.container);

    return op.get(state, 'inspector') === false ? null : (
        <Settings
            className={cx()}
            footer={{}}
            id='rte-form-settings'
            onChange={onChange}
            ref={elm => refs.set('settings', elm)}
            title={props.title}
            value={op.get(state, 'nodeProps', {})}>
            <Dialog
                className='sub'
                header={heading(__('ID'))}
                pref={pref('id')}>
                <div className={cx('row')}>
                    <div className='col-xs-12 form-group'>
                        <input
                            data-focus
                            type='text'
                            name='data.id'
                            title={__('field ID')}
                        />
                    </div>
                </div>
            </Dialog>
            <Dialog
                className='sub'
                header={heading(__('Name'))}
                pref={pref('name')}>
                <div className={cx('row')}>
                    <div className='col-xs-12 form-group'>
                        <input
                            type='text'
                            name='name'
                            title={__('field name')}
                        />
                    </div>
                </div>
            </Dialog>
            {isElement('button') && (
                <>
                    <Dialog
                        className='sub'
                        header={heading(__('Type'))}
                        pref={pref('type')}>
                        <div className={cx('row')}>
                            <div className='col-xs-12 form-group'>
                                <select
                                    name='data.type'
                                    defaultValue='button'
                                    title={__('button type')}>
                                    <option value='button'>
                                        {__('Button')}
                                    </option>
                                    <option value='submit'>
                                        {__('Submit')}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </Dialog>
                </>
            )}
            {!isElement('checkradio') && (
                <Dialog
                    className='sub'
                    header={heading(__('Label'))}
                    pref={pref('label')}>
                    <div className={cx('row')}>
                        <div className='col-xs-12 form-group'>
                            <input
                                type='text'
                                name='label'
                                title={__('field label')}
                            />
                        </div>
                    </div>
                </Dialog>
            )}
            <Dialog
                className='sub'
                header={heading(__('Value'))}
                pref={pref('value')}>
                <div className={cx('row')}>
                    <div className='col-xs-12 form-group'>
                        <input
                            type='text'
                            name='value'
                            title={__('field value')}
                        />
                    </div>
                </div>
            </Dialog>
            <Dialog
                className='sub'
                header={heading(__('CSS Class'))}
                pref={pref('classname')}>
                <div className={cx('row')}>
                    <div className='col-xs-12 form-group'>
                        <input
                            type='text'
                            name='className'
                            title={__('css class')}
                        />
                    </div>
                </div>
            </Dialog>
            <Dialog
                className='sub'
                header={heading(__('Attributes'))}
                pref={pref('attributes')}>
                <div className={cx('row')}>
                    {(isElement('text') || isElement('select')) && (
                        <>
                            <div className='col-xs-12 form-group'>
                                <Toggle
                                    value={true}
                                    name='disabled'
                                    label={__('Disabled:')}
                                    title={__('toggle disabled attribute')}
                                    defaultChecked={state.nodeProps.disabled}
                                />
                            </div>
                            <div className='col-xs-12 mt-xs-16 form-group'>
                                <Toggle
                                    value={true}
                                    name='readOnly'
                                    label={__('Read Only:')}
                                    title={__('toggle readonly attribute')}
                                    defaultChecked={state.nodeProps.readOnly}
                                />
                            </div>
                            <div className='col-xs-12 mt-xs-16 form-group'>
                                <Toggle
                                    value={true}
                                    name='required'
                                    label={__('Required:')}
                                    title={__('toggle required attribute')}
                                    defaultChecked={state.nodeProps.required}
                                />
                            </div>
                            {isElement('select') && (
                                <div className='col-xs-12 mt-xs-16 form-group'>
                                    <Toggle
                                        value={true}
                                        name='multiple'
                                        label={__('Multiple:')}
                                        title={__('toggle multiple attribute')}
                                        defaultChecked={
                                            state.nodeProps.multiple
                                        }
                                    />
                                </div>
                            )}
                        </>
                    )}
                    {isElement('text') && (
                        <>
                            <div className='col-xs-12 mt-xs-16 form-group'>
                                <Toggle
                                    value={true}
                                    name='autoFocus'
                                    label={__('Auto Focus:')}
                                    title={__('toggle autofocus attribute')}
                                    defaultChecked={state.nodeProps.autoFocus}
                                />
                            </div>
                            <div className='col-xs-12 mt-xs-16 form-group'>
                                <Toggle
                                    value={true}
                                    name='autoComplete'
                                    label={__('Auto Complete:')}
                                    title={__('toggle autocomplete attribute')}
                                    defaultChecked={
                                        state.nodeProps.autoComplete
                                    }
                                />
                            </div>
                            <div className='col-xs-12 mt-xs-12 form-group inline'>
                                <label>
                                    <span>{__('Max Length:')}</span>
                                    <input
                                        type='number'
                                        name='maxLength'
                                        title={__('maximum length')}
                                    />
                                </label>
                            </div>
                            <div className='col-xs-12 mt-xs-12 form-group inline'>
                                <label>
                                    <span>{__('Pattern:')}</span>
                                    <input
                                        type='text'
                                        name='pattern'
                                        title={__('pattern')}
                                    />
                                </label>
                            </div>
                            <div className='col-xs-12 mt-xs-12 form-group inline'>
                                <label>
                                    <span>{__('Aria Label:')}</span>
                                    <input
                                        type='text'
                                        name='aria-label'
                                        title={__('aria label')}
                                    />
                                </label>
                            </div>
                        </>
                    )}
                    {isElement('textarea') && (
                        <>
                            <div className='col-xs-12 mt-xs-12 form-group inline'>
                                <label>
                                    <span>{__('Rows:')}</span>
                                    <input
                                        name='rows'
                                        type='number'
                                        title={__('rows value')}
                                    />
                                </label>
                            </div>
                            <div className='col-xs-12 mt-xs-12 form-group inline'>
                                <label>
                                    <span>{__('Columns:')}</span>
                                    <input
                                        name='cols'
                                        type='number'
                                        title={__('cols value')}
                                    />
                                </label>
                            </div>
                        </>
                    )}
                    {isElement('number') && (
                        <>
                            <div className='col-xs-12 mt-xs-12 form-group inline'>
                                <label>
                                    <span>{__('Min:')}</span>
                                    <input
                                        name='min'
                                        type='number'
                                        title={__('minimum value')}
                                    />
                                </label>
                            </div>
                            <div className='col-xs-12 mt-xs-12 form-group inline'>
                                <label>
                                    <span>{__('Max:')}</span>
                                    <input
                                        name='max'
                                        type='number'
                                        title={__('maximum value')}
                                    />
                                </label>
                            </div>
                            <div className='col-xs-12 mt-xs-12 form-group inline'>
                                <label>
                                    <span>{__('Step:')}</span>
                                    <input
                                        name='step'
                                        type='number'
                                        title={__('step value')}
                                    />
                                </label>
                            </div>
                        </>
                    )}
                    {isElement('checkradio') && (
                        <>
                            <div className='col-xs-12 mt-xs-12 form-group'>
                                <Toggle
                                    value={true}
                                    name='checked'
                                    label={__('Checked:')}
                                    title={__('toggle checked attribute')}
                                    defaultChecked={state.nodeProps.checked}
                                />
                            </div>
                        </>
                    )}
                    {isElement('button') && (
                        <>
                            <div className='col-xs-12 form-group'>
                                <label>
                                    <span>{__('onClick:')}</span>
                                    <input
                                        type='text'
                                        name='data.hook'
                                        title={__(
                                            'Hook run when the button is clicked',
                                        )}
                                    />
                                </label>
                            </div>
                        </>
                    )}
                </div>
            </Dialog>
            {isElement('select') && (
                <Dialog
                    className='sub'
                    header={heading(__('Options'))}
                    pref={pref('options')}>
                    <Select
                        value={state.nodeProps.options}
                        onChange={setOptions}
                    />
                </Dialog>
            )}
        </Settings>
    );
};

export { Panel, Panel as default };
