import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../../enums';
import domain from '../../domain';
import React, { useEffect, useState } from 'react';
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
const defaultDirectories = ['uploads', 'avatars'];

const DirectoryWidget = ({ Media, ...props }) => {
    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    Media = Media || useHandle(domain.name);

    const directories = op.get(Media.state, 'directories', defaultDirectories);

    const [directory, setDirectory] = useState(Media.directory);

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

    const onChange = e => {
        Media.folderSelect(e);
    };

    const showCreator = () => {
        Modal.show(<Creator />);
    };

    const showEditor = () => {
        Modal.show(<Editor />);
    };

    useEffect(() => {
        if (directory !== Media.directory) {
            setDirectory(Media.directory);
        }
    });

    return (
        <div className={Media.cname('dir-dropdown')}>
            <Dropdown
                checkbox={false}
                color={Button.ENUMS.COLOR.TERTIARY}
                size={Button.ENUMS.SIZE.SM}
                selection={[directory]}
                onItemClick={e => onChange(e.item.value)}
                data={data()}>
                <div className='btn-group'>
                    <Button
                        color={Button.ENUMS.COLOR.TERTIARY}
                        size={Button.ENUMS.SIZE.XS}
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

                    <Button
                        color={Button.ENUMS.COLOR.TERTIARY}
                        data-tooltip={ENUMS.TEXT.NEW_FOLDER}
                        data-align='left'
                        data-vertical-align='middle'
                        onClick={showCreator}
                        size={Button.ENUMS.SIZE.XS}
                        style={{
                            padding: '8px 8px 8px 9px',
                            borderLeft: '1px solid #909090',
                            width: 38,
                        }}>
                        <Icon name='Feather.Plus' size={18} />
                    </Button>
                    <Button
                        color={Button.ENUMS.COLOR.TERTIARY}
                        data-tooltip={ENUMS.TEXT.FOLDER_EDIT}
                        data-align='left'
                        data-vertical-align='middle'
                        onClick={showEditor}
                        size={Button.ENUMS.SIZE.XS}
                        style={{
                            padding: '8px 8px 8px 9px',
                            borderLeft: '1px solid #909090',
                            width: 38,
                        }}>
                        <Icon name='Feather.Settings' size={16} />
                    </Button>
                    {!Media.isEmpty() && props.filter === true && (
                        <Button
                            color={Button.ENUMS.COLOR.TERTIARY}
                            data-tooltip={ENUMS.TEXT.FILTER}
                            data-align='left'
                            data-vertical-align='middle'
                            size={Button.ENUMS.SIZE.XS}
                            style={{
                                padding: '8px 8px 8px 9px',
                                borderLeft: '1px solid #909090',
                                width: 38,
                            }}>
                            <Icon name='Linear.Funnel' size={16} />
                        </Button>
                    )}
                </div>
            </Dropdown>
        </div>
    );
};

export default DirectoryWidget;
