import op from 'object-path';
import { slugify } from 'components/Admin/ContentType';
import Reactium, { useHookComponent } from 'reactium-core/sdk';
import React, { useEffect, useImperativeHandle, useState } from 'react';

export default ({ editor, region, ...props }) => {
    const { cx, fieldTypes } = editor;
    let { fieldName, fieldType } = props;

    const cid = op.get(fieldTypes, [fieldType, 'component']);

    const Component = cid ? useHookComponent(`${cid}-editor`) : null;
    const [isComponent, setIsComponent] = useState(!!Component);

    useEffect(() => {
        setIsComponent(!!Component);
    }, [Component]);

    if (!isComponent) return null;

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
