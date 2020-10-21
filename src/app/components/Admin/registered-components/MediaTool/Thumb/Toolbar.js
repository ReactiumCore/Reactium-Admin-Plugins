import React from 'react';

import Reactium, {
    useAsyncEffect,
    useHookComponent,
    Zone,
} from 'reactium-core/sdk';

import { SCENES } from '../Scenes';

const ExternalButton = ({ nav }) => {
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return (
        <Button
            color={Button.ENUMS.COLOR.CLEAR}
            onClick={() => nav(SCENES.external, 'right')}>
            <Icon name='Feather.Link' size={16} />
        </Button>
    );
};

const MediaButton = ({ nav }) => {
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return (
        <Button
            color={Button.ENUMS.COLOR.CLEAR}
            onClick={() => nav(SCENES.library, 'right')}>
            <Icon name='Feather.Image' size={18} />
        </Button>
    );
};

const UploadButton = ({ nav }) => {
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return (
        <Button
            color={Button.ENUMS.COLOR.CLEAR}
            onClick={() => nav(SCENES.upload, 'right')}>
            <Icon name='Feather.UploadCloud' size={20} />
        </Button>
    );
};

const Toolbar = props => {
    const { children, id = 'media-field-selection-toolbar', nav } = props;

    useAsyncEffect(async () => {
        const ids = ['external-button', 'media-button', 'upload-button'];

        ids.forEach(id => Reactium.Zone.removeComponent(id));

        const components = await Promise.all([
            Reactium.Zone.addComponent({
                id: 'external-button',
                component: ExternalButton,
                nav,
                order: Reactium.Enums.priority.neutral,
                zone: id,
            }),
            Reactium.Zone.addComponent({
                id: 'media-button',
                component: MediaButton,
                nav,
                order: Reactium.Enums.priority.neutral + 2,
                zone: id,
            }),
            Reactium.Zone.addComponent({
                id: 'upload-button',
                component: UploadButton,
                nav,
                order: Reactium.Enums.priority.neutral + 2,
                zone: id,
            }),
        ]);

        return () => {
            // clean up on unmount
            components.forEach(id => Reactium.Zone.removeComponent(id));
        };
    }, []);

    return (
        <div className='toolbar'>
            <Zone zone={id} />
            {children}
        </div>
    );
};

export { Toolbar, Toolbar as default };
