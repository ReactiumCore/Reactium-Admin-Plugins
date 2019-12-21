import React from 'react';
import op from 'object-path';
import ENUMS from '../../enums';
import domain from '../../domain';
import Editor from 'components/Admin/Media/Directory/Editor';
import Creator from 'components/Admin/Media/Directory/Creator';
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
    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const Media = useHandle(domain.name);

    const directories = op.get(Media.state, 'directories', [
        'uploads',
        'avatars',
    ]);

    const directory = Media.directory;

    const data = () => {
        const dirs = [
            {
                value: null,
                label: ENUMS.TEXT.FOLDER_ALL,
            },
        ];

        return dirs.concat(
            directories.map(item => ({
                value: item,
                label: item,
            })),
        );
    };

    const onChange = e => Media.folderSelect(e);

    const showCreator = () => {
        Modal.show(<Creator />);
    };

    const showEditor = () => {
        Modal.show(<Editor />);
    };

    return (
        <div className={Media.cname('dir-dropdown')}>
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
                        <div className={Media.cname('dir-dropdown-label')}>
                            {directory || ENUMS.TEXT.FOLDER_ALL}
                        </div>
                        <Icon name='Feather.ChevronDown' size={18} />
                    </Button>
                </Dropdown>
                <Button
                    color='tertiary'
                    data-tooltip={ENUMS.TEXT.NEW_FOLDER}
                    data-align='left'
                    data-vertical-align='middle'
                    onClick={showCreator}
                    size='xs'
                    style={{
                        padding: '8px 8px 8px 9px',
                        borderLeft: '1px solid #909090',
                        width: 38,
                    }}>
                    <Icon name='Feather.Plus' size={18} />
                </Button>
                <Button
                    color='tertiary'
                    data-tooltip={ENUMS.TEXT.FOLDER_EDIT}
                    data-align='left'
                    data-vertical-align='middle'
                    onClick={showEditor}
                    size='xs'
                    style={{
                        padding: '8px 8px 8px 9px',
                        borderLeft: '1px solid #909090',
                        width: 38,
                    }}>
                    <Icon name='Feather.Settings' size={16} />
                </Button>
                {!Media.isEmpty() && props.filter === true && (
                    <Button
                        color='tertiary'
                        data-tooltip={ENUMS.TEXT.FILTER}
                        data-align='left'
                        data-vertical-align='middle'
                        size='xs'
                        style={{
                            padding: '8px 8px 8px 9px',
                            borderLeft: '1px solid #909090',
                            width: 38,
                        }}>
                        <Icon name='Feather.Filter' size={16} />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default DirectoryWidget;
