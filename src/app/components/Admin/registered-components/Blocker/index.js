import React from 'react';
import ReactDOM from 'react-dom';
import Proptypes from 'prop-types';
import { Spinner } from '@atomic-reactor/reactium-ui';

const Blocker = props => {
    if (typeof window === 'undefined') return null;
    return ReactDOM.createPortal(<Spinner {...props} />, document.body);
};

Blocker.propTypes = {
    ...Spinner.propTypes,
};

Blocker.defaultProps = {
    className: 'ar-blocker',
};

export default Blocker;

/**
 * @api {RegisteredComponent} <Blocker/> Blocker
 * @apiDescription Overlay that displays the Reactium UI `<Spinner />` component and disables interaction with the rest of the UI.
 * @apiName Blocker
 * @apiGroup Registered Component
 * @apiParam {Object} props See the documentation for the [http://ui.reactium.io/toolkit/components/spinner-molecule](Spinner component).
 * @apiExample Basic Usage:
import Blocker from 'components/Admin/registered-components/Blocker';

...

<Blocker />

 * @apiExample useHookComponent Example:
import { useHookComponent } from 'reactium-core/sdk';

const Component = props => {
    const Blocker = useHookComponent('Blocker');

    return <Blocker />
};

export default Component;
 */
