import React, { useEffect } from 'react';
import op from 'object-path';
import { __ } from 'reactium-core/sdk';
import { Button, Dropdown, Icon } from 'reactium-ui';

export default ({
    id,
    navTo,
    onOptionChange,
    onSizeChange,
    options,
    refs,
    setRef,
    size,
}) => {
    return (
        <div id={id} className='admin-thumbnail-select'>
            <div className='form-group'>
                <label>
                    {__('Size:')}
                    <SizeSelect
                        onChange={e => onSizeChange(e)}
                        refs={refs}
                        setRef={setRef}
                        size={size}
                        sizes={options.sizes}
                    />
                </label>
            </div>
            {size === 'custom' && (
                <div className='form-group'>
                    <div className='flex middle'>
                        <div className='col-xs-5'>
                            <input
                                className='text-center'
                                data-key='width'
                                onChange={onOptionChange}
                                placeholder='width'
                                ref={elm => setRef(elm, 'input.width')}
                                style={{ width: '100%' }}
                                type='number'
                                value={op.get(options, 'width') || ''}
                            />
                        </div>
                        <div className='col-xs-2 text-center gray'>
                            <Icon name='Feather.X' />
                        </div>
                        <div className='col-xs-5'>
                            <input
                                className='text-center'
                                data-key='height'
                                onChange={onOptionChange}
                                placeholder='height'
                                ref={elm => setRef(elm, 'input.height')}
                                style={{ width: '100%' }}
                                type='number'
                                value={op.get(options, 'height') || ''}
                            />
                        </div>
                    </div>
                    <small className='text-center'>
                        {__('width and height must be in pixels')}
                    </small>
                </div>
            )}

            <div className='form-group'>
                <label>
                    {__('Property:')}
                    <input
                        data-key='property'
                        onChange={onOptionChange}
                        ref={elm => setRef(elm, 'input.property')}
                        type='text'
                        value={op.get(options, 'property') || ''}
                    />
                </label>
            </div>

            <div className='actions'>
                <Button
                    color='clear'
                    onClick={() => navTo('pick', 'right')}
                    style={{ width: 44, height: 40 }}>
                    <Icon name='Feather.X' size={20} />
                </Button>
            </div>
        </div>
    );
};

export const SizeLabel = ({ label, width, height }) => {
    return (
        <div className='flex middle flex-grow'>
            {label}
            {width && height && (
                <>
                    {': '}
                    {width}
                    <Icon name='Feather.X' size={12} className='mx-xs-4' />
                    {height}
                </>
            )}
        </div>
    );
};

export const SizeSelect = ({ onChange, refs, setRef, size, sizes }) => {
    if (!size || !sizes) return null;

    const data = Object.entries(sizes).map(([key, item]) => ({
        label: <SizeLabel {...item} />,
        value: key,
    }));

    useEffect(() => {
        if (refs.size) {
            if (refs.size.state.selection[0] !== size) {
                refs.size.setState({ selection: [size] });
            }
        }
    }, [size]);

    return (
        <div
            className='flex-grow text-left flex middle'
            style={{ position: 'relative' }}>
            <Dropdown
                data={data}
                onItemSelect={onChange}
                ref={elm => setRef(elm, 'size')}
                selection={[size]}>
                <Button
                    block
                    color='tertiary'
                    data-dropdown-element
                    size='sm'
                    style={{ padding: '8px 5px 8px 8px' }}>
                    <SizeLabel {...sizes[size]} />
                    <Icon name='Feather.ChevronDown' size={18} />
                </Button>
            </Dropdown>
        </div>
    );
};
