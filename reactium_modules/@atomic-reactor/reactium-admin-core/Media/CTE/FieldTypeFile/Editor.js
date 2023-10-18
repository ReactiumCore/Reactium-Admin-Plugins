import _ from 'underscore';
import op from 'object-path';
import { Uploader } from './Uploader';
import React, { useCallback, useEffect, useMemo } from 'react';

import Reactium, {
    __,
    useSyncState,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

export const Editor = (props) => {
    let {
        allExtensions,
        autoUpload,
        editor,
        ext = [],
        fieldName,
        params,
        placeholder,
        required,
        buttonLabel,
        maxFiles,
        maxFileSize,
        serialize,
    } = props;

    const state = useSyncState();

    const ElementDialog = useHookComponent('ElementDialog');

    const { FormRegister, FormError } = useHookComponent('ReactiumUI');

    const vkey = useMemo(() => {
        return fieldName === 'file' ||
            String(fieldName).startsWith('meta') ||
            String(fieldName).startsWith('data')
            ? fieldName
            : `data.${fieldName}`;
    }, [fieldName]);

    const cx = Reactium.Utils.cxFactory('ar-field-type-file');

    const uploaderProps = (() => {
        let acceptedFileTypes = allExtensions === true ? [] : ext;
        acceptedFileTypes = _.chain(acceptedFileTypes)
            .flatten()
            .compact()
            .value();

        let value = op.get(editor, ['Form', 'value', fieldName], []);
        value = !_.isArray(value) ? [value] : value;
        value = _.compact(value);

        return {
            acceptedFileTypes,
            autoUpload,
            buttonLabel,
            editor,
            fieldName,
            maxFiles,
            maxFileSize,
            params,
            placeholder,
            serialize,
            value,
            vkey,
        };
    })();

    const onFileUploadAdded = useCallback(() => {
        editor.clearError(fieldName);
        editor.disable();
    }, [editor]);

    const onUploaded = useCallback(
        (e) => {
            editor.setValue(fieldName, e.value);
            editor.enable();
        },
        [editor, fieldName, vkey],
    );

    const parseError = useCallback(
        (str) => {
            const replacers = {
                '%fieldName': fieldName,
            };

            str = String(str);

            Object.entries(replacers).forEach(([s, v]) => {
                str = str.replace(new RegExp(s, 'gi'), v);
            });

            return str;
        },
        [fieldName],
    );

    const validate = useCallback(
        ({ values }) => {
            let err;

            const v = values[fieldName];

            if (
                (required === true && !v) ||
                (required && Array.isArray(v) && v.length < 1)
            ) {
                err = parseError(__('%fieldName is required'));
            }

            if (err) editor.setError(fieldName, err, true);
        },
        [editor, fieldName, required],
    );

    useEffect(() => {
        editor.addEventListener('validate', validate);
        return () => {
            editor.removeEventListener('validate', validate);
        };
    }, [editor]);

    state.extend('cx', cx);

    return (
        <FormRegister>
            <ElementDialog {...props}>
                <FormError name={fieldName} />
                <Uploader
                    {...uploaderProps}
                    onUploaded={onUploaded}
                    onFileUploadAdded={onFileUploadAdded}
                    ref={(elm) => editor.refs.set(`uploader.${fieldName}`, elm)}
                />
            </ElementDialog>
        </FormRegister>
    );
};

export default Editor;
