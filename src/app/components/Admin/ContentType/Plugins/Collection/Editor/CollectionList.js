import _ from 'underscore';
import op from 'object-path';
import pluralize from 'pluralize';
import React, { useEffect, useState } from 'react';
import { Button, Icon, DataTable } from '@atomic-reactor/reactium-ui';

export default props => {
    const { editor, onClickAdd, onClickRemove, state, uuid } = props;

    const [search, setSearch] = useState('');

    const columns = {
        title: {
            label: 'Title',
            verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
            sortType: DataTable.ENUMS.SORT_TYPE.STRING,
        },
        actions: {
            label: null,
            textAlign: DataTable.ENUMS.TEXT_ALIGN.RIGHT,
            verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
            width: 108,
        },
    };

    const data = () => {
        const results = op.get(state, 'results', {});

        return _.chain([
            Object.values(results).filter(
                item => op.get(item, 'selected', false) === true,
            ),
            Object.values(results).filter(
                item => op.get(item, 'selected', false) !== true,
            ),
        ])
            .flatten()
            .value()
            .filter(({ title }) => {
                if (search.length > 0) {
                    const regex = new RegExp(search, 'gi');
                    return String(title).search(regex) > -1;
                } else {
                    return true;
                }
            })
            .map(item => dataMap(item));
    };

    const dataMap = item => {
        // const url = _.compact([
        //     '/admin/content',
        //     op.get(state, 'collection.machineName'),
        //     item.slug,
        // ]).join('/');

        const selected = op.get(item, 'selected', false);
        const actions =
            selected === true ? (
                <Button
                    color={Button.ENUMS.COLOR.DANGER}
                    onClick={e => onClickRemove(e, item.objectId)}
                    size={Button.ENUMS.SIZE.XS}
                    style={{ padding: 0, width: 30, height: 30 }}
                    type={Button.ENUMS.TYPE.BUTTON}>
                    <Icon name='Feather.X' size={18} />
                </Button>
            ) : (
                <Button
                    color={Button.ENUMS.COLOR.TERTIARY}
                    onClick={e => onClickAdd(e, item.objectId)}
                    size={Button.ENUMS.SIZE.XS}
                    style={{ padding: 0, width: 30, height: 30 }}
                    type={Button.ENUMS.TYPE.BUTTON}>
                    <Icon name='Feather.Plus' size={18} />
                </Button>
            );

        item['actions'] = actions;
        item['selected'] = selected;
        //item['url'] = url;

        return item;
    };

    const _onSearch = ({ search }) => setSearch(search);

    useEffect(() => {
        if (!uuid) return;
        const evt = `collection-relation-search-${uuid}`;
        editor.addEventListener(evt, _onSearch);
        return () => {
            editor.removeEventListener(evt, _onSearch);
        };
    }, [uuid]);

    return <DataTable columns={columns} data={data()} />;
};
