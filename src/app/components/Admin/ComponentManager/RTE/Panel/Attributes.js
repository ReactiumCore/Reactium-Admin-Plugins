import cc from 'camelcase';
import _ from 'underscore';
import op from 'object-path';
import AttributeInput from './AttributeInput';
import { Scrollbars } from 'react-custom-scrollbars';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';

import {
    __,
    ComponentEvent,
    useDerivedState,
    useEventHandle,
    useHookComponent,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Attributes
 * -----------------------------------------------------------------------------
 */
let Attributes = (props, ref) => {
    const {
        attributes: defaultAttributes = [],
        block: defaultBlock = {},
        cx,
        refs,
        unMounted,
        value: defaultValue = {},
    } = props;

    const { Button } = useHookComponent('ReactiumUI');

    const [state, update] = useDerivedState({
        attributes: defaultAttributes,
        block: defaultBlock,
        value: defaultValue,
    });

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    const setAttributes = attributes => setState({ attributes });

    const setBlock = block => setState({ block });

    const setValue = (key, val) => {
        let value = JSON.parse(JSON.stringify(state.value));

        if (!_.isObject(key)) {
            op.set(value, key, val);
        } else {
            value = key;
        }

        setState({ value });
    };

    const _onChange = e => setValue(e.target.name, e.target.value);

    const _onSubmit = () => {
        const evt = new ComponentEvent('submit', {
            block: {
                ...state.block,
                attributes: state.attributes,
                attribute: state.value,
            },
        });
        handle.dispatchEvent(evt);
    };

    const _handle = () => ({
        refs,
        attributes: op.get(state, 'attributes'),
        setAttributes,
        setBlock,
        setValue,
        submit: _onSubmit,
        value: op.get(state, 'value'),
    });

    const [handle, setHandle] = useEventHandle(_handle());
    useImperativeHandle(ref, () => handle, [handle]);

    useEffect(() => {
        op.set(handle, 'attributes', props.attributes || []);
        setHandle(handle);
    }, [op.get(props, 'attributes')]);

    return (
        <div
            className={cx('form')}
            ref={elm => refs.set('attribute-form', elm)}>
            <h4 className={cx('form-header')}>{__('Attributes')}</h4>
            <div className={cx('form-fields')}>
                <Scrollbars autoHeight autoHeightMin={324} autoHeightMax='80vh'>
                    <div className='fieldset'>
                        {state.attributes.map((field, key) => (
                            <div
                                className='form-group'
                                key={`attribute-${key}`}>
                                <AttributeInput
                                    handle={handle}
                                    name={cc(field)}
                                    placeholder={field}
                                    onChange={_onChange}
                                    defaultValue={op.get(state, [
                                        'value',
                                        cc(field),
                                    ])}
                                />
                            </div>
                        ))}
                    </div>
                </Scrollbars>
            </div>
            <div className={cx('form-footer')}>
                <Button block type='button' onClick={_onSubmit}>
                    {__('Insert Component')}
                </Button>
            </div>
        </div>
    );
};

Attributes = forwardRef(Attributes);

export default Attributes;
