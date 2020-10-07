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

export const Editor = props => {
    const contRef = useRef();

    const { editor, fieldName } = props;

    const [status, setNewStatus] = useState(ENUMS.STATUS.READY);
    const setStatus = newStatus => {
        if (unMounted()) return;
        setNewStatus(newStatus);
    };

    const { Button, Spinner } = useHookComponent('ReactiumUI');
    const ElementDialog = useHookComponent('ElementDialog');

    const cx = Reactium.Utils.cxFactory('blueprint');

    const unMounted = () => !contRef.current;

    const blueprints = () => {
        let blueprints = op.get(props, 'blueprints');
        blueprints = blueprints ? blueprints.split(',') : [];

        Reactium.Hook.runSync('blueprint-list', blueprints, props);
        return blueprints;
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

    const blueprint = editor ? op.get(editor.value, 'blueprint') : null;

    return blueprints().length < 1 ? null : (
        <ElementDialog {...props}>
            <div className={cx('editor')} ref={contRef}>
                <div className={!blueprint ? 'col-xs-12' : 'col-xs-9'}>
                    <div className='form-group'>
                        <select defaultValue={blueprint} name={fieldName}>
                            <option value=''>{__('Select blueprint')}</option>
                            {blueprints().map((blueprint, i) => (
                                <option
                                    key={`blueprint-${i}`}
                                    children={blueprint}
                                />
                            ))}
                        </select>
                    </div>
                </div>
                {blueprint && (
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
