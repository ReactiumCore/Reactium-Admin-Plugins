import _ from 'underscore';
import cn from 'classnames';
import ENUMS from './enums';
import op from 'object-path';
import slugify from 'slugify';
import ListItem from './ListItem';
import React, { useEffect, useRef, useState } from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useHookComponent,
    useStatus,
} from 'reactium-core/sdk';

export default props => {
    // prettier-ignore
    const { Alert, Button, Dropdown, Icon, Spinner, Toast } = useHookComponent('ReactiumUI');
    const ElementDialog = useHookComponent('ElementDialog');

    const {
        editor,
        fieldName,
        placeholder,
        required = false,
        app = 'site',
    } = props;

    const prefix = props.prefix === 'null' ? null : props.prefix;

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
            label: `/${slug}`,
            value: slug,
        }));
    };

    const addURL = route => {
        route = route || refs.add.value;

        if (!route) return;

        if (tax !== prefix) {
            route = `${tax}/${route}`;
            route = String(route).replace(/\/\/+/g, '/');
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
            app,
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

    const disabled = () => (prefix !== null ? !hasTaxonomy() : false);

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

    const normalizeURL = url => {
        if (String(url).length < 1) return url;

        url = url.split(' ').join('-');
        url = String(url)
            .toLowerCase()
            .split('/')
            .map(str => slugify(str))
            .join('/');

        return String(url).substr(0, 1) === '/' ? url : `/${url}`;
    };

    const onEnter = e => {
        if (e.which === 13) {
            e.preventDefault();
            addURL();
        }
    };

    const onKeyUp = e => {
        let url = normalizeURL(e.target.value);
        e.target.value = url;
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
            if (tax !== prefix) {
                setTax(prefix);
            }
            return;
        }

        if (tx.length === 1) {
            if (tax === prefix) setTax(_.first(tx).value);
        }
    });

    useEffect(() => {
        if (!editor) return;
        if (prefix && disabled()) {
            setErrorText(
                __('Select %prefix before adding a URL').replace(
                    /\%prefix/gi,
                    prefix,
                ),
            );
        } else {
            setErrorText();
        }
    }, [taxonomies, editor]);

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
                        icon={<Icon name='Feather.AlertOctagon' />}>
                        {errorText}
                    </Alert>
                )}
                {!disabled() && (
                    <>
                        <div className={cn('input-group', { error: isError })}>
                            {hasTaxonomy() && (
                                <Dropdown
                                    size='md'
                                    align='left'
                                    data={taxonomy()}
                                    onItemSelect={({ item }) =>
                                        setTax(item.value)
                                    }>
                                    <button
                                        type='button'
                                        data-dropdown-element
                                        className='dropdown-btn'>
                                        {`/${tax}`}
                                    </button>
                                </Dropdown>
                            )}
                            <input
                                type='text'
                                onKeyUp={onKeyUp}
                                onKeyDown={onEnter}
                                placeholder={placeholder}
                                ref={elm => op.set(refs, 'add', elm)}
                            />
                            <Button
                                className='add-btn'
                                onClick={() => addURL()}
                                color={Button.ENUMS.COLOR.TERTIARY}
                                style={{
                                    width: 41,
                                    height: 41,
                                    padding: 0,
                                    flexShrink: 0,
                                }}>
                                <Icon name='Feather.Plus' size={22} />
                            </Button>
                        </div>
                        <ul className={cx('list')}>
                            {Object.values(URLS).map(url => (
                                <ListItem
                                    {...url}
                                    status={status}
                                    onKeyUp={onKeyUp}
                                    onChange={updateURL}
                                    onDelete={deleteURL}
                                    onUnDelete={unDeleteURL}
                                    placeholder={placeholder}
                                    key={`list-item-${url.objectId}`}
                                />
                            ))}
                        </ul>
                    </>
                )}
                {!isStatus([ENUMS.STATUS.READY, ENUMS.STATUS.COMPLETE]) && (
                    <Spinner />
                )}
            </div>
        </ElementDialog>
    );
};
