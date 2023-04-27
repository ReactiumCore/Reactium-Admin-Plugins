import lunr from 'lunr';
import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Scrollbars } from '@atomic-reactor/react-custom-scrollbars';

import Row from './Row';
import Rows from './Rows';
import Column from './Column';
import Footer from './Footer';
import Header from './Header';
import Heading from './Heading';
import Headings from './Headings';
import SearchBar from './SearchBar';

import ENUMS from './enums';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

import { useDerivedState } from '@atomic-reactor/reactium-sdk-core';

const noop = () => {};

const applyReorderProp = reorderable =>
    reorderable !== true
        ? {}
        : {
              rowsPerPage: -1,
              sortable: false,
              page: 1,
          };

/**
 * -----------------------------------------------------------------------------
 * Hook Component: DataTable
 * -----------------------------------------------------------------------------
 */

let DataTable = (
    {
        footer,
        header,
        onChange,
        onSelect,
        onSort,
        onUnSelect,
        reorderable,
        ...props
    },
    ref,
) => {
    // Refs
    const containerRef = useRef();
    const scrollBarRef = useRef();
    // State
    const [state, setState] = useDerivedState({
        ...props,
        reorderable,
        ...applyReorderProp(reorderable),
        updated: Date.now(),
    });

    const defaultFilter = (item, i, data, search) => {
        const { ids } = search;
        const { id } = item;
        const valid = ids.includes(id);
        return valid;
    };

    const getData = search => {
        let output = [];

        const {
            data = [],
            filter = defaultFilter,
            sort,
            sortable,
            sortBy,
        } = state;

        search = search || op.get(state, 'search');

        if (search) {
            // Data types to index
            const types = ['string', 'number'];

            // Get all keys
            const keys = _.uniq(_.flatten(data.map(item => Object.keys(item))));

            // Lunr search index
            const idx = lunr(function() {
                data.forEach((item, i) => {
                    if (!op.has(item, 'id')) {
                        item['id'] = i;
                    }

                    this.field('id');

                    keys.forEach(key => {
                        const type = typeof item[key];

                        if (types.includes(type)) {
                            this.field(key);
                        }
                    });

                    this.add(item);
                });
            });

            const rankings = idx.search(search);
            const ranker = op.get(_.max(rankings, 'score'), 'score') || 0;
            const results = rankings
                .filter(item => item.score >= ranker)
                .map(item => {
                    const id = isNaN(item.ref) ? item.ref : Number(item.ref);
                    return data[id] || _.findWhere(data, { id });
                });
            const ids = _.pluck(results, 'id').map(id => {
                return isNaN(id) ? id : Number(id);
            });

            output = Array.from(
                data.filter((item, i, arr) =>
                    filter(item, i, arr, { results, ids }),
                ),
            );
        } else {
            output = Array.from(data);
        }

        // sort
        if (sortable === true) {
            output = _.sortBy(output, sortBy);

            if (sort === ENUMS.SORT.DESC) {
                output.reverse();
            }
        }

        return output;
    };

    const getPages = () => {
        const { rowsPerPage = -1 } = state;

        if (rowsPerPage < 1) {
            return 1;
        }

        const temp = getData();

        const limit = Math.max(0, rowsPerPage);
        return Math.ceil(Math.max(0, temp.length / limit));
    };

    const getSelection = () => {
        const { page, rowsPerPage } = state;
        const limit = Math.max(0, rowsPerPage);
        const idx = page > 1 ? page * limit - limit : 0;
        const temp = getData();
        const selection = limit < 1 ? temp : temp.splice(idx, limit);

        return selection;
    };

    const nextPage = () => {
        const { page: currPage = 1 } = state;
        const page = Math.min(currPage + 1, getPages());

        if (currPage !== page) {
            setState({ page });
        }
    };

    const prevPage = () => {
        const { page: currPage = 1 } = state;
        const page = Math.max(1, currPage - 1);

        if (currPage !== page) {
            setState({ page });
        }
    };

    const applyReorder = e => {
        const { data, deleteOnDropOut, onDrop, onDropOut } = state;

        const startIndex = op.get(e, 'source.index');
        const endIndex = op.get(e, 'destination.index');
        const list = Array.from(data);
        const [item] = list.splice(startIndex, 1);

        if (typeof endIndex === 'undefined') {
            if (deleteOnDropOut === true) {
                setState({ data: list });
            }

            onDropOut({ type: 'dropout', startIndex, item: item, data });
        } else {
            list.splice(endIndex, 0, item);
            setState({ data: list });
            onDrop({
                type: 'drop',
                startIndex,
                endIndex,
                item: item,
                data: list,
            });
        }
    };

    const applySort = ({ sort, sortBy }) => {
        setState({
            sort,
            sortBy,
        });

        onSort({ e: 'sort', sort, sortBy });
    };

    const toggleItem = ({ checked, index, silent = false }) => {
        const data = getData();
        const { multiselect } = state;
        const item = data[index];

        if (item) {
            if (multiselect !== true) {
                data.forEach((row, i) => {
                    const { selected } = row;
                    if (i !== index && selected === true) {
                        row.selected = false;
                        if (silent !== true) {
                            onUnSelect({
                                event: ENUMS.EVENT.UNSELECT,
                                item: row,
                                index: i,
                            });
                        }
                    }
                });
            }

            item.selected = checked;

            if (silent !== true) {
                if (checked === true) {
                    onSelect({ event: ENUMS.EVENT.SELECT, item, index });
                } else {
                    onUnSelect({ event: ENUMS.EVENT.UNSELECT, item, index });
                }
            }
        }
    };

    const onToggle = e => {
        let { index = -1 } = e.target.dataset;
        index = Number(index);

        const { checked } = e.target;
        toggleItem({ checked, index });
        setState({ updated: Date.now() });
    };

    const onToggleAll = e => {
        const data = getData();
        const { checked } = e.target;

        data.forEach((row, index) => toggleItem({ checked, index }));
        setState({ updated: Date.now() });
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        container: containerRef.current,
        data: getData(),
        nextPage,
        page: state.page,
        pages: getPages(),
        prevPage,
        props,
        search: state.search,
        selection: getSelection(),
        setState,
        state: state,
    }));

    // Side Effects
    useEffect(() => {
        const { page } = state;

        if (page > getPages()) {
            setState({ page: 1 });
        }

        onChange({
            type: ENUMS.EVENT.CHANGE,
            page: state.page,
            pages: getPages(),
            data: getData(),
        });
    }, [op.get(state, 'data'), op.get(state, 'page'), op.get(props, 'data')]);

    useEffect(() => {
        setState({ data: op.get(props, 'data') });
    }, [op.get(props, 'data')]);

    useEffect(() => {
        setState({ columns: op.get(props, 'columns') });
    }, [op.get(props, 'columns')]);

    const setContentRef = elm => {
        const { height, scrollable } = state;
        if (elm && !scrollable) {
            if (height !== elm.offsetHeight) {
                setState({ height: elm.offsetHeight });
            }
        }
    };

    const render = () => {
        const {
            children,
            className,
            height,
            id,
            namespace,
            scrollable,
            selectable,
            style,
        } = state;

        const data = getData();

        const content = (
            <div ref={elm => setContentRef(elm)}>
                {children}
                <Rows
                    {...state}
                    onReorder={applyReorder}
                    data={data}
                    selection={getSelection()}
                    state={state}
                    onToggle={onToggle}
                />
            </div>
        );

        return (
            <div
                id={`data-table-${id}`}
                ref={containerRef}
                style={style}
                className={cn({
                    [className]: !!className,
                    [namespace]: !!namespace,
                    selectable,
                })}>
                <Header namespace={namespace}>{header}</Header>
                <Headings
                    data={data}
                    {...state}
                    onClick={applySort}
                    onToggleAll={onToggleAll}
                />
                {scrollable ? (
                    <Scrollbars
                        autoHeight
                        autoHeightMin={height}
                        ref={scrollBarRef}
                        style={{ width: '100%' }}>
                        {content}
                    </Scrollbars>
                ) : (
                    <div style={{ width: '100%' }}>{content}</div>
                )}
                <Footer namespace={namespace}>{footer}</Footer>
            </div>
        );
    };

    return render();
};

