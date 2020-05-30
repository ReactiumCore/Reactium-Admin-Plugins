import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Actinium from 'appdir/api';
import React, { useEffect, useRef, useState } from 'react';
import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useHandle,
    useHookComponent,
    useIsContainer,
} from 'reactium-core/sdk';

const ENUMS = {
    STATUS: {
        PENDING: 'PENDING',
        FETCHING: 'FETCHING',
        READY: 'READY',
    },
};

export default props => {
    // prettier-ignore
    const { Alert, Button, Checkbox, Icon, Spinner, Toast } = useHookComponent('ReactiumUI');
    const ElementDialog = useHookComponent('ElementDialog');

    const { editor, fieldName, placeholder, required } = props;

    const refs = useRef({ status: ENUMS.STATUS.PENDING }).current;

    const { errors } = editor;
    const replacers = { '%fieldName': fieldName };

    const cx = Reactium.Utils.cxFactory('editor-urls');

    // prettier-ignore
    const [isError, setError] = useState(op.has(errors, [fieldName, 'message']));
    const [URLS, setNewURLS] = useState(op.get(editor.value, 'urls', {}));
    const [errorText, setNewErrorText] = useState(
        op.get(errors, [fieldName, 'message']),
    );

    const setErrorText = (...newErrorText) => {
        if (editor.unMounted()) return;
        setNewErrorText(_.compact(Array.from(newErrorText)).join(' '));
    };

    const setStatus = newStatus => {
        if (editor.unMounted()) return;
        refs.status = newStatus;
    };

    const setURLS = newURLS => {
        if (editor.unMounted()) return;
        setNewURLS(newURLS);
    };

    const getStatus = () => refs.status;

    const isRoute = route => {
        const routes = Reactium.Routing.get();

        return (
            !!_.findWhere(routes, { path: route }) ||
            !!_.findWhere(Object.values(URLS), { route })
        );
    };

    const isSaved = () => op.has(editor, 'value.objectId');

    const isStatus = (...args) => {
        args = Array.from(args);
        return args.includes(refs.status);
    };

    const addURL = route => {
        route = route || refs.add.value;

        if (!route) return;
        if (isRoute(route)) {
            Toast.show({
                type: Toast.TYPE.ERROR,
                message: __('%route already exists').replace(
                    /\%route/gi,
                    route,
                ),
                icon: 'Feather.AlertOctagon',
                autoClose: 3000,
            });
            setError(true);
            return;
        }
        const type = op.get(editor.contentType, 'collection');
        const meta = {
            contentId: isSaved() ? editor.value.objectId : undefined,
            type,
        };

        let newURLS = { ...URLS };
        const objectId = Date.now();
        op.set(newURLS, objectId, {
            meta,
            objectId,
            pending: true,
            route,
            blueprint: type,
        });
        setURLS(newURLS);
        setError(null);

        // Clear the form
        refs.add.value = '';
        refs.add.focus();
    };

    const deleteURL = ({ objectId }) => {
        const newURLS = { ...URLS };
        op.set(newURLS, [objectId, 'delete'], true);
        op.set(newURLS, [objectId, 'pending'], true);
        setURLS(newURLS);
    };

    const unDeleteURL = ({ objectId }) => {
        const newURLS = { ...URLS };
        op.del(newURLS, [objectId, 'delete']);
        op.del(newURLS, [objectId, 'pending']);
        setURLS(newURLS);
    };

    const updateURL = (route, obj) => {
        const { objectId } = obj;
        const newURLS = { ...URLS };
        op.del(newURLS, [objectId, 'delete']);
        op.set(newURLS, [objectId, 'route'], route);
        op.set(newURLS, [objectId, 'pending'], true);
        setURLS(newURLS);
    };

    const load = async () => {
        if (!editor.value) return;

        if (!isSaved()) {
            setStatus(ENUMS.STATUS.READY);
            return;
        }

        if (!isStatus(ENUMS.STATUS.PENDING)) return;

        setStatus(ENUMS.STATUS.FETCHING);

        const results = await fetch();

        if (editor.unMounted()) return;

        setStatus(ENUMS.STATUS.READY);
        setURLS(results);
    };

    const fetch = async () => {
        const collection = op.get(editor.contentType, 'collection');
        const contentId = op.get(editor.value, 'objectId');

        const { results = {} } = await Actinium.Cloud.run('urls', {
            collection,
            contentId,
        });
        return results;
    };

    const onEnter = e => {
        if (e.which !== 13) return;
        e.preventDefault();
        addURL();
    };

    const applyURLS = ({ contentType, value }) => {
        op.set(value, String(fieldName).toLowerCase(), URLS);
    };

    const afterSave = async e => {
        const u = await fetch();
        setURLS(u);
        setError(false);
        setErrorText(null);
    };

    const validate = ({ context, value }) => {
        let urls = Object.values(URLS).filter(
            url => op.get(url, 'delete') !== true,
        );

        if (urls.length > 0 || !required) return context;

        const err = {
            field: fieldName,
            focus: refs.add,
            message: __('URL is a required parameter'),
            value: urls,
        };

        context.error[fieldName] = err;
        context.valid = false;
        setError(true);
        setErrorText('Enter a url to this', editor.type);

        return context;
    };

    const onSave = () => {
        if (!editor) return;

        editor.addEventListener('before-save', applyURLS);
        editor.addEventListener('save-success', afterSave);
        editor.addEventListener('validate', validate);

        return () => {
            editor.removeEventListener('before-save', applyURLS);
            editor.removeEventListener('save-succes', afterSave);
            editor.removeEventListener('validate', validate);
        };
    };

    useAsyncEffect(load, [editor.value]);

    useEffect(onSave);

    const className = cn('form-group', { error: isError });

    return (
        <ElementDialog {...props}>
            <div className={cx()}>
                {errorText && (
                    <Alert
                        color={Alert.ENUMS.COLOR.DANGER}
                        dismissable
                        icon={<Icon name='Feather.AlertOctagon' />}>
                        {errorText}
                    </Alert>
                )}
                <div className={cn('input-group', { error: isError })}>
                    <input
                        onKeyDown={onEnter}
                        placeholder={placeholder}
                        ref={elm => op.set(refs, 'add', elm)}
                        type='text'
                    />
                    <Button
                        color={Button.ENUMS.COLOR.TERTIARY}
                        onClick={() => addURL()}
                        style={{ width: 41, height: 41, padding: 0 }}>
                        <Icon name='Feather.Plus' size={22} />
                    </Button>
                </div>
                <ul className={cx('list')}>
                    {!isStatus(ENUMS.STATUS.READY) && (
                        <li>
                            <Spinner />
                        </li>
                    )}

                    {Object.values(URLS).map(url => (
                        <ListItem
                            key={`list-item-${url.objectId}`}
                            {...url}
                            onChange={updateURL}
                            onDelete={deleteURL}
                            onUnDelete={unDeleteURL}
                            placeholder={placeholder}
                        />
                    ))}
                </ul>
            </div>
        </ElementDialog>
    );
};

