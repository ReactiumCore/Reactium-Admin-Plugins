import React from 'react';
import op from 'object-path';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

export default ({ list: List }) => {
    const buttonProps = {
        color: Button.ENUMS.COLOR.CLEAR,
        style: { width: 40, height: 40, padding: 0 },
        type: Button.ENUMS.TYPE.BUTTON,
    };

    const getOrder = () => {
        return op.get(List, 'state.order') === 'ascending'
            ? 'descending'
            : 'ascending';
    };

    const toggleOrder = () =>
        List.setState({
            order: getOrder(),
        });

    const ico =
        getOrder() === 'descending'
            ? 'Linear.SortAlphaDesc'
            : 'Linear.SortAlphaAsc';

    return (
        <Button {...buttonProps} onClick={toggleOrder}>
            <Icon name={ico} size={18} />
        </Button>
    );
};
