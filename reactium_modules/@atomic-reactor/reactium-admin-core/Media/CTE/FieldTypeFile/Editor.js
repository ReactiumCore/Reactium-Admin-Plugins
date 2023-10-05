import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Uploader } from './Uploader';
import React, { useEffect, useMemo } from 'react';
import {
    __,
    useRefs,
    useHookComponent,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

export const Editor = (props) => {
    const refs = useRefs();

    let {
        allExtensions,
        editor,
        ext = [],
        fieldName,
        placeholder,
        required,
        buttonLabel,
        maxFiles,
        maxFileSize,
    } = props;

    const state = useSyncState();

    const ElementDialog = useHookComponent('ElementDialog');
    const { FormRegister, FormError } = useHookComponent('ReactiumUI');

    const cx = Reactium.Utils.cxFactory('ar-field-type-file');

    const uploaderProps = useMemo(() => {
        let acceptedFileTypes = allExtensions === true ? [] : ext;
        acceptedFileTypes = _.chain(acceptedFileTypes)
            .flatten()
            .compact()
            .value();

        return {
            acceptedFileTypes,
            buttonLabel,
            maxFiles,
            maxFileSize,
            placeholder,
        };
    }, [allExtensions, ext, placeholder]);

    const parseError = (str) => {
        const replacers = {
            '%fieldName': fieldName,
        };

        str = String(str);

        Object.entries(replacers).forEach(([s, v]) => {
            str = str.replace(new RegExp(s, 'gi'), v);
        });

        return str;
    };

    const validate = ({ values }) => {
        let err;

        const v = values[fieldName];

        if (required === true && !v) {
            err = parseError(__('%fieldName is required'));
        }

        if (err) editor.setError(fieldName, err);
    };

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
                <Uploader
                    {...uploaderProps}
                    ref={(elm) => refs.set('uploader', elm)}
                />
                <FormError name={fieldName} />
            </ElementDialog>
        </FormRegister>
    );
};

export default Editor;
