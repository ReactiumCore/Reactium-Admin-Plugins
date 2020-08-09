import React from 'react';
import op from 'object-path';
import { __, useHookComponent, useRefs } from 'reactium-core/sdk';

const noop = () => {};

export default props => {
    let { color, icon, label, name, onClick = noop, readOnly = false } = props;

    const refs = useRefs();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const submit = e => {
        if (readOnly === true) return;
        onClick({ ...e, ...props, input: refs.get('input') });
    };

    const _onEnter = e => {
        if (readOnly) return;
        if (e.which !== 13) return;
        e.preventDefault();
        submit(e);
    };

    return (
        <div className='attribute'>
            {label && <h3>{label}</h3>}
            <div className='input-group'>
                <input
                    ref={elm => refs.set('input', elm)}
                    type='text'
                    placeholder={__('Attribute')}
                    name={name}
                    data-index={op.get(props, 'index', 0) || 0}
                    onKeyDown={_onEnter}
                    defaultValue={op.get(props, 'value')}
                    readOnly={readOnly}
                />
                {readOnly !== true && (
                    <Button
                        color={color}
                        onClick={submit}
                        readOnly={readOnly}
                        type='button'
                        style={{
                            width: 41,
                            height: 41,
                            padding: 0,
                        }}>
                        <Icon name={icon} />
                    </Button>
                )}
            </div>
        </div>
    );
};
