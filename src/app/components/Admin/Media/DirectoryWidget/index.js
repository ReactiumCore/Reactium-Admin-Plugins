import React from 'react';
import ENUMS from '../enums';
import op from 'object-path';
import domain from '../domain';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';

import Reactium, {
    useDocument,
    useHandle,
    useReduxState,
    useRegisterHandle,
    useSelect,
    useStore,
    useWindowSize,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: DirectoryWidget
 * -----------------------------------------------------------------------------
 */
const DirectoryWidget = props => {
    const Media = useHandle(domain.name);

    const directories = op.get(Media.state, 'directories', ['uploads']);

    const directory = Media.directory;

    const data = () =>
        directories.map(item => ({
            value: item,
            label: item,
            icon: 'Linear.Folder',
        }));

    const onChange = e => Media.folderSelect(e);

    return (
        <div className={Media.cname('directory')}>
            <div className='btn-group'>
                <Dropdown
                    selection={[directory]}
                    onItemClick={e => onChange(e.item.value)}
                    data={data()}>
                    <Button
                        color='tertiary'
                        size='xs'
                        data-dropdown-element
                        data-tooltip={ENUMS.TEXT.FOLDER}
                        data-align='left'
                        data-vertical-align='middle'
                        style={{
                            minWidth: 145,
                            padding: '8px 5px 8px 8px',
                            justifyContent: 'flex-start',
                            overflowX: 'hidden',
                        }}>
                        <div className={Media.cname('directory-label')}>
                            {directory}
                        </div>
                        <Icon name='Feather.ChevronDown' size={18} />
                    </Button>
                </Dropdown>
                <Button
                    color='tertiary'
                    data-tooltip={ENUMS.TEXT.NEW_FOLDER}
                    data-align='left'
                    data-vertical-align='middle'
                    size='xs'
                    style={{
                        padding: '8px 8px 8px 9px',
                        borderLeft: '1px solid #909090',
                    }}>
                    <Icon name='Feather.Plus' size={18} />
                </Button>
                {!Media.isEmpty() && (
                    <Button
                        color='tertiary'
                        data-tooltip={ENUMS.TEXT.FILTER}
                        data-align='left'
                        data-vertical-align='middle'
                        size='xs'
                        style={{
                            padding: '8px 8px 8px 9px',
                            borderLeft: '1px solid #909090',
                        }}>
                        <Icon name='Feather.Filter' size={16} />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default DirectoryWidget;
