import _ from 'underscore';
import op from 'object-path';
import PropTypes from 'prop-types';
import { TaxonomyEvent } from './TaxonomyEvent';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useHandle,
    useHookComponent,
    useRegisterHandle,
    useSelect,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useEffect,
    useState,
} from 'react';

const ENUMS = {
    STATUS: {
        PENDING: 'PENDING',
        INITIALIZING: 'INITIALIZING',
        INITIALIZED: 'INITIALIZED',
        READY: 'READY',
    },
};

const noop = () => {};

const useModal = () => {
    const tools = useHandle('AdminTools');
    return op.get(tools, 'Modal');
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Taxonomy
 * -----------------------------------------------------------------------------
 */
let Taxonomy = (
    { children, className, namespace, onStatus, title, ...props },
    ref,
) => {
    const containerRef = useRef();

    const route = useSelect(state => op.get(state, 'Router.params'));
    const path = useSelect(state => op.get(state, 'Router.match.path'));
    op.set(route, 'path', path);

    // -------------------------------------------------------------------------
    // Components
    // -------------------------------------------------------------------------
    const Helmet = useHookComponent('Helmet');

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [state, update] = useDerivedState({
        header: false,
        status: null,
        types: [],
    });

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------
    const statusRef = useRef(ENUMS.STATUS.PENDING);

    const setStatus = (newStatus, updateState = false) => {
        if (unMounted()) return;
        statusRef.current = newStatus;
        if (updateState === true) setState({ status: Date.now() });
    };

    const isStatus = (...statuses) => statuses.includes(statusRef.current);

    const status = () => statusRef.current;

    const statusChange = () => {
        if (!state.status) return;
        dispatch('status', { status: status() }, handle, onStatus);
    };

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------
    const cx = Reactium.Utils.cxFactory(className || namespace);

    // dispatch(eventType:String, event:Object, callback:Function);
    const dispatch = async (eventType, eventObj, callback) => {
        if (unMounted()) return;

        const evt = new TaxonomyEvent(eventType, eventObj);

        handle.dispatchEvent(evt);
        if (unMounted()) return;

        await Reactium.Hook.run(eventType, evt, handle);

        if (unMounted()) return;
        if (typeof callback === 'function') await callback(evt);

        return handle;
    };

    const fetchTypes = async () => {
        const { results } = await Reactium.Taxonomy.Type.list({
            verbose: true,
            refresh: true,
        });
        return Object.values(results);
    };

    const initialize = async () => {
        if (!isStatus(ENUMS.STATUS.PENDING)) return;
        setStatus(ENUMS.STATUS.INITIALIZING);
        const types = await fetchTypes();
        setStatus(ENUMS.STATUS.INITIALIZED);
        setState({ types });
    };

    const unMounted = () => !containerRef.current;

    // -------------------------------------------------------------------------
    // Handle
    // -------------------------------------------------------------------------
    const _handle = () => ({
        children,
        className,
        cx,
        dispatch,
        initialize,
        namespace,
        props,
        route,
        setState,
        setStatus,
        state,
        status,
        unMounted,
    });

    const [handle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);
    useRegisterHandle('Taxonomy', () => handle, [handle]);

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------
    // Status change
    useEffect(statusChange, [state.status]);

    // Initialize
    useAsyncEffect(initialize);

    return (
        <div ref={containerRef} className={cx()}>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <ul className={cx('list')}>
                {state.types.map(item => (
                    <TaxonomyListItem
                        className={cx('list-item')}
                        description={item.description}
                        handle={handle}
                        key={item.objectId}
                        name={item.name}
                        objectId={item.objectId}
                        slug={item.slug}
                        taxonomies={Object.values(
                            op.get(item, 'taxonomies.results', {}),
                        )}
                    />
                ))}
            </ul>
        </div>
    );
};

const TaxonomyListItem = ({
    description,
    handle,
    name,
    objectId,
    slug,
    taxonomies,
    ...props
}) => {
    const content = useRef();

    const Modal = useModal();

    const { Button, Collapsible, Icon } = useHookComponent('ReactiumUI');

    const [expanded, setExpanded] = useState(
        Reactium.Prefs.get(`admin.taxonomy.${slug}.expanded`, true),
    );

    const value = {
        description,
        name,
        objectId,
        slug,
    };

    const showTypeEditor = v =>
        Modal.show(<TypeEditor handle={handle} value={v} />);

    const showNewType = v => Modal.show(<Editor handle={handle} value={v} />);

    const toggle = () => setExpanded(!expanded);

    const toggled = () => {
        Reactium.Prefs.set(`admin.taxonomy.${slug}.expanded`, expanded);
    };

    const toggleIcon = expanded ? 'Feather.ChevronUp' : 'Feather.ChevronDown';

    useEffect(toggled, [expanded]);

    useEffect(() => {
        const type = op.get(handle.route, 'type');
        if (type !== slug || op.get(handle.route, 'slug')) return;
        showTypeEditor(value);
    }, [op.get(handle.route, 'type'), slug]);

    return (
        <li {...props}>
            <h2 className='h3'>
                <Button
                    color={Button.ENUMS.COLOR.CLEAR}
                    data-align='right'
                    data-vertical-align='middle'
                    data-tooltip={String(__('New %type')).replace(
                        /\%type/gi,
                        name,
                    )}
                    onClick={() => showNewType({ type: slug })}>
                    <Icon name='Feather.Plus' size={18} />
                </Button>
                <span className='flex-grow'>{name}</span>
                <Button
                    className='hover-show'
                    color={Button.ENUMS.COLOR.CLEAR}
                    onClick={() => showTypeEditor(value)}>
                    <Icon name='Feather.Edit2' size={18} />
                </Button>
                <Button
                    color={Button.ENUMS.COLOR.CLEAR}
                    onClick={() => content.current.toggle()}>
                    <Icon name={toggleIcon} size={22} />
                </Button>
            </h2>
            <Collapsible
                expanded={expanded}
                onBeforeCollapse={toggle}
                onBeforeExpand={toggle}
                ref={content}>
                {taxonomies.length > 0 && (
                    <ul>
                        {taxonomies.map(item => (
                            <TaxonomySubListItem
                                handle={handle}
                                key={`collapsible-${item.slug}`}
                                value={item}
                                type={value}
                            />
                        ))}
                    </ul>
                )}
            </Collapsible>
        </li>
    );
};

const TaxonomySubListItem = ({ handle, type, value }) => {
    const Modal = useModal();
    const ConfirmBox = useHookComponent('ConfirmBox');
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const showDelete = () => {
        const confirmed = async () => {
            await Reactium.Taxonomy.delete({
                slug: value.slug,
                type: type.slug,
            });
            Modal.hide();
            handle.setStatus(ENUMS.STATUS.PENDING, true);
        };

        const message = __('Delete %name %type?')
            .replace(/\%name/gi, value.name)
            .replace(/\%type/gi, type.name);

        Modal.show(
            <ConfirmBox
                message={message}
                onCancel={() => Modal.hide()}
                onConfirm={() => confirmed()}
                title={__('Delete %type').replace(/\%type/gi, type.name)}
            />,
        );
    };

    const showEditor = v =>
        Modal.show(
            <Editor handle={handle} value={{ ...v, type: type.slug }} />,
        );

    return (
        <li>
            <div>
                <span className='strong'>{value.name}</span>
                <br />
                <small>/{value.slug}</small>
            </div>
            <Button
                color={Button.ENUMS.COLOR.CLEAR}
                onClick={() => showEditor(value)}>
                <Icon name='Feather.Edit2' size={18} />
            </Button>
            <Button color={Button.ENUMS.COLOR.CLEAR} onClick={showDelete}>
                <Icon name='Feather.Trash2' size={18} className='trash' />
            </Button>
        </li>
    );
};

export const HeaderWidget = () => {
    const Modal = useModal();
    const handle = useHandle('Taxonomy');
    const { Button, Icon } = useHookComponent('ReactiumUI');
    const path = useSelect(state => op.get(state, 'Router.match.path'));
    const visible = String(path).startsWith('/admin/taxonomy');
    const showTypeEditor = () => Modal.show(<TypeEditor handle={handle} />);

    return !visible ? null : (
        <Button
            appearance={Button.ENUMS.APPEARANCE.PILL}
            className='mr-xs-24'
            color={Button.ENUMS.COLOR.PRIMARY}
            onClick={showTypeEditor}
            outline
            size={Button.ENUMS.SIZE.XS}>
            <Icon name='Feather.Plus' size={18} />
            <span className='hide-xs show-md ml-xs-12'>
                {__('New Taxonomy')}
            </span>
        </Button>
    );
};

const Editor = ({ handle, namespace = 'admin-taxonomy', value }) => {
    const formRef = useRef();
    const Modal = useModal();
    const TaxonomyEditor = useHookComponent('TaxonomyEditor');
    const { Button, Dialog, Icon, Toast } = useHookComponent('ReactiumUI');

    const [status, setNewStatus] = useState(ENUMS.STATUS.READY);

    const setStatus = newStatus => {
        if (unMounted()) return;
        setNewStatus(newStatus);
    };

    const cx = Reactium.Utils.cxFactory(namespace);

    const dismiss = () => Modal.hide();

    const footer = {
        elements: [
            <Button
                key='cancel-btn'
                className='mr-xs-8'
                color={Button.ENUMS.COLOR.DANGER}
                onClick={() => dismiss()}>
                {__('Cancel')}
            </Button>,
            <Button
                key='save-btn'
                color={Button.ENUMS.COLOR.PRIMARY}
                disabled={status === ENUMS.STATUS.PENDING}
                onClick={() => submit()}>
                {__('Save %type').replace(/\%type/gi, value.type)}
            </Button>,
        ],
    };

    const header = {
        title: op.get(value, 'objectId')
            ? __('Edit %type').replace(/\%type/gi, value.type)
            : __('New %type').replace(/\%type/gi, value.type),
    };

    const unMounted = () => !formRef.current;

    const submit = async () => {
        if (status === ENUMS.STATUS.PENDING) return;

        setStatus(ENUMS.STATUS.PENDING);

        const v = formRef.current.getValue();

        let result;

        try {
            result = await formRef.current.submit();
            if (!op.get(result, 'error')) {
                Toast.show({
                    type: Toast.TYPE.INFO,
                    message: __('Saved %name').replace(/\%name/gi, v.name),
                    icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
                });
            }
        } catch (err) {
            result = { error: err };
            Toast.show({
                type: Toast.TYPE.ERROR,
                message: err.message,
                icon: <Icon.Feather.AlertOctagon style={{ marginRight: 12 }} />,
            });
        }

        setStatus(ENUMS.STATUS.READY);

        if (op.get(result, 'error')) return;

        handle.setStatus(ENUMS.STATUS.PENDING, true);

        if (op.get(v, 'objectId') !== null) dismiss();
        else formRef.current.refs.name.focus();
    };

    return (
        <Dialog
            collapsible={false}
            dismissable
            footer={footer}
            header={header}
            onDismiss={dismiss}>
            <div className={cx('editor')}>
                <TaxonomyEditor
                    className={cx('form')}
                    value={value}
                    ref={formRef}
                />
            </div>
        </Dialog>
    );
};

const TypeEditor = ({ handle, namespace = 'admin-taxonomy', value }) => {
    const carouselRef = useRef();
    const formRef = useRef();
    const Modal = useModal();
    const TaxonomyTypeEditor = useHookComponent('TaxonomyTypeEditor');

    const { Button, Carousel, Dialog, Icon, Slide, Toast } = useHookComponent(
        'ReactiumUI',
    );

    const [active, setActive] = useState(0);

    const [status, setNewStatus] = useState(ENUMS.STATUS.READY);

    const setStatus = newStatus => {
        if (unMounted()) return;
        setNewStatus(newStatus);
    };

    const cx = Reactium.Utils.cxFactory(namespace);

    const dismiss = () => Modal.hide();

    const deleteConfirmed = async () => {
        if (status === ENUMS.STATUS.PENDING) return;

        setStatus(ENUMS.STATUS.PENDING);
        await Reactium.Taxonomy.Type.delete({
            objectId: op.get(value, 'objectId'),
        });
        handle.setStatus(ENUMS.STATUS.PENDING, true);
        dismiss();
    };

    const footer = {
        elements: _.compact([
            !op.get(value, 'objectId') ? null : (
                <div className='flex-grow'>
                    <Button
                        className='mr-xs-8'
                        color={Button.ENUMS.COLOR.DANGER}
                        disabled={status === ENUMS.STATUS.PENDING}
                        onClick={() => {
                            active === 0
                                ? carouselRef.current.next()
                                : carouselRef.current.prev();
                        }}
                        style={{ width: 155 }}>
                        {active === 0 ? __('Delete') : __('Cancel')}
                    </Button>
                </div>
            ),
            active !== 0 ? null : (
                <Button
                    color={Button.ENUMS.COLOR.PRIMARY}
                    disabled={status === ENUMS.STATUS.PENDING}
                    onClick={() => submit()}
                    style={{ width: 155 }}>
                    {__('Save Taxonomy')}
                </Button>
            ),
            active !== 1 ? null : (
                <Button
                    color={Button.ENUMS.COLOR.PRIMARY}
                    disabled={status === ENUMS.STATUS.PENDING}
                    onClick={() => deleteConfirmed()}
                    style={{ width: 155 }}>
                    {__('Delete Taxonomy')}
                </Button>
            ),
        ]),
    };

    const header =
        active === 0
            ? {
                  title: op.get(value, 'objectId')
                      ? __('Edit %name').replace(/\%name/gi, value.slug)
                      : __('New Taxonomy'),
              }
            : {
                  title: __('Delete %name').replace(/\%name/gi, value.slug),
              };

    const unMounted = () => !formRef.current;

    const submit = async () => {
        if (status === ENUMS.STATUS.PENDING) return;

        setStatus(ENUMS.STATUS.PENDING);

        const v = formRef.current.getValue();

        let result;

        try {
            result = await formRef.current.submit();
            Toast.show({
                type: Toast.TYPE.INFO,
                message: __('Saved %name').replace(/\%name/gi, v.name),
                icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
            });
        } catch (err) {
            result = { error: err };
            Toast.show({
                type: Toast.TYPE.ERROR,
                message: err.message,
                icon: <Icon.Feather.AlertOctagon style={{ marginRight: 12 }} />,
            });
        }

        setStatus(ENUMS.STATUS.READY);

        if (op.get(result, 'error')) return;

        handle.setStatus(ENUMS.STATUS.PENDING, true);

        if (op.get(v, 'objectId') !== null) dismiss();
        else formRef.current.refs.name.focus();
    };

    return (
        <Dialog
            collapsible={false}
            dismissable
            footer={footer}
            header={header}
            onDismiss={dismiss}>
            <div className={cx('editor')}>
                <Carousel
                    active={active}
                    animationSpeed={0.25}
                    ref={carouselRef}
                    onChange={e => setActive(e.active)}>
                    <Slide>
                        <TaxonomyTypeEditor
                            className={cx('form')}
                            value={value}
                            ref={formRef}
                        />
                    </Slide>
                    <Slide>
                        <div className={cx('confirm')}>
                            <p>
                                {__(
                                    'Are you sure you want to delete %name?',
                                ).replace(/\%name/gi, op.get(value, 'name'))}
                            </p>
                        </div>
                    </Slide>
                </Carousel>
            </div>
        </Dialog>
    );
};

Taxonomy = forwardRef(Taxonomy);

Taxonomy.ENUMS = ENUMS;

Taxonomy.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    onStatus: PropTypes.func,
    title: PropTypes.string,
};

Taxonomy.defaultProps = {
    namespace: 'admin-taxonomy',
    onStatus: noop,
    title: 'Taxonomy',
};

export { Taxonomy, Taxonomy as default };
