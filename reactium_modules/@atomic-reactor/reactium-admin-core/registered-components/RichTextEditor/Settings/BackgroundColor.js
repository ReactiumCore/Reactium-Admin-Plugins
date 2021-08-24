import React from 'react';
import op from 'object-path';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

const noop = () => {};

const BackgroundColor = ({ onChange, styles }) => {
    const { ColorSelect } = useHookComponent('RichTextEditorSettings');

    const colors = () => {
        let clrs = JSON.parse(JSON.stringify(Reactium.RTE.colors));

        clrs.splice(0, 0, {
            className: 'transparent light',
            label: __('transparent'),
            value: 'transparent',
        });

        clrs.splice(0, 0, {
            className: 'remove',
            label: __('none'),
            value: null,
        });

        Reactium.Hook.runSync('rte-background-colors', clrs);

        return clrs;
    };

    return (
        <ColorSelect
            editable
            colors={colors()}
            onChange={onChange}
            name='style.backgroundColor'
            value={op.get(styles, 'backgroundColor')}
        />
    );
};

BackgroundColor.defaultProps = {
    onChange: noop,
    styles: {},
};

export { BackgroundColor, BackgroundColor as default };
