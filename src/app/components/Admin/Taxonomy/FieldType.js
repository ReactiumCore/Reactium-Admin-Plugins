import _ from 'underscore';
import op from 'object-path';
import React, { useRef, useState } from 'react';

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
        status: STATUS.PENDING,
    }).current;

    const [inputs, setNewInputs] = useState(['Checkbox', 'TagsInput']);
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
        return Object.values(results);
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

    //console.log(props);

    return (
        <FieldTypeDialog {...props}>
            <div
                className='field-type-taxonomy'
                ref={elm => op.set(refs, 'container', elm)}>
                <div className='form-group'>
                    <select name='taxonomy'>
                        <option value=''>Taxonomy</option>
                        {taxonomy.map(({ slug, name }) => (
                            <option value={slug} key={`option-${slug}`}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='flex-middle' style={{ width: '100%' }}>
                    {inputs.map((item, i) => (
                        <div className='check-field' key={`input-type-${i}`}>
                            <Radio
                                label={item}
                                labelAlign='right'
                                name='inputType'
                                value={item}
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
