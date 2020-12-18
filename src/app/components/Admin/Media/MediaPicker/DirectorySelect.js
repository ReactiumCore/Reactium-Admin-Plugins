import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import { useHookComponent } from 'reactium-core/sdk';

export default ({ picker }) => {
    const { directories = [], cx, setState, state } = picker;
    const { directory = 'all', directoryLabel = ENUMS.TEXT.FOLDER_ALL } = state;

    const { Button, Dropdown, Icon } = useHookComponent('ReactiumUI');

    const data = () => {
        const dirs = Array.isArray(directories) ? directories : [];

        return _.chain([
            [
                {
                    value: 'all',
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

    const onItemClick = ({ item }) =>
        setState({
            page: 1,
            directory: item.value,
            directoryLabel: item.label,
        });

    const active = directory !== 'all';

    return directories.length > 0 ? (
        <div className={cx('directory-select')}>
            <Dropdown
                align={Dropdown.ENUMS.ALIGN.RIGHT}
                checkbox={false}
                data={data()}
                onItemClick={onItemClick}
                selection={[directory]}
                size={Button.ENUMS.SIZE.SM}
                verticalAlign={Dropdown.ENUMS.VALIGN.BOTTOM}>
                <Button
                    className={cx('directory-button')}
                    color={Button.ENUMS.COLOR.CLEAR}
                    data-dropdown-element>
                    {directory !== 'all' && (
                        <span className='label'>{directoryLabel}</span>
                    )}
                    <span className={cn('icon', { active })}>
                        <Icon name='Feather.Folder' />
                    </span>
                </Button>
            </Dropdown>
        </div>
    ) : null;
};
