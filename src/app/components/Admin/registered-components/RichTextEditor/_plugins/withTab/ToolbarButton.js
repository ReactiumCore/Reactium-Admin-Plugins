import Panel from './Panel';
import { useEditor } from 'slate-react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

export default props => {
    const editor = useEditor();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const onClick = e => {
        const srect = editor.sidebar.container.current.getBoundingClientRect();
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        let { x, width } = rect;

        x += width;

        const y = srect.y;

        editor.panel
            .setID(Plugin.type)
            .setContent(<Panel />)
            .moveTo(x, y)
            .show();
    };

    return (
        <Button
            {...Reactium.RTE.ENUMS.PROPS.BUTTON}
            onClick={onClick}
            data-tooltip={__('Tabs')}
            data-vertical-align='middle'
            data-align='right'
            {...props}>
            <Icon
                {...Reactium.RTE.ENUMS.PROPS.ICON}
                name='Linear.NewTab'
                size={18}
            />
        </Button>
    );
};
