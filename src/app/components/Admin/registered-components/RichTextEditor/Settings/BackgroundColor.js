import React from 'react';
import op from 'object-path';
import { useHookComponent } from 'reactium-core/sdk';

const noop = () => {};

const BackgroundColor = ({ onChange, styles }) => {
    const { ColorSelect } = useHookComponent('RichTextEditorSettings');

    return (
        <ColorSelect
            editable
            name='style.backgroundColor'
            onChange={onChange}
            value={op.get(styles, 'backgroundColor')}
        />
    );
};

BackgroundColor.defaultProps = {
    onChange: noop,
    styles: {},
};

export { BackgroundColor, BackgroundColor as default };
