import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import { slugify } from 'components/Admin/ContentType';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

export default ({ editor, region, ...props }) => {
    const { cx, fieldTypes } = editor;
    let { fieldName, fieldType } = props;

    const id = op.get(fieldTypes, [fieldType, 'component']);

    const RegisteredEditor = id
        ? _.findWhere(Reactium.Content.Editor.list, { id })
        : undefined;

    const isEditor = () => {
        if (typeof RegisteredEditor === 'undefined') return false;
        return op.has(RegisteredEditor, 'component');
    };

    if (!isEditor()) return null;

    const { component: Component } = RegisteredEditor;

    const title = fieldName;
    fieldName = slugify(fieldName);
    const className = [cx('element'), cx(`element-${fieldName}`)];
    const pref = ['admin.dialog.editor', editor.type, region, fieldName];

    return (
        <div className={className.join(' ')}>
            <Component
                {...props}
                editor={editor}
                region={region}
                pref={pref.join('.')}
                fieldName={fieldName}
                title={title}
            />
        </div>
    );
};
