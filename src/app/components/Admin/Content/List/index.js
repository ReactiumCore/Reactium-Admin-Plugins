import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

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

    const loadingStatus = useRef();

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
            Modal.hide();
            // instantly remove from content
            content.splice(index, 1);
            setState({ content });

            // remove at server
            await Reactium.Content.delete({ type: contentType, objectId });

            // fetch the current page again.
            getContent();
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
        if (loadingStatus.current) return;

        const contentType = await Reactium.ContentType.retrieve({
            machineName: type,
        });

        const { results: content, ...pagination } = await Reactium.Content.list(
            {
                page,
                refresh,
                type: contentType,
            },
        );

        loadingStatus.current = undefined;

        if (content.length < 1 && page > 1) {
            const pg = Math.min(page - 1, pagination.pages);
            const route = `/admin/content/${group}/page/${pg}`;
            setState({ page: pg, content: undefined });
            Reactium.Routing.history.replace(route);
        }

        return { content, contentType, pagination };
    };

    const isBusy = () => !ready || loadingStatus.current;
    const isMounted = () => containerRef.current;
    const unMounted = () => !containerRef.current;

    const properCase = useProperCase();

    const [state, setState] = useDerivedState({
        columns: undefined,
        content: undefined,
        contentType: undefined,
        group: undefined,
        page: 1,
        pagination: undefined,
        title: ENUMS.TEXT.LIST,
        type: undefined,
    });

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

    useRegisterHandle(`${id}List`, () => handle, [handle]);

    // get content
    useAsyncEffect(
        async mounted => {
            if (!type) return;
            const results = await getContent(true);
            if (mounted()) setState(results);
            return () => {};
        },
        [type, page],
    );

    useEffect(() => {
        const newHandle = _handle();
        if (_.isEqual(handle, newHandle)) return;
        setHandle(newHandle);
    }, [state]);

    // update handle
    useEffect(() => {
        const newHandle = _handle();
        if (_.isEqual(handle, newHandle)) return;
        setHandle(newHandle);
    }, [group, page, type]);

    // set title
    useEffect(() => {
        if (!group) return;
        const newTitle = properCase(group);
        if (op.get(state, 'title') === newTitle) return;
        setState({ title: newTitle });
    }, [group]);

    // Show SearchBar
    useEffect(() => {
        if (!SearchBar) return;
        const { visible } = SearchBar.state;
        if (visible !== true) SearchBar.setState({ visible: true });
    }, [SearchBar]);

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
        if (ready) console.log(state);
        const { content, group, page } = state;

        return (
            <div ref={containerRef} className={cname}>
                {content &&
                    content.map(item => (
                        <ListItem key={item.objectId} list={handle} {...item} />
                    ))}
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
