import React from 'react';
import op from 'object-path';
import { fileSize } from './UploaderPreview';

export const UploaderPreviewInfo = ({ file, serialize }) => {
    const ID = op.get(file, 'ID', op.get(file, 'metadata.ID'));

    const name = op.get(file, 'name', op.get(file, '_name'));

    const ext = String(name).split('.').pop();

    const fileName = serialize ? [ID, ext].join('.') : name;

    const s = op.get(file, 'size', op.get(file, 'metadata.size', 0));
    const size = s && s > 0 ? fileSize(s) : null;

    return (
        <>
            {fileName && <div>{fileName}</div>}
            {size && <small>{size}</small>}
        </>
    );
};

export default UploaderPreviewInfo;
