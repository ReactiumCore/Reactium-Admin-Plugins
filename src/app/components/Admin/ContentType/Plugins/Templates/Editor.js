import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import React, { useRef, useEffect, useState } from 'react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Editor
 * -----------------------------------------------------------------------------
 */
const Editor = ({ namespace, ...props }) => {
    const { editor, fieldName } = props;

    // -------------------------------------------------------------------------
    // Components
    // -------------------------------------------------------------------------
    const ElementDialog = useHookComponent('ElementDialog');

    const cx = Reactium.Utils.cxFactory(namespace);

    const templates = () => {
        let templates = op.get(props, 'templates');
        templates = templates ? templates.split(',') : [];

        Reactium.Hook.runSync('template-list', templates, props);
        return templates;
    };

    const onBeforeSave = ({ value }) => {
        console.log('debug:', 2, value);
    };

    const onChange = e => {
        const value = e.target.value;
        editor.setValue({ [fieldName]: value });
    };

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!editor) return;
        editor.addEventListener('save', onBeforeSave);
        return () => {
            editor.removeEventListener('save', onBeforeSave);
        };
    });

    console.log('debug:', 1, editor.value);

    return templates().length < 1 ? null : (
        <ElementDialog {...props}>
            <div className={cn(cx('editor'), 'form-group')}>
                <select
                    name={fieldName}
                    onChange={onChange}
                    value={op.get(editor.value, fieldName, '')}>
                    <option value=''>{__('Select template')}</option>
                    {templates().map((template, i) => (
                        <option key={`template-${i}`} children={template} />
                    ))}
                </select>
            </div>
        </ElementDialog>
    );
};

Editor.propTypes = {
    namespace: PropTypes.string,
};

Editor.defaultProps = {
    namespace: 'template',
};

export { Editor, Editor as default };
