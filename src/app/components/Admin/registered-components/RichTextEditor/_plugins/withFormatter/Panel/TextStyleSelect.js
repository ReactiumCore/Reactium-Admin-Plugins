import _ from 'underscore';
import op from 'object-path';
import React, { useMemo } from 'react';
import { Dropdown, Icon } from '@atomic-reactor/reactium-ui';

export const TextStyleSelect = ({
    blocks,
    onSelect,
    style: initialStyle = {},
    textStyle,
}) => {
    if (!textStyle) return null;

    const style = { ...initialStyle };
    const Element = op.get(textStyle, 'element');
    const type = op.get(textStyle, 'id');
    const label = op.get(textStyle, 'label');
    const bgStyle = {
        backgroundColor: op.get(style, 'backgroundColor', 'transparent'),
    };

    op.del(style, 'backgroundColor');

    return (
        <div style={bgStyle}>
            <Dropdown
                data={blocks}
                labelField='label'
                maxHeight='40vh'
                minHeight={200}
                onItemSelect={e => onSelect(e)}
                selection={[op.get(textStyle, 'id')]}
                valueField='id'>
                <button
                    type='button'
                    data-dropdown-element
                    className='formatter-text-style'>
                    <div className='flex-grow' style={style}>
                        <Element>{label}</Element>
                    </div>
                    <div
                        className='px-xs-10 flex center middle'
                        style={{ ...style, width: 42 }}>
                        <Icon name='Feather.ChevronDown' size={18} />
                    </div>
                </button>
            </Dropdown>
        </div>
    );
};
