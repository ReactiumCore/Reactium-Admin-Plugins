import React from 'react';
import op from 'object-path';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

const noop = () => {};

const TextColor = ({ onChange, styles }) => {
    const { ColorSelect } = useHookComponent('RichTextEditorSettings');

    const colors = () => {
        let clrs = JSON.parse(JSON.stringify(Reactium.RTE.colors));

        clrs.splice(0, 0, {
            className: 'remove',
            label: __('none'),
            value: null,
        });

        Reactium.Hook.runSync('rte-text-colors', clrs);

        return clrs;
    };

    return (
        <ColorSelect
            editable
            colors={colors()}
            onChange={onChange}
            name='style.color'
            value={op.get(styles, 'color')}
        />
    );
};

TextColor.defaultProps = {
    onChange: noop,
    styles: {},
};

export { TextColor, TextColor as default };
