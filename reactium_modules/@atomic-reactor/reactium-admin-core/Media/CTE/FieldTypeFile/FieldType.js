import _ from 'underscore';
import op from 'object-path';
import React, { useMemo } from 'react';
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

    const refs = useRefs({ ext: [], groups: {} });

    const Editor = useHandle('CTE');

    const val = id
        ? op.get(Editor.getValue(), ['contentType', 'fields', id], {})
        : {};

    const state = useSyncState({ ...val, groups: {}, unchecking: {} });

    const FieldTypeDialog = useHookComponent('FieldTypeDialog');

    const { Checkbox, Toggle } = useHookComponent('ReactiumUI');

    const labelStyle = useMemo(
        () => ({
            textAlign: 'left',
        }),
        [],
    );

    const extensions = useMemo(() => {
        let ext = Array.from(fileExtensions);
        Reactium.Hook.runSync('cte-file-extensions', { ext });
        return _.groupBy(ext, 'type');
    }, [fileExtensions]);

    const toggle = (type) => (e) => {
        if (state.get(['unchecking', type])) return;

        _.where(refs.get('ext'), { type }).forEach(({ elm }) =>
            e.target.checked === true ? elm.check() : elm.uncheck(),
        );
    };

    const uncheckGroup = (group) => (e) => {
        if (e.target.checked) return;

        if (state.get(['unchecking', group])) return;

        const elm = refs.get(`group.${group}`);
        if (elm.checked !== true) return;

        state.set(
            ['unchecking', group],
            setTimeout(() => state.set(['unchecking', group], null), 500),
            false,
        );

        elm.uncheck();
    };

    const onChange = (e) => state.set(e.target.name, e.target.checked);

    const render = () => {
        refs.set('ext', []);
        return (
            <FieldTypeDialog {...props}>
                <div className='field-type-file'>
                    <div className='row'>
                        <div className='col-xs-12 col-md-6 pr-md-8'>
                            <div className='form-group'>
                                <label>
                                    <span style={{ fontWeight: 600 }}>
                                        {__('Max Files')}:
                                    </span>

                                    <input
                                        min={1}
                                        type='number'
                                        name='maxFiles'
                                        placeholder={1}
                                        defaultValue={1}
                                        className='mb-xs-0'
                                    />
                                </label>
                            </div>
                        </div>
                        <div className='col-xs-12 col-md-6 pl-xs-0 pl-md-8'>
                            <div className='form-group'>
                                <label>
                                    <span style={{ fontWeight: 600 }}>
                                        {__('Max File Size')}:
                                    </span>
                                    <div className='form-group'>
                                        <input
                                            min={1}
                                            type='number'
                                            name='maxFileSize'
                                            placeholder='512'
                                            defaultValue={512}
                                            className='mb-xs-0 pr-xs-40'
                                        />
                                        <span className='input-note'>mb</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className='col-xs-12 col-md-6 pl-xs-0 pr-md-8 mt-xs-16'>
                            <div className='form-group'>
                                <label>
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            height: 24,
                                        }}
                                    >
                                        {__('Dropzone Label')}:
                                    </span>
                                    <textarea
                                        rows={2}
                                        name='placeholder'
                                        placeholder={__('Drag & Drop File')}
                                        defaultValue={__('Drag & Drop File')}
                                    />
                                </label>
                            </div>
                        </div>
                        <div className='col-xs-12 col-md-6 pl-xs-0 pl-md-8 mt-xs-16'>
                            <div className='form-group'>
                                <label>
                                    <span style={{ fontWeight: 600 }}>
                                        {__('Browse Button Label')}:
                                    </span>
                                    <textarea
                                        rows={2}
                                        name='buttonLabel'
                                        placeholder={__('Select File')}
                                        defaultValue={__('Select File')}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className='col-xs-12 mt-xs-16'>
                            <div className='form-group'>
                                <label>
                                    <span style={{ fontWeight: 600 }}>
                                        {__('Help Text')}:
                                    </span>
                                    <textarea
                                        rows={4}
                                        name='helpText'
                                        placeholder={__(
                                            'markdown or plain text only',
                                        )}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className='row'>
                        <div className='col-xs-12 col-md-6 pr-xs-0 pr-md-12 mt-xs-20'>
                            <Toggle
                                value={true}
                                name='required'
                                onChange={onChange}
                                defaultChecked={state.get('required') || false}
                                label={
                                    <>
                                        <strong>{__('Required')}:</strong>{' '}
                                        <em>
                                            {String(
                                                state.get('required') || false,
                                            )}
                                        </em>
                                    </>
                                }
                            />
                        </div>

                        <div className='col-xs-12 col-md-6 pl-xs-0 pl-md-12 mt-xs-20'>
                            <Toggle
                                value={true}
                                name='autoUpload'
                                onChange={onChange}
                                defaultChecked={
                                    state.get('autoUpload') || false
                                }
                                label={
                                    <>
                                        <strong>
                                            {__('Automatic Upload')}:
                                        </strong>{' '}
                                        <em>
                                            {String(
                                                state.get('autoUpload') ||
                                                    false,
                                            )}
                                        </em>
                                    </>
                                }
                            />
                        </div>
                    </div>

                    <div className='row'>
                        <div className='col-xs-12 col-md-6 pr-xs-0 pr-md-12 mt-xs-20'>
                            <Toggle
                                value={true}
                                name='serialize'
                                onChange={onChange}
                                defaultChecked={state.get('serialze') || true}
                                label={
                                    <>
                                        <strong>
                                            {__('Serialize File Names')}:
                                        </strong>{' '}
                                        <em>
                                            {String(
                                                state.get('serialize') || false,
                                            )}
                                        </em>
                                    </>
                                }
                            />
                        </div>

                        <div className='col-xs-12 col-md-6 pl-xs-0 pl-md-12 mt-xs-20'>
                            <Toggle
                                value={true}
                                onChange={onChange}
                                name='allExtensions'
                                defaultChecked={state.get('allExtensions')}
                                label={
                                    <>
                                        <strong>
                                            {__('All File Extensions')}:
                                        </strong>{' '}
                                        <em>
                                            {String(
                                                state.get('allExtensions') ||
                                                    false,
                                            )}
                                        </em>
                                    </>
                                }
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            flexWrap: 'wrap',
                            display: state.get('allExtensions') ? 'none' : null,
                        }}
                        className='flex-sm flex-sm-stretch wrap mt-xs-40'
                    >
                        {Object.entries(extensions).map(([k, v]) => (
                            <div
                                key={k}
                                className='flex-grow'
                                style={{ minWidth: 200 }}
                            >
                                <div className='mb-xs-20 strong'>
                                    <Checkbox
                                        label={k}
                                        labelAlign='right'
                                        labelStyle={labelStyle}
                                        onChange={toggle(k)}
                                        ref={(elm) =>
                                            refs.set(`group.${k}`, elm)
                                        }
                                    />
                                </div>
                                {_.pluck(v, 'value').map((ext, i) => (
                                    <div
                                        className='mb-xs-8 pr-xs-20'
                                        key={`ext-${i}`}
                                    >
                                        <Checkbox
                                            name='ext'
                                            value={ext}
                                            label={ext}
                                            labelAlign='right'
                                            labelStyle={labelStyle}
                                            onChange={uncheckGroup(k)}
                                            ref={(elm) => {
                                                if (elm) {
                                                    refs.get('ext').push({
                                                        elm,
                                                        type: k,
                                                    });
                                                }
                                            }}
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

    return render();
};
