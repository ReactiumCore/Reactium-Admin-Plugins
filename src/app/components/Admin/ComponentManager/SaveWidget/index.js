import op from 'object-path';
import React, { useEffect, useState } from 'react';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';
import { useStore } from '@atomic-reactor/use-select';

export default () => {
    const store = useStore();

    const path = () =>
        String(op.get(store.getState(), 'Router.match.path', '/'));

    const ComponentManager = useHandle('ComponentManager');

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [visible, setVisible] = useState(
        path().startsWith('/admin/components'),
    );

    const onClick = () => ComponentManager.save();

    const onHotkey = e => {
        if (e) e.preventDefault();
        onClick();
    };

    // Watch for route updates
    useEffect(
        () =>
            store.subscribe(() => {
                setVisible(path().startsWith('/admin/components'));
            }),
        [],
    );

    useEffect(() => {
        if (visible) {
            Reactium.Hotkeys.register('components-save', {
                callback: onHotkey,
                key: 'mod+s',
                order: Reactium.Enums.priority.lowest,
                scope: document,
            });
        }

        return () => {
            Reactium.Hotkeys.unregister('components-save');
        };
    }, [visible, Object.keys(ComponentManager)]);

    return !visible ? null : (
        <Button
            appearance={Button.ENUMS.APPEARANCE.PILL}
            className='mr-xs-24'
            color={Button.ENUMS.COLOR.PRIMARY}
            onClick={onClick}
            size={Button.ENUMS.SIZE.XS}
            type={Button.ENUMS.TYPE.BUTTON}>
            <Icon name='Feather.Check' size={18} />
            <span className='hide-xs show-md ml-xs-12'>
                {__('Save Components')}
            </span>
        </Button>
    );
};
