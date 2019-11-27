import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';

export default ({
    breakpoint,
    directory,
    directories,
    onBrowseClick,
    onDirectoryAddClick,
    onChange,
    zone,
}) => {
    const cx = cls => _.compact([`zone-${zone}`, cls]).join('-');

    const data = () => {
        let items = [];

        return items.concat(
            directories.map(item => ({
                value: item,
                label: item,
                icon: 'Linear.Folder',
            })),
        );
    };

    return (
        <>
            <div className='label'>
                <Icon
                    name='Linear.CloudUpload'
                    size={['xs', 'sm'].includes(breakpoint) ? 96 : 128}
                />
                <div className='my-xs-32 my-md-40'>{ENUMS.TEXT.EMPTY}</div>
                <Button
                    size={['xs', 'sm'].includes(breakpoint) ? 'md' : 'lg'}
                    color='primary'
                    appearance='pill'
                    onClick={onBrowseClick}>
                    {ENUMS.TEXT.BROWSE}
                </Button>
            </div>
            <div className={cx('directory')}>
                <Dropdown
                    selection={[directory]}
                    onItemClick={e => onChange(e.item.value)}
                    data={data()}>
                    <div className='btn-group'>
                        <Button
                            color='tertiary'
                            size='xs'
                            data-dropdown-element
                            style={{
                                minWidth: 145,
                                paddingLeft: 8,
                                paddingRight: 5,
                                justifyContent: 'flex-start',
                                overflowX: 'hidden',
                            }}>
                            <div className={cx('directory-label')}>
                                {directory}
                            </div>
                            <Icon name='Feather.ChevronDown' size={18} />
                        </Button>
                        <Button
                            color='tertiary'
                            size='xs'
                            style={{
                                padding: '8px 8px 8px 9px',
                                borderLeft: '1px solid #909090',
                            }}>
                            <Icon name='Feather.Plus' size={18} />
                        </Button>
                    </div>
                </Dropdown>
            </div>
        </>
    );
};
