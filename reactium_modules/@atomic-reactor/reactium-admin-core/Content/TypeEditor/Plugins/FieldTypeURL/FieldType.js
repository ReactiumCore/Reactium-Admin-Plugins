import op from 'object-path';
import React, { useState } from 'react';
import Reactium, {
    __,
    useAsyncEffect,
    useHookComponent,
    useStatus,
} from '@atomic-reactor/reactium-core/sdk';

export default (props) => {
    const { DragHandle } = props;
    const { Checkbox } = useHookComponent('ReactiumUI');
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    const [taxonomy, setTaxonomy] = useState([]);
    const [, setStatus, isStatus] = useStatus('init');

    const isTaxonomy = op.has(Reactium, 'Taxonomy.Type.list');

    const load = async (mounted) => {
        if (!isStatus('init')) return;

        if (!isTaxonomy) {
            setStatus('ready');
            return;
        }

        setStatus('loading');

        const { results } = await Reactium.Taxonomy.Type.list();
        if (!mounted()) return;
        const tax = Object.values(results);
        setStatus('ready');
        setTaxonomy(tax);
    };

    useAsyncEffect(load, []);

    return (
        <FieldTypeDialog {...props}>
            <div className='field-type-url'>
                {isStatus('ready') && (
                    <>
                        {isTaxonomy && (
                            <div className='form-group'>
                                <select name='prefix'>
                                    <option value='null'>
                                        {__('Taxonomy Prefix')}
                                    </option>
                                    {taxonomy.map(({ slug, name }) => (
                                        <option
                                            key={`tax-${slug}`}
                                            value={slug}
                                        >
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className='form-group'>
                            <input
                                type='text'
                                name='app'
                                placeholder={__(
                                    'Target Application. default: site',
                                )}
                            />
                        </div>
                        <div className='flex middle'>
                            <div className='flex-grow'>
                                <div className='form-group'>
                                    <label className='placeholder'>
                                        <span className='sr-only'>
                                            {__('Placeholder')}
                                        </span>
                                        <input
                                            type='text'
                                            name='placeholder'
                                            placeholder={__('Placeholder')}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className='required'>
                                <Checkbox
                                    name='required'
                                    label={__('Required')}
                                    labelAlign='right'
                                    value={true}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </FieldTypeDialog>
    );
};
