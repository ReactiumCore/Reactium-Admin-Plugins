import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef, useState } from 'react';
import Reactium, {
    __,
    useAsyncEffect,
    useHookComponent,
    useIsContainer,
    useStatus,
} from 'reactium-core/sdk';

const ENUMS = {
    STATUS: {
        PENDING: 'pending',
        FETCHING: 'fetching',
        READY: 'ready',
    },
};

export default props => {
    // prettier-ignore
    const { Alert, Button, Dropdown, Icon, Spinner, Toast } = useHookComponent('ReactiumUI');
    const ElementDialog = useHookComponent('ElementDialog');

    const { editor, fieldName, placeholder, prefix, required } = props;

    const refs = useRef({}).current;

    const { errors } = editor;

    const cx = Reactium.Utils.cxFactory('editor-urls');

    // status
    const [status, setStatus, isStatus] = useStatus();

    // taxonomy
    const [tax, setTax] = useState(prefix);
    const [taxonomies, setTaxonomies] = useState([]);

    // prettier-ignore
    const [isError, setError] = useState(op.has(errors, [fieldName, 'message']));
    const [URLS, setNewURLS] = useState({});
    const [errorText, setNewErrorText] = useState(
        op.get(errors, [fieldName, 'message']),
    );

    const setErrorText = (...newErrorText) => {
        if (editor.unMounted()) return;
        setNewErrorText(_.compact(Array.from(newErrorText)).join(' '));
    };

    const setURLS = newURLS => {
        if (editor.unMounted()) return;
        setNewURLS(newURLS);
    };

    const isRoute = route => {
        const routes = Reactium.Routing.get();

        return (
            !!_.findWhere(routes, { path: route }) ||
            !!_.findWhere(Object.values(URLS), { route })
        );
    };

    const isSaved = () => {
        return op.get(editor.value, 'objectId') !== undefined;
    };

    const hasTaxonomy = () => {
        if (!editor) return;
        if (prefix === 'null' || !prefix) return;

        const selected = _.reject(
            Reactium.Cache.get(`editor.taxonomy.${prefix}.selected`, []),
            { deleted: true },
        );
        if (!selected) return;
        if (selected.length < 1) return;

        return true;
    };

    const taxonomy = () => {
        if (!prefix) return;

        // exit if no selected taxonomy
        if (!taxonomies || taxonomies.length < 1) return;

        return taxonomies.map(({ slug }) => ({
            label: `${slug}/`,
            value: slug,
        }));
    };

    const addURL = route => {
        route = route || refs.add.value;

        if (!route) return;

        if (tax !== prefix) {
            route = `${tax}/${route}`;
        }
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
        const collection = op.get(editor.contentType, 'collection');
        const type = op.get(editor.contentType, 'machineName');
        const meta = {
            contentId: isSaved() ? editor.value.objectId : undefined,
            collection,
            type,
        };

        let newURLS = { ...URLS };
        const objectId = Date.now();
        op.set(newURLS, objectId, {
            meta,
            objectId,
            pending: true,
            route,
            blueprint: collection,
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
        if (editor.isNew()) {
            setStatus(ENUMS.STATUS.READY);
            setURLS({});
            return;
        } else if (isStatus(ENUMS.STATUS.READY)) {
            setStatus(ENUMS.STATUS.PENDING);
        }

        if (!isStatus(ENUMS.STATUS.PENDING)) return;
        setStatus(ENUMS.STATUS.FETCHING);

        const results = await fetch();
        setStatus(ENUMS.STATUS.COMPLETE);

        if (editor.unMounted()) return;

        setStatus(ENUMS.STATUS.READY);
        setURLS(results);
    };

    const fetch = async () => {
        const collection = op.get(editor.contentType, 'collection');
        const contentId = op.get(editor.value, 'objectId');

        const { results = {} } = await Reactium.Cloud.run('urls', {
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

    const applyURLS = ({ value }) => {
        Object.entries(URLS).forEach(([key, URL]) => {
            if (op.get(URL, 'user')) {
                try {
                    URL.user = URL.user.toPointer();
                    URLS[key] = URL;
                } catch (err) {}
            }
        });
        op.set(value, String(fieldName).toLowerCase(), URLS);
    };

    const afterSave = async () => {
        if (!isStatus(ENUMS.STATUS.FETCHING)) {
            setStatus(ENUMS.STATUS.FETCHING);
            const u = await fetch();
            setStatus(ENUMS.STATUS.COMPLETE);
            setURLS(u);
        }
        setError(false);
        setErrorText(null);
    };

    const validate = ({ context }) => {
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

    const listeners = () => {
        if (!editor) return;

        editor.addEventListener('content-parse', applyURLS);
        editor.addEventListener('save-success', afterSave);
        editor.addEventListener('validate', validate);

        return () => {
            editor.removeEventListener('content-parse', applyURLS);
            editor.removeEventListener('save-success', afterSave);
            editor.removeEventListener('validate', validate);
        };
    };

    useAsyncEffect(load, [op.get(editor, 'value.objectId')]);

    // Editor listeners
    useEffect(listeners);

    // Taxonomy prefix dropdown
    useEffect(() => {
        if (!editor) return;
        if (!hasTaxonomy()) return;

        const tx = taxonomy();

        if (!tx) {
            if (tax !== prefix) setTax(prefix);
            return;
        }

        if (tx.length === 1) {
            if (tax === prefix) setTax(_.first(tx).value);
        }
    });

    useEffect(() => {
        if (prefix === 'null' || !prefix) return;
        return Reactium.Cache.subscribe(
            `editor.taxonomy.${prefix}`,
            ({ op }) => {
                switch (op) {
                    case 'set':
                    case 'del':
                        setTaxonomies(
                            _.reject(
                                Reactium.Cache.get(
                                    `editor.taxonomy.${prefix}.selected`,
                                ),
                                { deleted: true },
                            ),
                        );
                        break;
                }
            },
        );
    }, [prefix]);

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
                    {hasTaxonomy() && (
                        <Dropdown
                            size='md'
                            align='left'
                            onItemSelect={({ item }) => setTax(item.value)}
                            data={taxonomy()}>
                            <button
                                className='dropdown-btn'
                                data-dropdown-element
                                type='button'>
                                {`${tax}/`}
                            </button>
                        </Dropdown>
                    )}
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
                    {Object.values(URLS).map(url => (
                        <ListItem
                            key={`list-item-${url.objectId}`}
                            {...url}
                            status={status}
                            onChange={updateURL}
                            onDelete={deleteURL}
                            onUnDelete={unDeleteURL}
                            placeholder={placeholder}
                        />
                    ))}
                </ul>
                {!isStatus([ENUMS.STATUS.READY, ENUMS.STATUS.COMPLETE]) && (
                    <Spinner />
                )}
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
