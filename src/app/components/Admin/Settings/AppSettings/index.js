import React from 'react';
import { Helmet } from 'react-helmet';
import { Dialog } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: AppSettings
 * -----------------------------------------------------------------------------
 */
const AppSettings = ({ dialog }) => {
    return (
        <>
            <Helmet>
                <meta charSet='utf-8' />
                <title>Settings</title>
            </Helmet>
            <Dialog {...dialog}>AppSettings</Dialog>
        </>
    );
};

export default AppSettings;
