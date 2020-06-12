import React, { useState } from 'react';
import Reactium, {
    useAsyncEffect,
    useHookComponent,
    __,
} from 'reactium-core/sdk';
import op from 'object-path';

const Types = () => {
    const SettingEditor = useHookComponent('SettingEditor');
    const { Spinner } = useHookComponent('ReactiumUI');
    const [types, setTypes] = useState([]);

    useAsyncEffect(async isMounted => {
        const types = await Reactium.ContentType.types();
        if (isMounted()) setTypes(types);
    }, []);

    if (!types.length)
        return (
            <div className='syndicate-loading'>
                <Spinner />
            </div>
        );

    const inputs = types.reduce((inputs, type) => {
        const machineName = op.get(type, 'machineName');
        const label = op.get(
            type,
            'meta.label',
            op.get(type, 'type', machineName),
        );

        const input = {
            type: 'toggle',
            label,
            tooltip: __('Syndicate %type').replace('%type', label),
            required: false,
        };

        op.set(inputs, [`Syndicate.types.${machineName}`], input);
        return inputs;
    }, {});

    return (
        <SettingEditor
            settings={{
                title: __('Syndication Types'),
                group: 'Syndicate',
                inputs,
            }}
        />
    );
};

export default Types;
