import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import useProperCase from '../_utils/useProperCase';
import useRouteParams from '../_utils/useRouteParams';

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

    const cx = cls => _.compact([namespace, cls]).join('-');

    const cname = cn({ [cx()]: true, [className]: !!className });

    const getContent = () => {};

    const properCase = useProperCase();

    const [state, setState] = useDerivedState({
        content: undefined,
        contentType: undefined,
        title: ENUMS.TEXT.LIST,
    });

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

    // Show SearchBar
    useEffect(() => {
        if (!SearchBar) return;
        const { visible } = SearchBar.state;
        if (visible !== true) SearchBar.setState({ visible: true });
    }, [SearchBar]);

    const render = () => {
        return (
            <div className={cname}>
                <div className={cx('content')}>LIST</div>
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
    namespace: 'ar-content-list',
};

export default ContentList;
