import _ from 'underscore';
import op from 'object-path';
import Actinium from 'appdir/api';

import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useHookComponent,
} from 'reactium-core/sdk';

const ENUMS = {
    DEFAULT: {
        HEADER: {
            title: 'Select URL',
        },
        HOST: _.compact([
            window.location.protocol,
            '//',
            window.location.host,
        ]).join(''),
    },
    STATUS: {
        LOADING: 'loading',
        PENDING: 'pending',
        READY: 'ready',
    },
};

const useStatus = initialStatus => {
    const statusRef = useRef(initialStatus);
    const [, rerender] = useState({});

    const setStatus = (newStatus, forceRender = false) => {
        statusRef.current = newStatus;
        if (forceRender) rerender({ updated: Date.now() });
    };

    const isStatus = statuses =>
        _.flatten([statuses]).includes(statusRef.current);

    return [statusRef.current, setStatus, isStatus];
};

let UrlSelect = (props, ref) => {
    /**
     * -------------------------------------------------------------------------
     * References
     * -------------------------------------------------------------------------
     */
    const containerRef = useRef();
    /**
     * -------------------------------------------------------------------------
     * Components
     * -------------------------------------------------------------------------
     */
    const { DataTable, Dialog, Button, Icon, Spinner } = useHookComponent(
        'ReactiumUI',
    );

    /**
     * -------------------------------------------------------------------------
     * State
     * -------------------------------------------------------------------------
     */
    const [state, update] = useDerivedState({
        columns: {
            route: {
                label: 'URL',
                sortType: DataTable.ENUMS.SORT_TYPE.STRING,
                verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
            },
            actions: {
                label: null,
                verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
                textAlign: DataTable.ENUMS.TEXT_ALIGN.RIGHT,
                width: 90,
            },
        },
        header: op.get(props, 'header', ENUMS.DEFAULT.HEADER),
        height: op.get(props, 'height'),
        search: null,
        width: op.get(props, 'width'),
    });
    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    /**
     * -------------------------------------------------------------------------
     * Status
     * -------------------------------------------------------------------------
     */
    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    /**
     * -------------------------------------------------------------------------
     * Functions
     * -------------------------------------------------------------------------
     */
    const fetchHost = async (refresh = false) => {
        let host = Reactium.Cache.get('UrlSelect.host');

        if (!host || refresh === true) {
            host = await Reactium.Setting.get('site.host', ENUMS.DEFAULT.HOST);
        }

        Reactium.Cache.set('UrlSelect.host', host, 120000);
        return host;
    };

    const fetchURLS = async (refresh = false) => {
        let urls = Reactium.Cache.get('UrlSelect.urls');

        if (!urls || refresh === true) {
            const { results = {} } = await Actinium.Cloud.run('urls');
            urls = Object.values(results);
        }

        Reactium.Cache.set('UrlSelect.urls', urls, 120000);
        return urls;
    };

    const initialize = async () => {
        const unsub = () => {};

        if (status !== ENUMS.STATUS.PENDING) return unsub;
        setStatus(ENUMS.STATUS.LOADING);

        let [host, urls] = await Promise.all([fetchHost(), fetchURLS()]);

        urls = _.compact(
            urls.map(item => {
                let { route } = item;

                if (!op.get(item, 'meta.contentId')) return null;
                route = String(route).startsWith('/')
                    ? `${host}${route}`
                    : route;
                op.set(item, 'route', route);

                return {
                    route,
                    actions: (
                        <Button
                            color={Button.ENUMS.COLOR.TERTIARY}
                            onClick={() => select(item)}
                            outline
                            style={{ padding: 0, width: 35, height: 35 }}>
                            <Icon name='Feather.Check' size={16} />
                        </Button>
                    ),
                };
            }),
        );

        setStatus(ENUMS.STATUS.READY);
        setState({ host, urls });
        handle.dispatchEvent(new Event('ready'));

        return unsub;
    };

    const filter = () => {
        const { search, urls = [] } = state;
        if (!search) return urls;
        const s = String(search).toLowerCase();
        return urls.filter(({ route }) =>
            String(route)
                .toLowerCase()
                .includes(s),
        );
    };

    const select = item => {
        op.set(handle, 'value', item);
        handle.dispatchEvent(new Event('select'));
        handle.dispatchEvent(new Event('change'));
        setHandle(handle);
    };

    const unMounted = () => !containerRef.current;

    /**
     * -------------------------------------------------------------------------
     * Handle
     * -------------------------------------------------------------------------
     */
    const _handle = () => ({
        select,
        setState,
        setStatus,
        state,
        status,
        unMounted,
        value: null,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    const _onDismiss = () => handle.dispatchEvent(new Event('dismiss'));

    const _onSearch = e => {
        let search = String(e.target.value);
        search = search.length < 1 ? null : search;
        setState({ search });
    };

    useImperativeHandle(ref, () => handle);

    useAsyncEffect(initialize);

    const render = useCallback(() => {
        const data = filter();
        const { columns, header, height } = state;

        return (
            <Dialog
                ref={containerRef}
                collapsible={false}
                dismissable
                onDismiss={() => _onDismiss()}
                header={header || ENUMS.DEFAULT.HEADER}>
                <div style={{ width: '75vw' }}>
                    {isStatus(ENUMS.STATUS.READY) && (
                        <>
                            <SearchBar onChange={e => _onSearch(e)} />
                            <DataTable
                                columns={columns}
                                data={data}
                                height={height}
                                scrollable
                                sortable
                                sort={DataTable.ENUMS.SORT.ASC}
                                sortBy='route'
                            />
                        </>
                    )}
                    {!isStatus(ENUMS.STATUS.READY) && (
                        <div className='flex-center py-xs-80'>
                            <Spinner />
                        </div>
                    )}
                </div>
            </Dialog>
        );
    });

    return render();
};

UrlSelect = forwardRef(UrlSelect);

UrlSelect.defaultProps = {
    height: 'calc(100vh - 200px)',
    width: '75vw',
};

export { UrlSelect, UrlSelect as default };

const SearchBar = ({ onChange = () => {} }) => {
    const { Icon } = useHookComponent('ReactiumUI');

    return (
        <div className='ar-dialog-content'>
            <div className='bg-white-dark p-xs-16'>
                <div className='form-group' style={{ position: 'relative' }}>
                    <input
                        onChange={onChange}
                        placeholder={__('search')}
                        style={{
                            borderRadius: 40,
                            margin: 0,
                            paddingLeft: 36,
                        }}
                    />
                    <Icon
                        name='Feather.Search'
                        size={18}
                        style={{
                            left: 20,
                            pointerEvents: 'none',
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateX(-50%) translateY(-50%)',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
