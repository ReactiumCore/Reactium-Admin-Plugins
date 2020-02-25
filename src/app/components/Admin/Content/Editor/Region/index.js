import _ from 'underscore';
import op from 'object-path';
import Element from '../Element';
import React, { useEffect, useState } from 'react';
import Reactium, { useAsyncEffect, Zone } from 'reactium-core/sdk';

const getEditor = editor =>
    new Promise(resolve => {
        const ival = setInterval(() => {
            if (!op.get(editor, 'contentType')) return;
            clearInterval(ival);
            resolve(true);
        }, 1);
    });

export default ({ editor, ...props }) => {
    const [ready, setReady] = useState(false);

    useAsyncEffect(async mounted => {
        const results = await getEditor(editor);
        if (mounted()) setReady(results);
    });

    const render = () => {
        if (ready !== true) return null;

        const { contentType, cx } = editor;

        const { id, slug } = props;
        const className = `${cx('editor-region')} ${cx(
            `editor-region-${slug}`,
        )}`;
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
