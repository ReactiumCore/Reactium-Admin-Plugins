import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef, useState } from 'react';
import { __, useHookComponent, useIsContainer } from 'reactium-core/sdk';

const ListItem = props => {
    const refs = useRef({}).current;
    const {
        onChange,
        onDelete,
        onUnDelete,
        onKeyUp,
        placeholder,
        route,
    } = props;
    const [deleted, setDeleted] = useState(op.get(props, 'delete', false));
    const { Button, Carousel, Icon, Slide, Toast } = useHookComponent(
        'ReactiumUI',
    );

    const buttonStyle = {
        width: 41,
        height: 41,
        padding: 0,
    };

    const enable = () => {
        refs.carousel.jumpTo(1);
        refs.input.removeAttribute('readOnly');
        refs.input.focus();
    };

    const disable = ({ target }) => {
        if (isContainer(target, refs.container)) return;

        refs.carousel.jumpTo(deleted ? 2 : 0);
        refs.input.setAttribute('readOnly', true);
    };

    const unDelete = () => {
        enable();
        setDeleted(false);
        onUnDelete(props);
    };

    const remove = () => {
        refs.input.setAttribute('readOnly', true);
        refs.carousel.jumpTo(2);

        Toast.show({
            type: Toast.TYPE.INFO,
            message: __('%route marked for deletion').replace(
                /\%route/gi,
                route,
            ),
            icon: 'Feather.Check',
            autoClose: 3000,
        });

        setDeleted(true);
        onDelete(props);
    };

    const isContainer = useIsContainer();

    useEffect(() => {
        if (!refs.container) return;

        window.addEventListener('mousedown', disable);
        window.addEventListener('touchstart', disable);

        return () => {
            window.removeEventListener('mousedown', disable);
            window.removeEventListener('touchstart', disable);
        };
    }, [
        refs.container,
        op.get(refs, 'carousel.state.active'),
        Object.values(props),
    ]);

    return (
        <li
            className={cn('input-group', { deleted })}
            ref={elm => op.set(refs, 'container', elm)}>
            <input
                type='text'
                onKeyDown={onKeyUp}
                onChange={e => onChange(e.target.value, props)}
                placeholder={placeholder}
                ref={elm => op.set(refs, 'input', elm)}
                readOnly
                value={route}
            />
            <div
                className='edit-toggle'
                ref={elm => op.set(refs, 'carousel-container', elm)}>
                <Carousel
                    active={deleted ? 2 : 0}
                    ref={elm => op.set(refs, 'carousel', elm)}
                    animationSpeed={0.25}>
                    <Slide>
                        <Button
                            color={Button.ENUMS.COLOR.TERTIARY}
                            onClick={enable}
                            style={buttonStyle}>
                            <Icon name='Feather.Edit2' size={18} />
                        </Button>
                    </Slide>
                    <Slide>
                        <Button
                            color={Button.ENUMS.COLOR.DANGER}
                            onClick={remove}
                            style={buttonStyle}>
                            <Icon name='Feather.X' size={20} />
                        </Button>
                    </Slide>
                    <Slide>
                        <Button
                            color={Button.ENUMS.COLOR.DANGER}
                            onClick={unDelete}
                            style={buttonStyle}>
                            <Icon name='Feather.RotateCcw' size={20} />
                        </Button>
                    </Slide>
                </Carousel>
            </div>
        </li>
    );
};

export { ListItem, ListItem as default };
