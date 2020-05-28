import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useRef, useState } from 'react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Editor
 * -----------------------------------------------------------------------------
 */

const ENUMS = {
    STATUS: {
        LOADING: 'LOADING',
        READY: 'READY',
    },
};

export const Editor = ({ namespace, ...props }) => {
    const contRef = useRef();

    const { editor, fieldName } = props;

    const [status, setNewStatus] = useState(ENUMS.STATUS.READY);
    const setStatus = newStatus => {
        if (unMounted()) return;
        setNewStatus(newStatus);
    };

    const { Button, Spinner } = useHookComponent('ReactiumUI');
    const ElementDialog = useHookComponent('ElementDialog');

    const cx = Reactium.Utils.cxFactory('template');

    const unMounted = () => !contRef.current;

    const templates = () => {
        let templates = op.get(props, 'templates');
        templates = templates ? templates.split(',') : [];

        Reactium.Hook.runSync('template-list', templates, props);
        return templates;
    };

    const preview = async () => {
        setStatus(ENUMS.STATUS.LOADING);

        await editor.save();

        const previewURL = op.get(props, 'previewURL');

        const type = op.get(editor, 'type');
        const branch = op.get(editor.value, 'history.branch', 'master');
        const revision = _.last(
            op.get(editor.value, ['branches', branch, 'history'], []),
        );

        const url = String(previewURL)
            .replace(/\:type/gi, type)
            .replace(/\:branch/gi, branch)
            .replace(/\:revision/gi, revision);

        setTimeout(() => {
            setStatus(ENUMS.STATUS.READY);
            window.open(url, '_blank');
        }, 1000);
    };

    const template = editor ? op.get(editor.value, 'template') : null;

    return templates().length < 1 ? null : (
        <ElementDialog {...props}>
            <div className={cx('editor')} ref={contRef}>
                <div className={!template ? 'col-xs-12' : 'col-xs-9'}>
                    <div className='form-group'>
                        <select defaultValue='select' name={fieldName}>
                            <option value='select'>
                                {__('Select template')}
                            </option>
                            {templates().map((template, i) => (
                                <option
                                    key={`template-${i}`}
                                    children={template}
                                />
                            ))}
                        </select>
                    </div>
                </div>
                {template && (
                    <div className='col-xs-3 pl-xs-8'>
                        <Button
                            block
                            color={Button.ENUMS.COLOR.TERTIARY}
                            disabled={status === ENUMS.STATUS.LOADING}
                            onClick={preview}
                            style={{ height: 41 }}>
                            {status !== ENUMS.STATUS.LOADING ? (
                                __('Preview')
                            ) : (
                                <Spinner color={Spinner.COLOR.WHITE} />
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </ElementDialog>
    );
};
