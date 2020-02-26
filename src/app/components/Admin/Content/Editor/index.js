import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import Region from './Region';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import useProperCase from '../_utils/useProperCase';
import useRouteParams from '../_utils/useRouteParams';
import { slugify } from 'components/Admin/ContentType';
// import { EventForm } from '@atomic-reactor/reactium-ui';
import EventForm from 'components/EventForm';

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
 * Functional Component: ContentEditor
 * -----------------------------------------------------------------------------
 */

let ContentEditor = ({ className, namespace, ...props }, ref) => {
    const formRef = useRef();

    const tools = useHandle('AdminTools');

    const Toast = op.get(tools, 'Toast');

    const { path, type, slug } = useRouteParams(['type', 'slug']);

    const [contentType, setContentType] = useState();
    const [fieldTypes] = useState(Reactium.ContentType.FieldType.list);
    const [status, setStatus] = useState('pending');
    const [state, setState] = useDerivedState({ title: ENUMS.TEXT.EDITOR });
    const [types, setTypes] = useState();
    const [updated, update] = useState();
    const [value, setValue] = useState();

    const cx = cls => _.compact([namespace, cls]).join('-');

    const cname = cn({ [cx()]: true, [className]: !!className });

    const getContent = () => {
        return Promise.resolve({ test: 'fubar', blah: 'hahaha' });
    };

    const getContentType = () => _.findWhere(types, { type });

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

    const submit = () => formRef.current.submit();

    const _onError = e => {};

    const _onSubmit = e =>
        new Promise((resolve, reject) => {
            const { value } = e;
            op.set(value, 'slug', 'testing-1-2-3');
            op.set(value, 'type', contentType);
            op.set(value, 'permission', { permission: 'read', type: 'public' });

            // setTimeout(() => {
            //     try {
            //         _onSuccess(null, value, resolve);
            //     }
            //     catch (err) {
            //         _onFail(e, err, reject);
            //     }
            // }, 2000);

            Reactium.Content.save(value)
                .then(async result => {
                    if (!formRef.current) return;
                    await _onSuccess(e, result, resolve);
                })
                .catch(async error => {
                    if (!formRef.current) return;
                    await _onFail(e, error, reject);
                });
        });

    const _onSuccess = (e, result, next) => {
        console.log('success!', result);

        const message = String(ENUMS.TEXT.SAVED).replace('%type', type);

        Toast.show({
            icon: 'Feather.Check',
            message,
            type: Toast.TYPE.INFO,
        });

        // slow down bro!
        setTimeout(() => next(), 500);
    };

    const _onFail = (e, error, next) => {
        console.log('error:', error);

        const message = String(ENUMS.TEXT.SAVE_ERROR).replace('%type', type);

        Toast.show({
            icon: 'Feather.AlertOctagon',
            message,
            type: Toast.TYPE.ERROR,
        });

        // what's the big hurry eh?
        setTimeout(() => next(), 500);
    };

    const _onValidate = e => {
        return e;
    };

    // Handle
    const _handle = () => ({
        EventForm: formRef.current,
        contentType,
        cx,
        fieldTypes,
        regions,
        state,
        setState,
        setValue,
        submit,
        type,
        types,
        value,
    });

    const [handle, setHandle] = useEventHandle(_handle());
    useImperativeHandle(ref, () => handle);
    useRegisterHandle('AdminContentEditor', () => handle, [handle]);

    // get content types
    useAsyncEffect(
        async mounted => {
            if (!type) return;
            const results = await getTypes(true);
            if (mounted()) setTypes(results);
            return () => {};
        },
        [type],
    );

    // get fullfilled handle
    const [obj, ready, count] = useFulfilledObject(handle, [
        'contentType',
        'type',
        'types',
    ]);

    // get content record
    useAsyncEffect(
        async mounted => {
            if (!contentType || !slug || !type) return () => {};

            // if (slug === 'new' && mounted() === true) {
            //     setValue({});
            //     return () => {};
            // }

            const results = await getContent();
            if (mounted()) setValue(results);
            return () => {};
        },
        [contentType, slug, type],
    );

    // set content type
    useEffect(() => {
        if (!type) return;
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

    // update handle
    useEffect(() => {
        const newHandle = _handle();
        const equal = _.isEqual(newHandle, handle);
        if (equal === true) return;
        setHandle(newHandle);
    });

    const render = () => {
        if (ready !== true) return null;

        const { title } = state;
        const [contentRegions, sidebarRegions] = regions();

        return (
            <>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <EventForm
                    className={cname}
                    ref={formRef}
                    onError={_onError}
                    onSubmit={_onSubmit}
                    validator={_onValidate}
                    value={value}>
                    {contentRegions.length > 0 && (
                        <div className={cx('editor')}>
                            <div className={cx('regions')}>
                                {contentRegions.map(item => (
                                    <Region
                                        key={cx(item.slug)}
                                        editor={handle}
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
                                        editor={handle}
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

ContentEditor = forwardRef(ContentEditor);

ContentEditor.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

ContentEditor.defaultProps = {
    namespace: 'admin-content',
};

export default ContentEditor;
