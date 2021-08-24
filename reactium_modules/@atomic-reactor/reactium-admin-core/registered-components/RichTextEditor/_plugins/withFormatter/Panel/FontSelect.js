import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import { Dropdown, Icon } from '@atomic-reactor/reactium-ui';

export const FontLabel = ({ label, ...item }) => {
    const style = {};
    return <span style={style}>{label}</span>;
};

export const FontSelect = ({
    font,
    fonts,
    onFontSelect,
    onWeightSelect,
    onSizeSelect,
    size,
    title,
    weight,
    ...props
}) => {
    const _font = font || fonts[0];
    const _sizes = _font.size.map(item => ({ label: item, value: item }));
    const _weights = _font.weight;

    // Account for missing size & weight within selected font
    let _size = size || _sizes[0];
    _size = _.findWhere(_sizes, { value: _size.value }) || _sizes[0];

    let _weight = weight || _weights[0];
    _weight = _.findWhere(_weights, { weight: _weight.weight }) || _weights[0];

    return (
        <>
            {title && <h3 className='heading'>{title}</h3>}
            <div className='formatter-font'>
                <div className='mb-xs-8'>
                    <Dropdown
                        data={fonts}
                        labelField='label'
                        maxHeight='40vh'
                        minHeight={200}
                        onItemSelect={onFontSelect}
                        selection={[op.get(_font, 'id')]}
                        valueField='id'>
                        <button
                            {...props}
                            className='dropdown-btn'
                            type='button'
                            data-dropdown-element>
                            <FontLabel {..._font} />
                            <Icon name='Feather.ChevronDown' size={16} />
                        </button>
                    </Dropdown>
                </div>
                <div className='row'>
                    <div className='col-xs-8 pr-xs-8'>
                        <Dropdown
                            data={_weights}
                            labelField='label'
                            minHeight={0}
                            onItemSelect={onWeightSelect}
                            selection={[op.get(_weight, 'weight')]}
                            valueField='weight'>
                            <button
                                className='dropdown-btn'
                                type='button'
                                data-dropdown-element>
                                <FontLabel {..._weight} />
                                <Icon name='Feather.ChevronDown' size={16} />
                            </button>
                        </Dropdown>
                    </div>
                    <div className='col-xs-4'>
                        <Dropdown
                            className='center'
                            data={_sizes}
                            minHeight={0}
                            onItemSelect={onSizeSelect}
                            selection={[op.get(_size, 'label')]}>
                            <button
                                className='dropdown-btn center'
                                type='button'
                                data-dropdown-element>
                                <FontLabel {..._size} />
                                <Icon name='Feather.ChevronDown' size={16} />
                            </button>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </>
    );
};
