import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import ContentEvent from '../_utils/ContentEvent';
import useProperCase from 'components/Admin/Tools/useProperCase';
import useRouteParams from 'components/Admin/Tools/useRouteParams';

import { Button, Icon, Spinner } from '@atomic-reactor/reactium-ui';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    // useDerivedState,
    useEventHandle,
    useFulfilledObject,
    useHandle,
    useHookComponent,
    useRegisterHandle,
    useSelect,
    Zone,
} from 'reactium-core/sdk';

import { useDerivedState } from './useDerivedStateAlt';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ContentList
 * -----------------------------------------------------------------------------
 */
let ContentList = ({ className, id, namespace, ...props }, ref) => {
    const initialStatus = useRef(true);

    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const ConfirmBox = useHookComponent('ConfirmBox');

    const ListItem = useHookComponent(`${id}Item`);

    const containerRef = useRef();

    const { group, page, path, type } = useRouteParams([
        'group',
        'page',
        'path',
        'type',
    ]);

    const search = useSelect(state => op.get(state, 'SearchBar.value'));

    const SearchBar = useHandle('SearchBar');

    const cx = Reactium.Utils.cxFactory(namespace);

    const cname = cn(cx(), { [className]: !!className });

    const deleteContent = objectId => {
        const { content, contentType } = state;

        const index = _.findIndex(content, { objectId });
        const item = content[index];

        if (!item) return;

        const { status } = item;

        const confirmed = async () => {
            // instantly remove from content
            content.splice(index, 1);
            setState({ content });

            // trash the item.
            if (status !== 'TRASH') {
                await Reactium.Content.trash({ type: contentType, objectId });
            } else {
                await Reactium.Content.delete({ type: contentType, objectId });
            }

            // fetch the current page again.
            await getContent();

            Modal.hide();
        };

        const Message = () => (
            <>
                {status !== 'PUBLISHED' && (
                    <>
                        <p>{__('Are you sure you want to delete')}</p>
                        <strong>{item.title}?</strong>
                    </>
                )}
                {status === 'PUBLISHED' && (
                    <>
                        <p>
                            <strong>{item.title}</strong>
                            <br />
                            {__('is a published item')}
                        </p>
                        <strong>{__('Are you sure?')}</strong>
                    </>
                )}
            </>
        );

        Modal.show(
            <ConfirmBox
                title={__('Confirm Delete')}
                message={<Message />}
                onConfirm={confirmed}
                onCancel={Modal.hide}
            />,
        );
    };

    const dispatch = async (eventType, event, callback) => {
        if (unMounted()) return;

        // dispatch exact eventType
        const evt = new ContentEvent(eventType, event);

        handle.dispatchEvent(evt);
    };

    const getColumns = () => {
        if (!type) return [];

        return Reactium.Content.ListColumn.list
            .filter(col => op.get(col, 'types', [type]).includes(type))
            .map(col => {
                const { className, id } = col;

                const newClassName = !className
                    ? cn(
                          cx(`column-${id}-${type}`),
                          cx(`column-${id}`),
                          cx('column'),
                      )
                    : String(className)
                          .replace(/\%prefix/gi, cx())
                          .replace(/\%column/gi, id)
                          .replace(/\%type/gi, type);

                op.set(col, 'className', newClassName);
                op.set(col, 'zones', [cx(id), cx(`${id}-${type}`)]);

                return col;
            });
    };

    const getContent = async (params = {}) => {
        let { refresh, page: pg, status } = params;
        pg = pg || page;

        state.busy = true;

        const contentType = await Reactium.ContentType.retrieve({
            machineName: type,
        });

        let { results: content, ...pagination } = await Reactium.Content.list({
            limit: 20,
            optimize: false,
            page: pg,
            refresh,
            status,
            type: contentType,
        });

        if (pg > pagination.pages) {
            state.busy = false;
            pg -= 1;
            pg = Math.max(1, pg);
            pg = Math.min(pg, pagination.pages);
            const route = `/admin/content/${group}/page/${pg}`;
            Reactium.Routing.history.push(route);
            return;
        }

        return { busy: false, content, contentType, pagination };
    };

    const isBusy = () => Boolean(state.busy);

    const isMounted = () => containerRef.current;
    const unMounted = () => !containerRef.current;

    const properCase = useProperCase();

    const [state, setNewState] = useDerivedState({
        busy: false,
        columns: undefined,
        content: undefined,
        contentType: undefined,
        group: undefined,
        page: 1,
        pagination: undefined,
        path,
        status: null,
        title: ENUMS.TEXT.LIST,
        type: undefined,
    });

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    const _handle = () => ({
        cx,
        deleteContent,
        group,
        id,
        isBusy,
        isMounted,
        page,
        state,
        setState,
        type,
        unMounted,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);

    useRegisterHandle(id, () => handle, [handle]);

    // get content
    useAsyncEffect(
        async mounted => {
            if (!type) return;
            const results = await getContent({
                refresh: true,
                status: op.get(state, 'status'),
            });
            if (mounted()) {
                setState(results);
                _.defer(() => dispatch('load', { ...state, ...results }));
            }
            return () => {};
        },
        [type, page],
    );

    // filter by status
    useAsyncEffect(
        async mounted => {
            if (initialStatus.current === true) {
                initialStatus.current = false;
                return;
            }

            const results = await getContent({
                page: 1,
                refresh: true,
                status: op.get(state, 'status'),
            });

            if (mounted()) {
                setState(results);
                _.defer(() => {
                    dispatch('load', { ...state, ...results });
                });
            }
            return () => {};
        },
        [op.get(state, 'status')],
    );

    // update handle
    useEffect(() => {
        const newHandle = _handle();
        //if (_.isEqual(handle, newHandle)) return;
        setHandle(newHandle);
    }, [state, page, op.get(state, 'page'), op.get(state, 'pagination')]);

    useEffect(() => {
        if (page === op.get(state, 'page')) return;
        setState({ page });
    }, [page]);

    // set title
    useEffect(() => {
        if (!group) return;
        const newTitle = properCase(group);
        if (op.get(state, 'title') === newTitle) return;
        setState({ title: newTitle });
    }, [group]);

    // Show SearchBar
    try {
        SearchBar.setState({ visible: true });
    } catch (err) {}

    // set state -> group, page, type
    useEffect(() => {
        const newState = {};

        if (group !== op.get(state, 'group')) newState['group'] = group;
        if (page !== op.get(state, 'page')) newState['page'] = page;

        if (type !== op.get(state, 'type')) {
            newState['columns'] = getColumns();
            newState['type'] = type;
        }

        if (Object.keys(newState).length > 0) setState(newState);
    }, [group, page, type]);

    const render = () => {
        const { content, group, page, status, type } = state;
        let count = Number(op.get(state, 'pagination.count', 0));
        count = count === 0 ? __('No') : count;

        return (
            <div ref={containerRef} className={cname}>
                <div className={cx('heading')}>
                    {!isBusy() && (
                        <h2>
                            <span className={cx('heading-count')}>{count}</span>
                            {status && (
                                <span className='blue mr-xs-8 lowercase hide-xs-only'>
                                    {status && status === 'TRASH'
                                        ? 'TRASHED'
                                        : status}
                                </span>
                            )}
                            {count === 1 ? type : group}
                        </h2>
                    )}
                    <div className={cx('toolbar')}>
                        <Zone list={handle} zone={cx('toolbar')} />
                    </div>
                </div>

                <Zone list={handle} zone={cx('top')} />

                {content &&
                    content.map(item => (
                        <ListItem key={item.objectId} list={handle} {...item} />
                    ))}

                <Zone list={handle} zone={cx('bottom')} />
                {isBusy() && <Spinner className={cx('spinner')} />}
            </div>
        );
    };

    return render();
};

ContentList = forwardRef(ContentList);

ContentList.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    namespace: PropTypes.string,
};

ContentList.defaultProps = {
    id: 'AdminContentList',
    namespace: 'admin-content-list',
};

export default ContentList;
