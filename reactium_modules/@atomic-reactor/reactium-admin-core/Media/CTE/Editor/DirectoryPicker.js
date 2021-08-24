import _ from 'underscore';
import op from 'object-path';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';

import {
    __,
    useEventHandle,
    useHookComponent,
    useRefs,
} from 'reactium-core/sdk';

const noop = () => {};

export default forwardRef(
    (
        { defaultValue, directories = [], disabled = false, onChange = noop },
        ref,
    ) => {
        const refs = useRefs();
        const { Button, Carousel, Icon, Slide } = useHookComponent(
            'ReactiumUI',
        );

        const [updated, forceUpdate] = useState();

        const update = () => forceUpdate(Date.now());

        const getValue = () => {
            const directoryInput = refs.get('input');
            const directorySelect = refs.get('select');
            if (!directoryInput || !directorySelect) return;
            return directoryInput.value || directorySelect.value;
        };

        const _handle = () => ({
            carousel: refs.get('carousel'),
            value: getValue(),
            input: refs.get('input'),
            select: refs.get('select'),
        });

        const [handle, setHandle] = useEventHandle(_handle());

        useEffect(() => {
            if (!updated) return;

            const newHandle = _handle();
            Object.entries(newHandle).forEach(([key, value]) =>
                op.set(handle, key, value),
            );
            setHandle(handle);

            _.defer(() => onChange(handle));
        }, [updated]);

        useImperativeHandle(ref, () => handle);

        return (
            <Carousel ref={elm => refs.set('carousel', elm)}>
                <Slide>
                    <div className='input-group'>
                        <select
                            defaultValue={defaultValue}
                            ref={elm => refs.set('select', elm)}
                            onChange={() => update()}>
                            <option value={null}>
                                {__('Select directory')}
                            </option>
                            {directories.map(dir => (
                                <option key={`dir-${dir}`}>{dir}</option>
                            ))}
                        </select>
                        <Button
                            color={Button.ENUMS.COLOR.TERTIARY}
                            data-tooltip={__('New directory')}
                            data-align='left'
                            data-vertical-align='middle'
                            disabled={disabled}
                            onClick={() => {
                                const carousel = refs.get('carousel');
                                carousel.next();
                            }}>
                            <Icon name='Feather.Plus' />
                        </Button>
                    </div>
                </Slide>
                <Slide>
                    <div className='input-group'>
                        <input
                            type='text'
                            ref={elm => refs.set('input', elm)}
                            placeholder={__('directory')}
                            readOnly={disabled}
                            onChange={() => update()}
                        />
                        <Button
                            color={Button.ENUMS.COLOR.DANGER}
                            disabled={disabled}
                            onClick={() => {
                                const carousel = refs.get('carousel');
                                carousel.prev();
                                setTimeout(() => {
                                    refs.get('input').value = '';
                                    update();
                                }, 500);
                            }}>
                            <Icon name='Feather.X' />
                        </Button>
                    </div>
                </Slide>
            </Carousel>
        );
    },
);
