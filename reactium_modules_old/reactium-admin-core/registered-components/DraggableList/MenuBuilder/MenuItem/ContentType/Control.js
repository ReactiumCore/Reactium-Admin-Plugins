import React, { useRef, useState } from 'react';
import { Tabs, Dialog, Button, Icon, Checkbox, Pagination } from 'reactium-ui';
import op from 'object-path';
import uuid from 'uuid/v4';
import _ from 'underscore';
import Reactium, { __, useAsyncEffect } from 'reactium-core/sdk';

const noop = () => {};
const Search = ({ onSearch = noop }) => {
    return (
        <label className='ar-data-table-search pb-xs-8'>
            <input
                type='text'
                className='dialog-search'
                placeholder={__('Search')}
                onChange={onSearch}
            />
            <span className='bg' />
            <span className='ico'>
                <Icon name='Feather.Search' />
            </span>
        </label>
    );
};

const ContentTypeOptions = ({ items, type, onChange, selected = [] }) => {
    return items.map(item => {
        item.type = type;
        const display = op.get(item, 'title', op.get(item, 'slug'));

        return (
            <li key={item.uuid} className={'content-option'}>
                <Checkbox
                    onChange={onChange(item)}
                    checked={Boolean(selected.find(i => i.uuid === item.uuid))}
                    label={display}
                    labelAlign={'right'}
                />
            </li>
        );
    });
};

const SearchTab = ({ type, onAddItems = noop }) => {
    const [term, setTerm] = useState('');
    const updateTerm = useRef(_.throttle(search => setTerm(search), 500))
        .current;
    const [result, setResult] = useState({
        count: 0,
        next: null,
        page: 1,
        pages: 1,
        prev: null,
        results: [],
    });
    const [selected, setSelected] = useState([]);

    const results = op.get(result, 'results', []);

    const searchListener = e => {
        const search = e.currentTarget.value;
        updateTerm(search);
    };

    const checkListener = item => e => {
        if (e.target.checked) {
            setSelected(selected.concat(item));
        } else {
            setSelected(selected.filter(i => i.uuid !== item.uuid));
        }
    };

    useAsyncEffect(
        async isMounted => {
            if (term.length >= 3) {
                const { collection } = type;
                const result = await Reactium.Cloud.run('search', {
                    index: collection,
                    search: term,
                });
                if (isMounted()) {
                    setResult(result);
                    setSelected([]);
                }
            }
        },
        [term],
    );
    return (
        <div className='p-xs-16'>
            <Search onSearch={searchListener} />
            <ul className='content-options'>
                <ContentTypeOptions
                    type={type}
                    items={results}
                    onChange={checkListener}
                    selected={selected}
                />
            </ul>

            <Button
                disabled={selected.length < 1}
                onClick={() => {
                    onAddItems(selected);
                    setSelected([]);
                }}>
                {__('Add')}
            </Button>
        </div>
    );
};

const PaginatedTab = ({ type, onAddItems = noop }) => {
    const [result, setResult] = useState({
        count: 0,
        next: null,
        page: 1,
        pages: 1,
        prev: null,
        results: [],
    });
    const [selected, setSelected] = useState([]);

    const results = op.get(result, 'results', []);
    const page = op.get(result, 'page');
    const pages = op.get(result, 'pages');

    const checkListener = item => e => {
        if (e.target.checked) {
            setSelected(selected.concat(item));
        } else {
            setSelected(selected.filter(i => i.uuid !== item.uuid));
        }
    };

    useAsyncEffect(
        async isMounted => {
            if (page <= pages) {
                const { collection } = type;
                const result = await Reactium.Cloud.run('content-list', {
                    type,
                    page,
                    limit: 10,
                    orderBy: 'updatedAt',
                    direction: 'descending',
                    resolveRelations: true,
                });

                if (isMounted()) {
                    setResult(result);
                    setSelected([]);
                }
            }
        },
        [page],
    );

    const nextPage = () => {
        setResult({
            ...result,
            page: page + 1,
        });
    };

    const prevPage = () => {
        setResult({
            ...result,
            page: page - 1,
        });
    };

    return (
        <div className='p-xs-16'>
            <ul className='content-options'>
                <ContentTypeOptions
                    type={type}
                    items={results}
                    onChange={checkListener}
                    selected={selected}
                />
            </ul>
            {pages > 1 && (
                <div className='col-xs-12 col-sm-6 col-lg-4 pb-xs-20'>
                    <Pagination
                        page={page}
                        pages={pages}
                        onNextClick={nextPage}
                        onPrevClick={prevPage}
                    />
                </div>
            )}

            <Button
                disabled={selected.length < 1}
                onClick={() => {
                    onAddItems(selected);
                    setSelected([]);
                }}>
                {__('Add')}
            </Button>
        </div>
    );
};

const ContentTypeControl = props => {
    const cx = op.get(props, 'cx');
    const itemType = op.get(props, 'itemType');
    const types = op.get(itemType, 'types', []);
    const onAddItems = op.get(props, 'onAddItems', noop);
    const addItems = items => {
        onAddItems(
            items.map(item => ({
                id: uuid(),
                type: 'ContentType',
                item: {
                    icon: op.get(item, 'type.meta.icon', 'Linear.Papers'),
                    title: op.get(item, 'title', op.get(item, 'slug', '')),
                    url: op.get(
                        item,
                        'urls.0.route',
                        `/${op.get(item, 'type.machineName')}/${op.get(
                            item,
                            'slug',
                        )}`,
                    ),
                    context: item,
                },
                depth: 0,
            })),
        );
    };

    const tabs = type => {
        return [
            {
                id: 'all',
                tab: __('View All'),
                content: <PaginatedTab type={type} onAddItems={addItems} />,
            },
            {
                id: 'search',
                tab: __('Search'),
                content: <SearchTab type={type} onAddItems={addItems} />,
            },
        ];
    };

    return (
        <div className={cx('control', 'control-types')}>
            {types.map(type => {
                const uuid = op.get(type, 'uuid');
                const icon = op.get(type, 'meta.icon', 'Linear.Papers');
                const title = op.get(
                    type,
                    'meta.label',
                    op.get(type, 'type', ''),
                );

                return (
                    <Dialog
                        key={uuid}
                        header={{
                            title: (
                                <div className='control-title'>
                                    <Button
                                        className='ar-dialog-header-btn'
                                        color={Button.ENUMS.COLOR.CLEAR}
                                        readOnly
                                        style={{ padding: 0, border: 'none' }}>
                                        <Icon name={icon} />
                                    </Button>
                                    <span>{title}</span>
                                </div>
                            ),
                        }}
                        pref={cx(`control-${title}`)}>
                        <Tabs
                            activeTab={0}
                            collapsible={false}
                            data={tabs(type)}
                            onAddItems={onAddItems}
                        />
                    </Dialog>
                );
            })}
        </div>
    );
};

export default ContentTypeControl;
