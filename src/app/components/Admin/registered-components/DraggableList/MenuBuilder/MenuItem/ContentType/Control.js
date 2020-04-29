import React, { useRef, useState } from 'react';
import {
    Tabs,
    Dialog,
    Button,
    Icon,
    Checkbox,
} from '@atomic-reactor/reactium-ui';
import op from 'object-path';
// import cn from 'classnames';
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

const SearchTab = ({ type, onAdd = noop }) => {
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

    console.log({ term, result });

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
        <div className='p-xs-8'>
            <Search onSearch={searchListener} />
            <ul className='content-options'>
                {results.map(item => {
                    const display = op.get(
                        item,
                        'display_title',
                        op.get(item, 'slug'),
                    );
                    return (
                        <li key={item.uuid} className={'content-option'}>
                            <Checkbox
                                onChange={checkListener(item)}
                                label={display}
                                labelAlign={'right'}
                            />
                        </li>
                    );
                })}
            </ul>
            <Button
                disabled={selected.length < 1}
                onClick={() => onAdd(selected)}>
                {__('Add')}
            </Button>
        </div>
    );
};

const ContentTypeControl = props => {
    const cx = op.get(props, 'cx');
    const itemType = op.get(props, 'itemType');
    const types = op.get(itemType, 'types', []);
    const tabs = type => {
        const title = op.get(type, 'meta.label', op.get(type, 'type', ''));

        return [
            {
                id: 'all',
                tab: __('View All'),
                content: 'All stuff',
            },
            {
                id: 'search',
                tab: __('Search'),
                content: <SearchTab type={type} />,
            },
        ];
    };

    return (
        <div className={cx('control', 'control-types')}>
            {types.map(type => {
                const uuid = op.get(type, 'uuid');
                const title = op.get(
                    type,
                    'meta.label',
                    op.get(type, 'type', ''),
                );

                // activeTab: 0,
                // data: [],
                // disabled: false,
                // id: `ar-tab-${uuid()}`,
                // namespace: 'ar-tab',
                // onChange: noop,
                return (
                    <Dialog
                        key={uuid}
                        header={{ title }}
                        pref={cx(`control-${title}`)}>
                        <Tabs
                            activeTab={1}
                            collapsible={false}
                            data={tabs(type)}
                        />
                    </Dialog>
                );
            })}
        </div>
    );
};

export default ContentTypeControl;
