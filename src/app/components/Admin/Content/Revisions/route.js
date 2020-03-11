//
// Temporary Route to help build stuff
// Comment out all after!
//
import React, { useState, useEffect } from 'react';
import Reactium, { useHandle } from 'reactium-core/sdk';
import Revisions from './index';
import op from 'object-path';
import Blueprint from 'components/Blueprint';
import { Button } from '@atomic-reactor/reactium-ui';

const Loader = props => {
    const value = op.get(props, 'value');
    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const [visible, setVisible] = useState(false);

    const show = () => {
        Modal.show(
            <Revisions
                startingContent={value}
                onClose={() => Modal.hide()}
                editor={{
                    setClean: () => {},
                    setValue: () => {},
                    type: 'article',
                    value,
                }}
            />,
        );
    };

    useEffect(() => {
        setTimeout(show, 1);
    }, []);

    return (
        <div
            style={{
                height: '500px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <Button onClick={show}>Show</Button>
        </div>
    );
};

Reactium.Hook.register('blueprint-load', async (params, context) => {
    if (op.get(params, 'route.path') === '/revisions') {
        op.set(params, 'blueprint.sections.main.zones', [
            'admin-header',
            'revisions-test',
            'admin-actions',
        ]);
    }
});

Reactium.Plugin.register('whatever').then(async () => {
    const value = await Reactium.Content.retrieve({
        type: 'article',
        slug: 'test-article-2',
    });

    Reactium.Zone.addComponent({
        zone: ['revisions-test'],
        component: Loader,
        value,
    });
});

export default {
    path: '/revisions',
    component: Blueprint,
};
