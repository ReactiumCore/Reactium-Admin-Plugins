import _ from 'underscore';
import op from 'object-path';
import React, { useEffect, useMemo } from 'react';
import { fileExtensions } from './fileExtensions';

import Reactium, {
    __,
    useHandle,
    useHookComponent,
    useRefs,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

export const FieldType = (props) => {
    const { id } = props;

    const refs = useRefs();

    const Editor = useHandle('CTE');

    const val = id
        ? op.get(Editor.getValue(), ['contentType', 'fields', id], {})
        : {};

    const state = useSyncState({ ...val, groups: {} });

    const FieldTypeDialog = useHookComponent('FieldTypeDialog');

    const { Checkbox, Toggle } = useHookComponent('ReactiumUI');

    const extensions = useMemo(() => {
        let ext = Array.from(fileExtensions);
        Reactium.Hook.runSync('cte-file-extensions', { ext });
        return _.groupBy(ext, 'type');
    }, [fileExtensions]);

    const toggle = (e) => {
        // const group = e.target.getAttribute('data-group');
        // const checked = state.get(`groups.${group}`);
        // const elms = document.querySelectorAll(`input[data-group="${group}"]`);
        // elms.forEach(elm => elm.checkVisibility());
        // console.log(elms);
    };

    const onChange = (e) => state.set(e.target.name, e.target.checked);

    const onBeforeSave = (params) => {
        const { fieldId } = params;
        if (fieldId !== id) return;
        op.set(params, 'fieldValue.options', state.get('options'));
    };

    const onLoad = () => {
        const hooks = [
            Reactium.Hook.registerSync('content-type-form-save', onBeforeSave),
        ];

        return () => {
            hooks.forEach((hookId) => Reactium.Hook.unregister(hookId));
        };
    };

    useEffect(onLoad, [Object.values(refs.get())]);

    return (
        <FieldTypeDialog {...props}>
            <div className='field-type-file'>
                <div className='row'>
                    <div className='col-xs-12'>
                        <div className='form-group'>
                            <input
                                type='text'
                                name='placeholder'
                                placeholder={__('Placeholder')}
                                defaultValue={__('Drag & Drop File')}
                            />
                        </div>
                    </div>
                </div>
                <div className='mt-xs-20'>
                    <Toggle
                        value={true}
                        name='required'
                        onChange={onChange}
                        defaultChecked={state.get('required') || false}
                        label={
                            <>
                                <strong>{__('Required:')}</strong>{' '}
                                <em>
                                    {String(state.get('required') || false)}
                                </em>
                            </>
                        }
                    />
                </div>
                <div className='my-xs-20'>
                    <Toggle
                        value={true}
                        name='allExtensions'
                        onChange={onChange}
                        defaultChecked={state.get('allExtensions')}
                        label={
                            <>
                                <strong>{__('All File Extensions')}:</strong>{' '}
                                <em>
                                    {String(
                                        state.get('allExtensions') || false,
                                    )}
                                </em>
                            </>
                        }
                    />
                </div>
                <div
                    className='flex-sm flex-sm-stretch wrap'
                    style={{ flexWrap: 'wrap' }}
                >
                    {state.get('allExtensions') !== true &&
                        Object.entries(extensions).map(([k, v]) => (
                            <div
                                key={k}
                                className='flex-grow mb-xs-20'
                                style={{ minWidth: 200 }}
                            >
                                <h4
                                    className='mb-xs-12 strong'
                                    data-group={k}
                                    onClick={toggle}
                                >
                                    {k}
                                </h4>
                                {_.pluck(v, 'value').map((ext, i) => (
                                    <div
                                        className='mb-xs-8 pr-xs-20'
                                        key={`ext-${i}`}
                                    >
                                        <Checkbox
                                            name='ext'
                                            value={ext}
                                            data-group={k}
                                            labelAlign='right'
                                            label={
                                                <div className='text-left'>
                                                    {ext}
                                                </div>
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                </div>
            </div>
        </FieldTypeDialog>
    );
};
