import _ from 'underscore';
import op from 'object-path';
import React, { useEffect, useRef, useState } from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useHookComponent,
} from 'reactium-core/sdk';

const STATUS = {
    FETCHING: 'FETCHING',
    PENDING: 'PENDING',
    READY: 'READY',
};

export default props => {
    const { DragHandle } = props;

    const refs = useRef({
        container: undefined,
        inputs: {},
        select: undefined,
        status: STATUS.PENDING,
    }).current;

    const [inputs, setNewInputs] = useState([
        { value: 'AdminChecklist', label: __('Checklist') },
        { value: 'AdminTagbox', label: __('Tag Input') },
    ]);
    const [taxonomy, setNewTaxonomy] = useState([]);

    const { Checkbox, Radio } = useHookComponent('ReactiumUI');
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    const setInputs = newInputs => {
        if (unMounted()) return;
        setNewInputs(newInputs);
    };

    const setStatus = newStatus => {
        if (unMounted()) return;
        op.set(refs, 'status', newStatus);
    };

    const setTaxonomy = newTaxonomy => {
        if (unMounted()) return;
        setNewTaxonomy(newTaxonomy);
    };

    const unMounted = () => !refs.container;

    const fetch = async () => {
        setStatus(STATUS.FETCHING);
        const { results = {} } = await Reactium.Taxonomy.Type.list();
        setStatus(STATUS.READY);
        return Object.values(results).map(item =>
            op.has(item, 'id') ? item.toJSON() : item,
        );
    };

    const getInputs = async () => {
        let newInputs = Array.from(inputs);
        await Reactium.Hook.run('taxonomy-input-types', newInputs);
        return newInputs;
    };

    useAsyncEffect(async () => {
        if (refs.status !== STATUS.PENDING) return;
        const [taxonomy, inputs] = await Promise.all([fetch(), getInputs()]);
        setTaxonomy(taxonomy);
        setInputs(inputs);
    });

    return (
        <FieldTypeDialog {...props}>
            <div
                className='field-type-taxonomy'
                ref={elm => op.set(refs, 'container', elm)}>
                {refs.status === STATUS.READY && (
                    <div className='form-group'>
                        <select
                            name='taxonomy'
                            defaultValue=''
                            ref={elm => op.set(refs, 'select', elm)}>
                            <option value=''>Taxonomy</option>
                            {taxonomy.map(({ slug, name }) => (
                                <option value={slug} key={`option-${slug}`}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className='form-group'>
                    <input
                        type='text'
                        name='placeholder'
                        placeholder={__('Placeholder')}
                    />
                </div>
                <div
                    className='flex-middle'
                    style={{ width: '100%', flexWrap: 'wrap' }}>
                    {refs.status === STATUS.READY &&
                        inputs.map(({ label, value }, i) => (
                            <div
                                className='check-field'
                                key={`input-type-${i}`}>
                                <Radio
                                    label={label}
                                    labelAlign='right'
                                    name='inputType'
                                    value={value}
                                />
                            </div>
                        ))}
                    <div className='check-field'>
                        <Checkbox
                            label={__('Required')}
                            labelAlign='right'
                            name='required'
                            value={true}
                        />
                    </div>
                </div>
            </div>
        </FieldTypeDialog>
    );
};
