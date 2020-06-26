import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../../enums';
import domain from '../../domain';
import React, { useEffect, useRef, useState } from 'react';
import { __, useHandle, useStore } from 'reactium-core/sdk';
import Editor from 'components/Admin/Media/Directory/Editor';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';
import useDirectories from 'components/Admin/Media/Directory/useDirectories';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: DirectoryWidget
 * -----------------------------------------------------------------------------
 */
const DirectoryWidget = ({ Media }) => {
    const containerRef = useRef();

    const { dispatch, getState, subscribe } = useStore();

    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    Media = Media || useHandle(domain.name);

    const getDirectories = useDirectories() || [];

    const [directories, setNewDirectories] = useState(getDirectories);

    const setDirectories = newDirectories => {
        if (unMounted()) return;
        setNewDirectories(newDirectories);
    };

    const data = () => {
        const dirs = Array.isArray(directories) ? directories : [];

        return _.chain([
            [
                {
                    value: null,
                    label: ENUMS.TEXT.FOLDER_ALL,
                },
            ],
            dirs.map(item => ({
                value: item,
                label: item,
            })),
        ])
            .flatten()
            .sortBy('label')
            .value();
    };

    const dataTypes = () =>
        _.flatten([
            { label: __('All file types'), value: null },
            Object.keys(ENUMS.TYPE).map(type => ({
                label: String(type).toLowerCase(),
                value: type,
            })),
        ]);

    const unMounted = () => !containerRef.current;

    const showEditor = () => {
        Modal.show(<Editor />);
    };

    const _onDirectorySelect = e => {
        if (Media.setPage) Media.setPage(1);
        Media.setDirectory(e.item.value);
    };

    const _onTypeSelect = e => {
        if (Media.setPage) Media.setPage(1);
        Media.setType(e.item.value);
    };

    useEffect(() => {
        const unsub = subscribe(() => {
            const dirs = op.get(getState(), 'Media.directories', []);
            dirs.sort();

            if (_.isEqual(dirs, directories)) return;
            _.defer(() => setDirectories(dirs));
        });

        return unsub;
    });

    useEffect(() => {
        if (_.isEqual(getDirectories, directories)) return;

        dispatch({
            type: ENUMS.ACTION_TYPE,
            domain: ENUMS.DOMAIN,
            update: { directories: getDirectories },
        });

        setDirectories(getDirectories);
    }, [getDirectories]);

    return (
        <div className={Media.cname('dir-dropdown')} ref={containerRef}>
            <div className='btn-group'>
                <Dropdown
                    checkbox={false}
                    color={Button.ENUMS.COLOR.TERTIARY}
                    size={Button.ENUMS.SIZE.SM}
                    selection={[Media.directory]}
                    onItemClick={e => _onDirectorySelect(e)}
                    data={data()}>
                    <Button
                        color={Button.ENUMS.COLOR.TERTIARY}
                        size={Button.ENUMS.SIZE.XS}
                        data-dropdown-element
                        data-tooltip={ENUMS.TEXT.FOLDER}
                        data-align='left'
                        data-vertical-align='middle'
                        style={{
                            minWidth: 150,
                            height: 38,
                            padding: '8px 5px 8px 8px',
                            justifyContent: 'flex-start',
                            overflowX: 'hidden',
                        }}>
                        <div className={Media.cname('dir-dropdown-label')}>
                            {Media.directory || ENUMS.TEXT.FOLDER_ALL}
                        </div>
                        <Icon name='Feather.ChevronDown' size={18} />
                    </Button>
                </Dropdown>
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
                    <Icon name='Linear.Cog' size={18} />
                </Button>
                {Media && Media.isStatus(ENUMS.STATUS.READY) && (
                    <Dropdown
                        align={Dropdown.ENUMS.ALIGN.RIGHT}
                        checkbox={false}
                        color={Button.ENUMS.COLOR.TERTIARY}
                        size={Button.ENUMS.SIZE.SM}
                        selection={_.compact([Media.type])}
                        onItemClick={e => _onTypeSelect(e)}
                        data={dataTypes()}>
                        <Button
                            color={Button.ENUMS.COLOR.TERTIARY}
                            data-tooltip={ENUMS.TEXT.FILTER}
                            data-align='left'
                            data-dropdown-element
                            data-vertical-align='middle'
                            size={Button.ENUMS.SIZE.XS}
                            style={{
                                padding: '8px 8px 8px 9px',
                                borderLeft: '1px solid #909090',
                                width: 38,
                                height: 38,
                            }}>
                            <Icon name='Linear.Funnel' size={18} />
                        </Button>
                    </Dropdown>
                )}
            </div>
        </div>
    );
};

export default DirectoryWidget;
