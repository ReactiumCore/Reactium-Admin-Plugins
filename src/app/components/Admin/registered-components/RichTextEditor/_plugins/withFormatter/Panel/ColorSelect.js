import _ from 'underscore';
import op from 'object-path';
import React, { useMemo } from 'react';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';

export const ColorSelect = ({
    color = '#000000',
    colors,
    inherit = false,
    opacity = 100,
    onColorChange,
    onColorSelect,
    onOpacityChange,
    title,
    transparent = false,
}) => {
    const colorNone = {
        value: 'inherit',
        label: (
            <>
                <div className='color-block' data-color='inherit' />
                None
            </>
        ),
    };

    const bgNone = {
        value: 'transparent',
        label: (
            <>
                <div className='color-block' data-color='transparent' />
                None
            </>
        ),
    };

    let _colors = colors.map(({ label, value }) => {
        return {
            value,
            label: (
                <>
                    <div
                        className='color-block'
                        data-color={value}
                        style={{ backgroundColor: value, color: value }}
                    />
                    {label}
                </>
            ),
        };
    });

    _colors = inherit === true ? _.flatten([colorNone, _colors]) : _colors;
    _colors = transparent === true ? _.flatten([bgNone, _colors]) : _colors;

    return useMemo(
        () => (
            <>
                <h3 className='heading'>{title}</h3>
                <div className='formatter-font'>
                    <div className='row'>
                        <div className='col-xs-8 pr-xs-8'>
                            <Dropdown
                                data={_colors}
                                minHeight={0}
                                onItemSelect={onColorSelect}
                                selection={[color]}>
                                <div className='dropdown-btn'>
                                    <div
                                        className='color-block'
                                        data-color={color}
                                        style={{
                                            backgroundColor: color,
                                            opacity: opacity / 100,
                                        }}
                                    />
                                    <input
                                        name='color'
                                        value={color}
                                        onChange={onColorChange}
                                    />
                                    <Button
                                        color='clear'
                                        data-dropdown-element
                                        size='xs'
                                        style={{
                                            padding: 0,
                                            width: 35,
                                            height: 40,
                                            marginRight: -10,
                                            flexShrink: 0,
                                        }}
                                        type='button'>
                                        <Icon
                                            name='Feather.ChevronDown'
                                            size={16}
                                        />
                                    </Button>
                                </div>
                            </Dropdown>
                        </div>
                        <div className='col-xs-4'>
                            <div className='dropdown-btn center'>
                                <input
                                    name='opacity'
                                    onChange={onOpacityChange}
                                    type='number'
                                    value={opacity}
                                    max={100}
                                    min={0}
                                />
                                <span className='icon'>%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        ),
        [color, colors, opacity],
    );
};
