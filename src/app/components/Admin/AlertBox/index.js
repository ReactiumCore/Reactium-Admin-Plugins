import React from 'react';
import ConfirmBox from 'components/Admin/ConfirmBox';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: AlertBox
 * -----------------------------------------------------------------------------
 */
const AlertBox = props => <ConfirmBox {...props} />;

AlertBox.defaultProps = {
    buttons: {
        ok: {
            label: 'OK',
            cancel: true,
        },
    },
};

export default AlertBox;
