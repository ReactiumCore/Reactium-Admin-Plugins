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
    const errorText = op.get(errors, [fieldName, 'message']);
    const className = cn('form-group', { error: !!errorText });

    const cx = Reactium.Utils.cxFactory('editor-urls');

    const [URLS, setNewURLS] = useState(op.get(editor.value, 'URLS', []));

    const setStatus = newStatus => {
        if (editor.unMounted()) return;
        refs.status = newStatus;
    };

    const setURLS = newURLS => {
        if (editor.unMounted()) return;
        setNewURLS(newURLS);
    };

    const getStatus = () => refs.status;

    const isRoute = route => !!_.findWhere(Object.values(URLS), { route });

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
            return;
        }
        const type = op.get(editor.contentType, 'collection');
        const meta = {
            contentId: isSaved() ? editor.value.objectId : undefined,
            blueprint: type,
            type,
        };

        let newURLS = { ...URLS };
        const objectId = Date.now();
        op.set(newURLS, objectId, { meta, objectId, pending: true, route });
        setURLS(newURLS);

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
        const contentId = op.get(editor.value, 'objectId');
        const { results = {} } = await Actinium.Cloud.run('urls', {
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
        console.log(editor, URLS);
        //op.set(value, fieldName, URLS);
        op.del(value, fieldName);
    };

    const onSave = () => {
        if (!editor) return;

        editor.addEventListener('before-save', applyURLS);

        return () => {
            editor.removeEventListener('before-save', applyURLS);
        };
    };

    useAsyncEffect(load, [editor.value]);

    useEffect(onSave);

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
                <div className={cn('input-group', { error: !!errorText })}>
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

                    {_.sortBy(Object.values(URLS), 'route')
                        .reverse()
                        .map(url => (
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
    const { Button, Carousel, Icon, Slide } = useHookComponent('ReactiumUI');

    const deleted = () => op.get(props, 'delete') === true;

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

        refs.carousel.jumpTo(deleted() ? 2 : 0);
        refs.input.setAttribute('readOnly', true);
    };

    const unDelete = () => {
        enable();
        onUnDelete(props);
    };

    const remove = () => {
        refs.input.setAttribute('readOnly', true);
        refs.carousel.jumpTo(2);
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
            className={cn('input-group', { deleted: deleted() })}
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
                    active={deleted() ? 2 : 0}
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

/*
RotateCcw
const validate = ({ context, value }) => {
    const v = value[fieldName];

    const err = {
        field: fieldName,
        focus: inputRef.current,
        message: null,
        value: v,
    };

    if (required === true) {
        if (!v) {
            err.message = __('%fieldName is a required');
        }
    }

    if (err.message !== null) {
        err.message = editor.parseErrorMessage(err.message, replacers);
        context.error[fieldName] = err;
        context.valid = false;
    }

    return context;
};

useEffect(() => {
    editor.addEventListener('validate', validate);
    return () => {
        editor.removeEventListener('validate', validate);
    };
}, [editor]);
//                     {errorText && <small>{errorText}</small>}
*/
