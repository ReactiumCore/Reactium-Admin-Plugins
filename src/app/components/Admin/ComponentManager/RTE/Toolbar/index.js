import React from 'react';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

const ToolbarButton = props => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <Button {...Reactium.RTE.ENUMS.PROPS.BUTTON} {...props}>
            <Icon
                {...Reactium.RTE.ENUMS.PROPS.ICON}
                name='Feather.Box'
                size={20}
            />
        </Button>
    );
};

export { ToolbarButton, ToolbarButton as default };
