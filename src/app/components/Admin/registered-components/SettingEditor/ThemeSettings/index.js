import React from 'react';
import op from 'object-path';
import Reactium, { __ } from 'reactium-core/sdk';

const ThemeSettings = props => {
    const { groupName, value } = props;
    const prefix = (suffix, sep = '.') => `${groupName}${sep}${suffix}`;

    return Reactium.Theme.list.length < 1 ? null : (
        <>
            <div className='ar-dialog-header mx--20'>
                <h2>{__('Theme Settings')}</h2>
            </div>
            <div className='form-group'>
                <label>
                    <span aria-label={__('Theme')}>{__('Theme')}</span>
                    <select
                        name={prefix('theme')}
                        defaultValue={op.get(value, prefix('theme'))}>
                        <option value={null}>Select Theme</option>
                        {Reactium.Theme.list.map(({ id, label }) => (
                            <option key={id} value={id}>
                                {label || id}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </>
    );
};

export { ThemeSettings, ThemeSettings as default };
