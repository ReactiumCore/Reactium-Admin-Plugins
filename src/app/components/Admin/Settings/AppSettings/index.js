import React from 'react';
import Reactium, { __ } from 'reactium-core/sdk';
import { Plugins } from 'reactium-core/components/Plugable';
import { Helmet } from 'react-helmet';
import { WebForm, Dialog } from '@atomic-reactor/reactium-ui';

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
                <title>
                    {__('App')} - {__('Settings')}
                </title>
            </Helmet>
            <Dialog {...dialog}>
                <Plugins zone={'app-settings-dialog-pre'} />

                <WebForm>
                    {
                        // default appliation settings here
                    }
                    <Plugins zone={'app-settings-dialog-webform'} />
                </WebForm>

                <Plugins zone={'app-settings-dialog-post'} />
            </Dialog>
        </>
    );
};

export default AppSettings;
