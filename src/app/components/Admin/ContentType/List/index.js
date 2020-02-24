import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import useProperCase from 'components/Admin/Content/_utils/useProperCase';
import useRouteParams from 'components/Admin/Content/_utils/useRouteParams';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import Reactium, {
    __,
    useDerivedState,
    useEventHandle,
    useHandle,
    useRegisterHandle,
    useSelect,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ContentList
 * -----------------------------------------------------------------------------
 */
let ContentTypeList = ({ className, namespace, ...props }, ref) => {
    const { type, group } = useRouteParams();

    const search = useSelect(state => op.get(state, 'SearchBar.value'));

    const SearchBar = useHandle('SearchBar');

    const cx = cls => _.compact([namespace, cls]).join('-');

    const cname = cn({ [cx()]: true, [className]: !!className });

    const properCase = useProperCase();

    const [state, setNewState] = useDerivedState({
        title: ENUMS.TEXT.TITLE,
    });

    const setState = newState => {
        setNewState({ ...state, ...newState });
        return () => {};
    };

    const _handle = () => ({
        state,
        setState,
        cx,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    useRegisterHandle('AdminContentTypeList', () => handle);

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

ContentTypeList = forwardRef(ContentTypeList);

ContentTypeList.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

ContentTypeList.defaultProps = {
    namespace: 'admin-content-type-list',
};

export default ContentTypeList;