DataTable = forwardRef(DataTable);

DataTable.ENUMS = ENUMS;

DataTable.propTypes = {
    className: PropTypes.string,
    columns: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    deleteOnDropOut: PropTypes.bool,
    filter: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    footer: PropTypes.node,
    header: PropTypes.node,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    multiselect: PropTypes.bool,
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    onDrop: PropTypes.func,
    onDropOut: PropTypes.func,
    onSelect: PropTypes.func,
    onSort: PropTypes.func,
    onUnSelect: PropTypes.func,
    page: PropTypes.number,
    reorderable: PropTypes.bool,
    rowsPerPage: PropTypes.number,
    scrollable: PropTypes.bool,
    selectable: PropTypes.bool,
    sort: PropTypes.oneOf(_.uniq(Object.values(ENUMS.SORT))),
    sortable: PropTypes.bool,
    sortBy: PropTypes.string,
    style: PropTypes.object,
};

DataTable.defaultProps = {
    data: [],
    deleteOnDropOut: false,
    id: uuid(),
    multiselect: false,
    namespace: 'ar-data-table',
    onChange: noop,
    onDrop: noop,
    onDropOut: noop,
    onSelect: noop,
    onSort: noop,
    onUnSelect: noop,
    page: 1,
    reorderable: false,
    rowsPerPage: -1,
    scrollable: false,
    selection: [],
    selectable: false,
    sort: ENUMS.SORT.ASC,
    sortable: false,
    style: {},
};

export { DataTable, DataTable as default, Row, Column, Heading, SearchBar };
