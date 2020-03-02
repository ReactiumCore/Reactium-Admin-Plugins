import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Reactium from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import React, { useState, useEffect, forwardRef } from 'react';

let Widget = ({ children, className, icon, namespace, ...props }, ref) => {
    const [expanded, setExpanded] = useState(false);

    const cx = Reactium.Utils.cxFactory(namespace);

    const cname = cn(cx(), { [className]: !!className });

    const toggle = () => Reactium.Utils.Fullscreen.toggle();

    const update = () => setExpanded(Reactium.Utils.Fullscreen.isExpanded());

    useEffect(() => {
        document.addEventListener('fullscreenchange', update);
        return () => {
            document.removeEventListener('fullscreenchange', update);
        };
    });

    const render = () => (
        <Button
            ref={ref}
            className={cname}
            {...props}
            onClick={e => {
                e.currentTarget.blur();
                toggle();
            }}
            type='button'>
            {children && <>{children}</>}
            {!children && (
                <Icon name={expanded ? icon.collapse : icon.expand} />
            )}
        </Button>
    );

    return render();
};

Widget = forwardRef(Widget);

Widget.defaultProps = {
    color: Button.ENUMS.COLOR.CLEAR,
    icon: {
        expand: 'Feather.Maximize2',
        collapse: 'Feather.Minimize2',
        size: 18,
    },
    namespace: 'ar-fullscreen-button',
};

export default Widget;
