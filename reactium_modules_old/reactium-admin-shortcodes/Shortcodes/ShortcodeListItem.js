import React from 'react';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

import SDK from './sdk';

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ShortcodeListItem
 * -----------------------------------------------------------------------------
 */
export default ({
    code,
    data,
    replacer,
    type,
    onDelete = noop,
    onItemSelect = noop,
}) => {
    const key = SDK.parseKey(code);
    const { Button, Dropdown, Icon } = useHookComponent('ReactiumUI');

    return (
        <>
            <input type='hidden' name={`${key}.key`} value={key} />
            <input defaultValue={type.id} type='hidden' name={`${key}.type`} />
            <div className='input-group'>
                <input
                    className='code'
                    defaultValue={code}
                    name={`${key}.code`}
                    placeholder='[shortcode]'
                    readOnly
                    type='text'
                />
                <Dropdown
                    data={data}
                    valueField='id'
                    selection={[type.id]}
                    onItemSelect={({ item }) => onItemSelect({ item, key })}>
                    <Button
                        block
                        className='type'
                        color={Button.ENUMS.COLOR.CLEAR}
                        data-dropdown-element>
                        <span className='label'>{type.label}</span>
                        <span className='icon'>
                            <Icon name='Feather.ChevronDown' className='icon' />
                        </span>
                    </Button>
                </Dropdown>
                <input
                    className='replacer'
                    defaultValue={replacer}
                    name={`${key}.replacer`}
                    placeholder='replacement'
                    type='text'
                />
                <Button
                    className='action'
                    color={Button.ENUMS.COLOR.DANGER}
                    onClick={onDelete}
                    data-code={code}
                    data-key={key}
                    data-replacer={replacer}
                    data-type={type.id}>
                    <Icon name='Feather.X' size={22} />
                </Button>
            </div>
        </>
    );
};
