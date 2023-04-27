import React, { useRef } from 'react';
import Reactium, { Zone } from 'reactium-core/sdk';
import { Button, Collapsible, Icon } from 'reactium-ui';

const ListWidgets = ({ user, list }) => {
    const ref = useRef();

    const toggle = () => ref.current.toggle();

    const buttonProps = {
        height: 40,
        padding: 0,
    };

    return (
        <div>
            <Button
                block
                color={Button.ENUMS.COLOR.CLEAR}
                onClick={toggle}
                style={buttonProps}>
                <Icon name='Feather.MoreVertical' size={16} />
            </Button>
            <Collapsible ref={ref} expanded={false}>
                <Zone
                    zone={list.cx('item-actions')}
                    user={user}
                    list={list}
                    collapsible={ref}
                />
            </Collapsible>
        </div>
    );
};

export { ListWidgets, ListWidgets as deafult };
