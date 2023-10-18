import _ from 'underscore';
import op from 'object-path';
import React, { useEffect } from 'react';
import Reactium from '@atomic-reactor/reactium-core/sdk';

export const Media = (props) => {
    const { editor } = props;

    const onLoad = async () => {
        const obj = editor.get('obj');

        if (!obj || !obj.get('uuid')) return;

        const [d, s] = [
            Array.from(editor.elements.default),
            Array.from(editor.elements.sidebar),
        ];

        const elms = _.where(Array.from(_.flatten([d, s])), {
            fieldType: 'File',
        });

        const meta = obj.get('meta') || {};
        const vals = { data: obj.get('data'), meta };

        _.flatten(
            elms.map((elm) => {
                let { fieldName: key } = elm;

                let files =
                    key === 'file'
                        ? [obj.get(key)]
                        : op.get(vals, ['data', key], []);

                files = files.map((item) => {
                    const m = op.get(meta, ['file', key, 'meta']);
                    const t = op.get(meta, ['file', key, 'tags']);

                    item.metadata = m;
                    item.tags = t;

                    return item;
                });

                return { files, key };
            }),
        ).forEach(({ files, key }) => editor.Form.setValue(key, files));
    };

    const onSubmit = ({ value }) => {
        const file = _.first(op.get(value, 'file'));
        value.status = Reactium.Content.STATUS.PUBLISHED.value;
        value.title = op.get(value, 'uuid', file.metadata.name);
        value.file = file;
    };

    useEffect(() => {
        // onLoad();
        editor.addEventListener('submit', onSubmit);
        editor.addEventListener('editor-load', onLoad);
        return () => {
            editor.removeEventListener('submit', onSubmit);
            editor.removeEventListener('editor-load', onLoad);
        };
    }, [editor]);

    return <input type='hidden' name='uuid' />;
};

export default Media;
