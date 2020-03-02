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
let ContentList = ({ className, namespace, ...props }, ref) => {
    const { page, group, type } = useRouteParams(['page', 'group', 'type']);

    const search = useSelect(state => op.get(state, 'SearchBar.value'));

    const SearchBar = useHandle('SearchBar');

    const cx = Reactium.Utils.cxFactory(namespace);

    const cname = cn(cx(), { [className]: !!className });

    const getContent = async refresh => {
        const contentType = await Reactium.ContentType.retrieve({
            machineName: type,
        });

        const { results: content, ...pagination } = await Reactium.Content.list(
            {
                refresh,
                type: contentType,
            },
        );

        return { content, contentType, pagination };
    };

    const properCase = useProperCase();

    const [state, setState] = useDerivedState({
        content: undefined,
        contentType: undefined,
        pagination: undefined,
        title: ENUMS.TEXT.LIST,
        type,
    });

    let [ready] = useFulfilledObject(state, ['content', 'contentType', 'type']);

    const _handle = () => ({
        state,
        setState,
        cx,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    useRegisterHandle('AdminContentList', () => handle);

    useEffect(() => {
        if (!group) return;
        const newTitle = properCase(group);
        if (op.get(state, 'title') === newTitle) return;
        setState({ title: newTitle });
    }, [group]);

    useAsyncEffect(
        async mounted => {
            if (!type) return;
            const results = await getContent(true);
            if (mounted()) setState(results);
            return () => {};
        },
        [type],
    );

    // Show SearchBar
    useEffect(() => {
        if (!SearchBar) return;
        const { visible } = SearchBar.state;
        if (visible !== true) SearchBar.setState({ visible: true });
    }, [SearchBar]);

    useEffect(() => {
        if (type !== op.get(state, 'type')) {
            ready = false;
            setState({ type });
        }
    }, [type]);

    const render = () => {
        if (ready) {
            console.log('Content', ready, state);
        }

        return (
            <div className={cname}>
                <div className={cx('content')}>LIST</div>
                {!ready && <Spinner className={cx('spinner')} />}
            </div>
        );
    };

    return render();
};

ContentList = forwardRef(ContentList);

ContentList.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

ContentList.defaultProps = {
    namespace: 'admin-content-list',
};

export default ContentList;
