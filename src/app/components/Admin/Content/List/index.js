import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import ContentEvent from '../_utils/ContentEvent';
import useProperCase from '../_utils/useProperCase';
import useRouteParams from '../_utils/useRouteParams';

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
    useDerivedState,
    useEventHandle,
    useFulfilledObject,
    useHandle,
    useHookComponent,
    useRegisterHandle,
    useSelect,
    Zone,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ContentList
 * -----------------------------------------------------------------------------
 */
let ContentList = ({ className, id, namespace, ...props }, ref) => {
    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const ConfirmBox = useHookComponent('ConfirmBox');

    const ListItem = useHookComponent(`${id}Item`);

    const containerRef = useRef();

    const loadingStatus = useRef(undefined);

    const { page, group, type } = useRouteParams(['page', 'group', 'type']);

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
            await Reactium.Content.trash({ type: contentType, objectId });

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

    const getContent = async refresh => {
        loadingStatus.current = Date.now();

        const contentType = await Reactium.ContentType.retrieve({
            machineName: type,
        });

        let { results: content, ...pagination } = await Reactium.Content.list({
            page,
            refresh,
            limit: 20,
            optimize: false,
            type: contentType,
        });

        loadingStatus.current = undefined;

        if (content.length < 1 && page > 1) {
            const pg = Math.min(page - 1, pagination.pages);
            const route = `/admin/content/${group}/page/${pg}`;
            //setState({ page: pg });
            Reactium.Routing.history.push(route);
            return;
        }

        return { content, contentType, pagination };
    };

    const isBusy = () => !ready || loadingStatus.current;
    const isMounted = () => containerRef.current;
    const unMounted = () => !containerRef.current;

    const properCase = useProperCase();

    const [state, setNewState] = useDerivedState({
        columns: undefined,
        content: undefined,
        contentType: undefined,
        group: undefined,
        page: 1,
        pagination: undefined,
        title: ENUMS.TEXT.LIST,
        type: undefined,
    });

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    const [ready] = useFulfilledObject(state, [
        'columns',
        'content',
        'contentType',
        'group',
        'type',
    ]);

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
            const results = await getContent(true);
            if (mounted()) {
                setState(results);
                _.defer(() => dispatch('load', { ...state, ...results }));
            }
            return () => {};
        },
        [type, page],
    );

    // update handle
    useEffect(() => {
        const newHandle = _handle();
        if (_.isEqual(handle, newHandle)) return;
        setHandle(newHandle);
    }, [state, page, op.get(state, 'page')]);

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
        // if (ready) console.log(handle);
        const { content, group, page } = state;

        return (
            <div ref={containerRef} className={cname}>
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
