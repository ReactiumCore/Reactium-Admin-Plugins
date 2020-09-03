import cc from 'camelcase';
import _ from 'underscore';
import op from 'object-path';
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

    const { Button, EventForm } = useHookComponent('ReactiumUI');

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

    const setValue = value => {
        const form = refs.get('attribute-form');
        if (form) form.setValue(value);
        setState({ value });
    };

    const _onChange = e => {
        if (unMounted()) return;
        const newValue = e.currentTarget.getValue();
        if (_.isEqual(newValue, state.value)) return;

        handle.value = newValue;
        setValue(newValue);
        setHandle(handle);
    };

    const _onSubmit = e =>
        handle.dispatchEvent(
            new ComponentEvent('submit', {
                block: {
                    ...state.block,
                    attribute: e.currentTarget.getValue(),
                },
            }),
        );

    const _handle = () => ({
        attributes: op.get(state, 'attributes'),
        setAttributes,
        setBlock,
        setValue,
        value: op.get(state, 'value'),
    });

    const [handle, setHandle] = useEventHandle(_handle());
    useImperativeHandle(ref, () => handle, [handle]);

    useEffect(() => {
        op.set(handle, 'attributes', props.attributes || []);
        setHandle(handle);
    }, [op.get(props, 'attributes')]);

    return (
        <EventForm
            className={cx('form')}
            onChange={_onChange}
            onSubmit={_onSubmit}
            ref={elm => refs.set('attribute-form', elm)}
            value={state.value}>
            <h4 className={cx('form-header')}>{__('Attributes')}</h4>
            <div className={cx('form-fields')}>
                <Scrollbars>
                    <div className='fieldset'>
                        {state.attributes.map((field, key) => (
                            <div
                                className='form-group'
                                key={`attribute-${key}`}>
                                <input name={cc(field)} placeholder={field} />
                            </div>
                        ))}
                    </div>
                </Scrollbars>
            </div>
            <div className={cx('form-footer')}>
                <Button block type='submit'>
                    {__('Insert Block')}
                </Button>
            </div>
        </EventForm>
    );
};

Attributes = forwardRef(Attributes);

export default Attributes;
