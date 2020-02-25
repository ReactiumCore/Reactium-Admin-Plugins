import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import slugify from 'slugify';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import useProperCase from '../_utils/useProperCase';
import useRouteParams from '../_utils/useRouteParams';
import { EventForm } from '@atomic-reactor/reactium-ui';

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
    useHookComponent,
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
    const [updated, update] = useState();
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
        type,
        types,
        cx,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    // get content types
    useAsyncEffect(
        async mounted => {
            const results = await getTypes(true);
            setTypes(results);
            return Reactium.Cache.subscribe('content-types', async ({ op }) => {
                if (['set', 'del'].includes(op) && mounted() === true)
                    update(Date.now());
            });
        },
        [updated],
    );

    // set content type
    useEffect(() => {
        if (!type) return;
        const t = _.findWhere(types, { type });
        if (!t) return;
        setContentType(t);
    });

    // update title
    useEffect(() => {
        if (!type) return;
        const newTitle = properCase(`${type} ${ENUMS.TEXT.EDITOR}`);
        if (op.get(state, 'title') === newTitle) return;
        setState({ title: newTitle });
    }, [type]);

    useEffect(() => {
        setHandle(_handle());
    }, [contentType, state, types]);

    useImperativeHandle(ref, () => handle);

    useRegisterHandle('AdminContentEditor', () => handle);

    const render = () => {
        if (!type) return null;

        const { title } = state;
        const [contentRegions, sidebarRegions] = regions();

        return (
            <>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <EventForm className={cname}>
                    {contentRegions.length > 0 && (
                        <div className={cx('editor')}>
                            <div className={cx('regions')}>
                                {contentRegions.map(item => (
                                    <Region
                                        key={cx(item.slug)}
                                        editor={_handle()}
                                        {...item}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {sidebarRegions.length > 0 && (
                        <div className={cx('meta')}>
                            <div className={cx('regions')}>
                                {sidebarRegions.map(item => (
                                    <Region
                                        key={cx(item.slug)}
                                        editor={_handle()}
                                        {...item}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </EventForm>
            </>
        );
    };

    return render();
};

const Region = ({ editor, ...props }) => {
    const { contentType, cx } = editor;
    const { id, slug } = props;
    const className = `${cx('editor-region')} ${cx(`editor-region-${slug}`)}`;
    const fields = _.where(Object.values(contentType.fields), { region: id });

    return (
        <div className={className}>
            {fields.map(item => (
                <Element
                    key={item.fieldId}
                    editor={editor}
                    region={props}
                    {...item}
                />
            ))}
            <Zone zone={editor.cx(slug)} editor={editor} />
        </div>
    );
};

const Element = ({ editor, region, ...props }) => {
    const { cx } = editor;
    let { fieldId, fieldName, fieldType } = props;
    const cid = op.get(Reactium.ContentType.FieldType.list, [
        fieldType,
        'component',
    ]);

    if (!cid) return null;

    const Component = useHookComponent(`${cid}-editor`);

    const [isComponent, setIsComponent] = useState(!!Component);

    useEffect(() => {
        setIsComponent(!!Component);
    }, [isComponent]);

    if (!isComponent) return null;

    const title = fieldName;
    fieldName = slugify(String(fieldName).toLowerCase());
    const className = [cx('element'), cx(`element-${fieldName}`)];
    const pref = ['admin.dialog.editor', editor.type, region, fieldName];

    return (
        <div className={className.join(' ')}>
            <Component
                {...props}
                editor={editor}
                region={region}
                pref={pref.join('.')}
                fieldName={fieldName}
                title={title}
            />
        </div>
    );
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
