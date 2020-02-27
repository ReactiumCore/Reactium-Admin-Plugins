import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Element from '../Element';
import React, { useEffect, useState } from 'react';
import Reactium, { useAsyncEffect, Zone } from 'reactium-core/sdk';

export default ({ editor, ...props }) => {
    const render = () => {
        const { contentType, cx } = editor;

        const { id, slug } = props;

        const className = cn(cx('editor-region'), cx(`editor-region-${slug}`));

        const fields = _.where(
            Object.values(op.get(editor, 'contentType.fields')),
            { region: id },
        );

        return (
            <div className={className}>
                {fields.map(item => (
                    <Element
                        key={item.fieldId}
                        editor={editor}
                        region={props}
                        {...item}
                    />
                ))}
                <Zone zone={editor.cx(slug)} editor={editor} />
            </div>
        );
    };

    return render();
};
