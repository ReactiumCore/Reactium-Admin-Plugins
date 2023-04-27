import React from 'react';
import Panel from './Panel';
import Element from './Element';
import RTEPlugin from '../../RTEPlugin';
import Reactium, { __ } from 'reactium-core/sdk';
import { Button, Icon } from 'reactium-ui';

const Plugin = new RTEPlugin({ type: 'form', order: 100 });

Plugin.callback = editor => {
    const onButtonClick = () => {
        const x = window.innerWidth / 2 - 150;
        const y = 80;

        editor.panel
            .setID(Plugin.type)
            .setContent(<Panel selection={editor.selection} />)
            .moveTo(x, y)
            .show();
    };

    Reactium.RTE.Block.register('form', {
        element: props => <div {...props} />,
    });

    Reactium.RTE.Format.register('formElement', {
        element: Element,
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 100,
        sidebar: true,
        button: props => {
            return (
                <Button
                    {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                    onClick={onButtonClick}
                    data-tooltip={__('Form Element')}
                    {...props}>
                    <Icon
                        {...Reactium.RTE.ENUMS.PROPS.ICON}
                        name='Linear.Select2'
                        size={22}
                    />
                </Button>
            );
        },
    });

    // Editor overrides
    const { isInline } = editor;
    editor.isInline = element =>
        element.type === Plugin.type ? false : isInline(element);

    return editor;
};

export default Plugin;
