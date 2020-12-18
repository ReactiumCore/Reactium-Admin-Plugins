import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

const TypeIcon = ({ type, ...props }) => {
    type = String(type).toLowerCase();

    const { Icon } = useHookComponent('ReactiumUI');

    const icons = {
        all: <Icon name='Feather.Filter' {...props} />,
        audio: <Icon name='Feather.Mic' {...props} />,
        clear: <Icon name='Feather.X' {...props} />,
        image: <Icon name='Feather.Camera' {...props} />,
        file: <Icon name='Feather.File' {...props} />,
        video: <Icon name='Feather.Video' {...props} />,
    };

    Reactium.Hook.runSync('media-picker-filter-icons', icons, type, props);

    return op.get(icons, type, null);
};

const TypeSelect = ({ picker }) => {
    const { cx, setState, state } = picker;
    let { filters = [], type = 'all' } = state;

    const { Button, Dropdown } = useHookComponent('ReactiumUI');

    filters.sort();

    const data = () => {
        return _.chain([
            type !== 'all'
                ? [
                      {
                          value: 'all',
                          label: <TypeIcon type='clear' />,
                      },
                  ]
                : null,
            filters.map(item => ({
                value: item,
                label: <TypeIcon type={item} />,
            })),
        ])
            .flatten()
            .compact()
            .value();
    };

    const onItemClick = ({ item }) => setState({ page: 1, type: item.value });

    const active = type !== 'all';

    return filters.length > 1 ? (
        <div className={cx('type-select')}>
            <Dropdown
                align={Dropdown.ENUMS.ALIGN.CENTER}
                checkbox={false}
                data={data()}
                onItemClick={onItemClick}
                selection={[type]}
                size={Button.ENUMS.SIZE.SM}>
                <Button
                    className={cx('type-button')}
                    color={Button.ENUMS.COLOR.CLEAR}
                    data-dropdown-element>
                    <span className={cn('icon', { active })}>
                        <TypeIcon type={type} />
                    </span>
                </Button>
            </Dropdown>
        </div>
    ) : null;
};

export { TypeIcon, TypeSelect, TypeSelect as default };
