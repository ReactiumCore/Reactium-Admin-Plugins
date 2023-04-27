import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Alert, Icon } from 'reactium-ui';

const Notice = ({ editor }) => {
    const { alert, cx, refs, setAlert, state = {} } = editor;
    const { editing = false } = state;

    const onHide = () => setAlert(undefined);

    const render = () => (
        <div className={cx('alert')}>
            <Alert
                color={op.get(alert, 'color')}
                dismissable
                icon={
                    <Icon
                        name={op.get(alert, 'icon', 'Feather.AlertOctagon')}
                    />
                }
                onHide={onHide}
                ref={refs.alertRef}>
                {op.get(alert, 'message')}
            </Alert>
        </div>
    );

    return !editing || !alert ? null : render();
};

export { Notice, Notice as default };