const ListItem = props => {
    const refs = useRef({}).current;
    const { onChange, onDelete, onUnDelete, placeholder, route } = props;
    const [deleted, setDeleted] = useState(op.get(props, 'delete', false));
    const { Button, Carousel, Icon, Slide, Toast } = useHookComponent(
        'ReactiumUI',
    );

    const buttonStyle = {
        width: 41,
        height: 41,
        padding: 0,
    };

    const enable = () => {
        refs.carousel.jumpTo(1);
        refs.input.removeAttribute('readOnly');
        refs.input.focus();
    };

    const disable = ({ target }) => {
        if (isContainer(target, refs.container)) return;

        refs.carousel.jumpTo(deleted ? 2 : 0);
        refs.input.setAttribute('readOnly', true);
    };

    const unDelete = () => {
        enable();
        setDeleted(false);
        onUnDelete(props);
    };

    const remove = () => {
        refs.input.setAttribute('readOnly', true);
        refs.carousel.jumpTo(2);

        Toast.show({
            type: Toast.TYPE.INFO,
            message: __('%route marked for deletion').replace(
                /\%route/gi,
                route,
            ),
            icon: 'Feather.Check',
            autoClose: 3000,
        });

        setDeleted(true);
        onDelete(props);
    };

    const isContainer = useIsContainer();

    useEffect(() => {
        if (!refs.container) return;

        window.addEventListener('mousedown', disable);
        window.addEventListener('touchstart', disable);

        return () => {
            window.removeEventListener('mousedown', disable);
            window.removeEventListener('touchstart', disable);
        };
    }, [
        refs.container,
        op.get(refs, 'carousel.state.active'),
        Object.values(props),
    ]);

    return (
        <li
            className={cn('input-group', { deleted })}
            ref={elm => op.set(refs, 'container', elm)}>
            <input
                type='text'
                onChange={e => onChange(e.target.value, props)}
                placeholder={placeholder}
                ref={elm => op.set(refs, 'input', elm)}
                readOnly
                value={route}
            />
            <div
                className='edit-toggle'
                ref={elm => op.set(refs, 'carousel-container', elm)}>
                <Carousel
                    active={deleted ? 2 : 0}
                    ref={elm => op.set(refs, 'carousel', elm)}
                    animationSpeed={0.25}>
                    <Slide>
                        <Button
                            color={Button.ENUMS.COLOR.TERTIARY}
                            onClick={enable}
                            style={buttonStyle}>
                            <Icon name='Feather.Edit2' size={18} />
                        </Button>
                    </Slide>
                    <Slide>
                        <Button
                            color={Button.ENUMS.COLOR.DANGER}
                            onClick={remove}
                            style={buttonStyle}>
                            <Icon name='Feather.X' size={20} />
                        </Button>
                    </Slide>
                    <Slide>
                        <Button
                            color={Button.ENUMS.COLOR.DANGER}
                            onClick={unDelete}
                            style={buttonStyle}>
                            <Icon name='Feather.RotateCcw' size={20} />
                        </Button>
                    </Slide>
                </Carousel>
            </div>
        </li>
    );
};