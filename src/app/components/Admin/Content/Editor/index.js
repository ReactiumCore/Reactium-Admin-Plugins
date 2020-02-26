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
    const [error, setError] = useState();
    const [fieldTypes] = useState(Reactium.ContentType.FieldType.list);
    const [status, setStatus] = useState('pending');
    const [state, setState] = useDerivedState({ title: ENUMS.TEXT.EDITOR });
    const [types, setTypes] = useState();
    const [updated, update] = useState();
    const [value, setNewValue] = useState();

    // Alias setValue to prevent memory leak
    const setValue = (newValue = {}, checkReady = false) => {
        if (unMounted(checkReady)) return;
        newValue = { ...value, ...newValue };
        setNewValue(newValue);
    };

    const cx = cls => _.compact([namespace, cls]).join('-');

    const cname = cn({ [cx()]: true, [className]: !!className });

    const dispatch = (event, detail) => {
        if (unMounted()) return;
        const evt = new CustomEvent(event, { detail });
        handle.dispatchEvent(evt);
        return Reactium.Hook.run(event, detail, handle);
    };

    const getContent = () => {
        if (isNew()) return Promise.resolve({});
        return Reactium.Content.retrieve({
            type: contentType,
            slug,
        });
    };

    const getContentType = () => _.findWhere(types, { type });

    const getTypes = refresh => Reactium.ContentType.types(refresh);

    const unMounted = (checkReady = false) => {
        if (checkReady === true && !ready) return true;
        return !formRef.current;
    };

    const isMounted = (checkReady = false) => {
        if (unMounted(checkReady)) return false;
        return true;
    };

    const isNew = () => {
        const val = String(slug).toLowerCase() === 'new' ? true : null;
        return val === true ? true : null;
    };

    const properCase = useProperCase();

    const regions = () => {
        const _regions = op.get(contentType, 'regions', {});
        const content = _.without(Object.keys(_regions), 'sidebar').map(
            key => _regions[key],
        );
        const sidebar = _.compact([op.get(_regions, 'sidebar')]);

        return [content, sidebar];
    };

    const save = async (mergeValue = {}) => {
        const newValue = { ...value, ...mergeValue };

        await dispatch('before-content-saved', newValue);

        if (!op.get(newValue, 'slug')) {
            op.set(newValue, 'slug', `${type}-${uuid()}`);
        }
        if (!op.get(newValue, 'type')) {
            op.set(newValue, 'type', contentType);
        }

        await dispatch('content-save', newValue);

        return Reactium.Content.save(newValue, null, handle);
    };

    const submit = () => formRef.current.submit();

    const _onChange = async e => {
        const newValue = { ...value, ...e.value };
        await dispatch('content-change', newValue);
        setNewValue(newValue, true);
    };

    const _onError = async e => {
        await dispatch('content-save-error', e);
        if (isMounted()) setError(e);
    };

    const _onSubmit = async e =>
        new Promise(async (resolve, reject) => {
            await dispatch('content-submit', e);
            save()
                .then(async result => {
                    if (unMounted()) return;
                    await _onSuccess(e, result, resolve);
                })
                .catch(async error => {
                    if (unMounted()) return;
                    await _onFail(e, error, reject);
                });
        });

    const _onSuccess = async (e, result, next) => {
        await dispatch('content-save-success', result);

        const message = String(ENUMS.TEXT.SAVED).replace('%type', type);

        Toast.show({
            icon: 'Feather.Check',
            message,
            type: Toast.TYPE.INFO,
        });

        if (unMounted()) return;

        if (isNew()) {
            const newSlug = result.slug;
            Reactium.Routing.history.push(`/admin/content/${type}/${newSlug}`);
            return;
        } else {
            setValue(result);
            next();
        }
    };

    const _onFail = async (e, error, next) => {
        await dispatch('content-save-fail', error);

        const message = String(ENUMS.TEXT.SAVE_ERROR).replace('%type', type);

        Toast.show({
            icon: 'Feather.AlertOctagon',
            message,
            type: Toast.TYPE.ERROR,
        });

        if (isMounted()) setError(error);
        next();
    };

    const _onValidate = async e => {
        await dispatch('content-validate', e);
        return e;
    };

    // Handle
    const _handle = () => ({
        EventForm: formRef.current,
        contentType,
        cx,
        dispatch,
        fieldTypes,
        isMounted,
        regions,
        save,
        state,
        setState,
        setValue,
        submit,
        type,
        types,
        unMounted,
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

    useEffect(() => {
        if (!formRef.current || !slug || value) return;
        getContent().then(result => {
            if (unMounted()) return;
            setValue(result);
        });
    });

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
                    onChange={_onChange}
                    onError={_onError}
                    onSubmit={_onSubmit}
                    validator={_onValidate}
                    value={value}>
                    {value && contentRegions.length > 0 && (
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
                    {value && sidebarRegions.length > 0 && (
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
