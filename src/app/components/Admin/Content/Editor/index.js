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
    useHandle,
    useRegisterHandle,
    useSelect,
    Zone,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ContentEditor
 * -----------------------------------------------------------------------------
 */

let ContentEditor = ({ className, namespace, zonePrefix, ...props }, ref) => {
    const { type, group } = useRouteParams();

    const [contentType, setContentType] = useState({ regions: [] });
    const [types, setTypes] = useState([]);
    const [state, setNewState] = useDerivedState({
        title: ENUMS.TEXT.EDITOR,
    });

    const cx = cls => _.compact([namespace, cls]).join('-');

    const cname = cn({ [cx()]: true, [className]: !!className });

    const getTypes = refresh => Reactium.ContentType.types(refresh);

    const properCase = useProperCase();

    const regions = () => {
        const _regions = op.get(contentType, 'regions', {});
        const content = _.without(Object.keys(_regions), 'sidebar').map(
            key => _regions[key],
        );
        const sidebar = _.compact([op.get(_regions, 'sidebar')]);

        return [content, sidebar];
    };

    const setState = newState => {
        setNewState({ ...state, ...newState });
        return () => {};
    };

    const _handle = () => ({
        contentType,
        regions,
        state,
        setState,
        types,
        cx,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    // get content types
    useAsyncEffect(async () => {
        const results = await getTypes();
        setTypes(results);
        return () => {};
    });

    // set content type
    useEffect(() => {
        if (types.length < 1 || !type) return;
        const t = _.findWhere(types, { type });
        if (!t) return;
        setContentType(t);
    }, [type, types]);

    // update title
    useEffect(() => {
        if (!type) return;
        const newTitle = properCase(`${type} ${ENUMS.TEXT.EDITOR}`);
        if (op.get(state, 'title') === newTitle) return;
        setState({ title: newTitle });
    }, [type]);

    useImperativeHandle(ref, () => handle);

    useRegisterHandle('AdminContentEditor', () => handle);

    const render = () => {
        const { title } = state;
        const [contentRegions, sidebarRegions] = regions();

        return (
            <>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <div className={cname}>
                    {contentRegions.length > 0 && (
                        <div className={cx('editor')}>
                            {contentRegions.map(({ slug }) => (
                                <div className={cx(slug)} key={cx(slug)}>
                                    Render {slug} elements here
                                    <Zone zone={cx(slug)} editor={handle} />
                                </div>
                            ))}
                        </div>
                    )}
                    {sidebarRegions.length > 0 && (
                        <div className={cx('meta')}>
                            {sidebarRegions.map(({ slug }) => (
                                <div className={cx(slug)} key={cx(slug)}>
                                    Render {slug} elements here
                                    <Zone zone={cx(slug)} editor={handle} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </>
        );
    };

    return render();
};

ContentEditor = forwardRef(ContentEditor);

ContentEditor.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    zonePrefix: PropTypes.string,
};

ContentEditor.defaultProps = {
    namespace: 'admin-content',
};

export default ContentEditor;
