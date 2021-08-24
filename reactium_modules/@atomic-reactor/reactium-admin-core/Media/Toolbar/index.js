import React from 'react';
import ENUMS from '../enums';
import op from 'object-path';
import { Zone } from 'reactium-core/sdk';
import { useSelect } from '@atomic-reactor/use-select';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Toolbar
 * -----------------------------------------------------------------------------
 */
const Toolbar = ({ Media, zone = 'admin-media-toolbar' }) => {
    const { empty } = useSelect(state => op.get(state, 'Media.pagination', {}));

    return empty === true ? null : (
        <div className={Media.cname('toolbar')}>
            <div className='flex middle flex-grow'>
                <div className='mr-xs-20'>
                    <Button
                        color='clear'
                        className={Media.cname('toolbar-browse')}
                        data-tooltip={ENUMS.TEXT.BROWSE}
                        data-align='right'
                        data-vertical-align='middle'
                        onClick={e => Media.browseFiles(e)}>
                        <Icon name='Linear.FileAdd' size={40} />
                    </Button>
                </div>
                <div className='flex-grow show-md hide-xs'>
                    <h2>{ENUMS.TEXT.TOOLBAR}</h2>
                </div>
            </div>
            <div>
                <Zone zone={zone} Media={Media} />
            </div>
        </div>
    );
};

export default Toolbar;
