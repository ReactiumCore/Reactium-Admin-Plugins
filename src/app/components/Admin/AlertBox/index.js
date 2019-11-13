import React from 'react';
import ENUMS from './enums';
import PropTypes from 'prop-types';
import { __ } from 'reactium-core/sdk';
import ConfirmBox from 'components/Admin/ConfirmBox';

const noop = () => {};
/**
 * -----------------------------------------------------------------------------
 * Functional Component: AlertBox
 * -----------------------------------------------------------------------------
 */
const AlertBox = ({ onClick, ...props }) => (
    <ConfirmBox {...props} onCancel={onClick} />
);

AlertBox.propTypes = {
    message: PropTypes.node.isRequired,
};

AlertBox.defaultProps = {
    title: ENUMS.TEXT.TITLE,
    buttons: {
        ok: {
            label: ENUMS.TEXT.LABEL.OK,
            cancel: true,
        },
    },
    onClick: noop,
};

export default AlertBox;

/**
 * @api {Component} <AlertBox/> AlertBox
 * @apiDescription Dialog that displays an alert message.
 * @apiName AlertBox
 * @apiGroup Components
 * @apiParam {Object} buttons The action buttons to display.
 * @apiParam {Function} onClick Function to execute when the `ok` action button is clicked.
 * @apiParam {Mixed} message The Alert message. The message can be any valid `PropTypes.node` value.
 * @apiParam {String} [title='Alert'] The titlebar content.
 * @apiParam {Object} [style] React style object applied to the AlertBox wrapper div.
 * @apiExample Simple Usage:
import AlertBox from 'components/Admin/AlertBox';

...

<AlertBox
  message='Permission Denied!',
  onClick={() => console.log('ok'); }
  title='Error'
/>

 * @apiExample Custom Button Label:
import AlertBox from 'components/Admin/AlertBox';

...

const buttons = { ...AlertBox.defaultProps.buttons };
buttons.ok.label = 'Aight den boi!';

...

<AlertBox
  buttons={buttons}
  message='Permission Denied!',
  onClick={() => console.log('ok'); }
  title='Error'
/>


  @apiExample Import
import AlertBox from 'components/Admin/AlertBox';

  @apiExample Dependencies
import ConfirmBox from 'components/Admin/ConfirmBox';
*/
