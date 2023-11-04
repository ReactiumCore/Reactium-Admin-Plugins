import _ from 'underscore';
import op from 'object-path';
import React, { useCallback, useEffect } from 'react';
import Reactium from '@atomic-reactor/reactium-core/sdk';

export const Media = (props) => {
    const { editor } = props;

    const onLoad = useCallback(async () => {
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
                        : Object.values(op.get(vals, ['data', key], {}));

                files = _.sortBy(
                    files.map((item, i) => {
                        const idarray = String(item._name).split('.');
                        idarray.pop();

                        const id = idarray.join('.');

                        const _m = op.get(meta, ['file', key, id]);

                        if (!_m) return null;

                        if (!op.get(_m, 'meta.index')) {
                            op.set(_m, 'meta.index', i);
                        }
                        const m = op.get(_m, 'meta');
                        const t = op.get(_m, 'tags');

                        item.index = op.get(_m, 'meta.index');
                        item.metadata = m;
                        item.tags = t;

                        return item;
                    }),
                    'index',
                );

                files = _.compact(files);

                return { files, key };
            }),
        ).forEach(({ files, key }) => editor.Form.setValue(key, files));
    }, [editor]);

    const onSubmit = useCallback(
        ({ value }) => {
            const file = _.first(op.get(value, 'file'));
            value.status = Reactium.Content.STATUS.PUBLISHED.value;
            value.title = op.get(value, 'uuid', file.metadata.name);
            value.file = file;
        },
        [editor],
    );

    // onSubmit() onLoad() listeners
    useEffect(() => {
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
