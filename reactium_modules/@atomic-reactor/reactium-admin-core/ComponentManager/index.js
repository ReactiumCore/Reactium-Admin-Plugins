import SDK from './sdk';
import _ from 'underscore';
import uuid from 'uuid/v4';
import ENUMS from './enums';
import cn from 'classnames';
import op from 'object-path';
import slugify from 'slugify';
import Editor from './Editor';
import camelcase from 'camelcase';
import PropTypes from 'prop-types';
import Attribute from './Attribute';
import { Scrollbars } from 'react-custom-scrollbars';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import Reactium, {
    __,
    ComponentEvent,
    useWindowSize,
    useDerivedState,
    useEventHandle,
    useHandle,
    useHookComponent,
    useRegisterHandle,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

import React, { forwardRef, useImperativeHandle, useEffect } from 'react';

const noop = () => {};

const parseAttribute = attribute => {
    attribute = String(attribute)
        .trim()
        .includes(' ')
        ? camelcase(attribute)
        : attribute;

    attribute = slugify(attribute, '_');

    return attribute;
};

class SearchIndex {
    constructor(items = []) {
        this.index = items.map(item => {
            const { name, label, uuid } = item;
            const attribute = op
                .get(item, 'attribute', [])
                .join(' ')
                .toLowerCase()
                .split(' ');

            const index = _.chain([name, label, attribute])
                .flatten()
                .compact()
                .value()
                .join(' ')
                .toLowerCase();

            return { index, ref: uuid };
        });
    }

    search(str) {
        str = String(str)
            .trim()
            .toLowerCase();
        return this.index.filter(({ index }) => index.includes(str));
    }
}

/**
 * -----------------------------------------------------------------------------
 * Hook Component: ComponentManager
 * -----------------------------------------------------------------------------
 */
let ComponentManager = (
    { children, className, namespace, onStatus, title, ...props },
    ref,
) => {
    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------
    const refs = useRefs();
    const SearchBar = useHandle('SearchBar');
    const Sidebar = useHandle('AdminSidebar');
    const Helmet = useHookComponent('Helmet');

    // -------------------------------------------------------------------------
    // breakpoint
    // -------------------------------------------------------------------------
    const { breakpoint } = useWindowSize();

    // -------------------------------------------------------------------------
    // Reactium UI Components
    // -------------------------------------------------------------------------
    const { Button, EventForm, Icon, Spinner, Toast } = useHookComponent(
        'ReactiumUI',
    );

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [state, update] = useDerivedState({
        attributes: [],
        components: SDK.list(),
        error: null,
        scrollbar: {},
        search: null,
        sidebar: Date.now(),
        dndID: uuid(),
    });

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------
    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------
    const attr = {
        add: e => {
            const { input, stateKey = 'attributes' } = e;

            const attribute = parseAttribute(input.value);

            if (!attribute || String(attribute).length < 1) {
                if (stateKey === 'attributes') {
                    input.value = '';
                    input.focus();
                }
                return;
            }

            let attributes = op.get(state, stateKey, []) || [];
            attributes.splice(0, 0, attribute);
            attributes = _.chain(attributes)
                .compact()
                .uniq()
                .value();

            const newState = { ...state };
            op.set(newState, stateKey, attributes);
            setState(state, newState);

            input.value = '';
            input.focus();

            dispatch('attribute-add', {
                ...e,
                attribute,
                attributes,
                stateKey,
            });

            return attributes;
        },

        parse: parseAttribute,

        remove: e => {
            const { stateKey = 'attributes' } = e;
            const idx = Number(e.index || e.input.dataset.index);

            const attribute = parseAttribute(e.input.value);

            const attributes = op.get(state, stateKey, []) || [];
            attributes.splice(idx, 1);

            setState({ [stateKey]: attributes });

            dispatch('attribute-remove', {
                ...e,
                attribute,
                attributes,
                stateKey,
            });

            return attributes;
        },
    };

    // cx(suffix:String);
    const cx = Reactium.Utils.cxFactory(className || namespace);

    // dispatch(eventType:String, event:Object, callback:Function);
    const dispatch = async (eventType, event = {}, callback) => {
        if (!_.isObject(event)) {
            throw new Error(
                'dispatch expects 2nd parameter to be of type Object',
            );
        }

        eventType = String(eventType).toLowerCase();

        event = op.get(event, 'type') ? event : { ...event };

        const evt = new ComponentEvent(eventType, event);

        handle.dispatchEvent(evt);

        if (unMounted()) return;
        await Reactium.Hook.run(`component-manager-${eventType}`, evt, handle);

        if (unMounted()) return;
        if (typeof callback === 'function') await callback(evt);
    };

    const filter = () => {
        const { components = {}, index, search } = state;
        const output =
            index && search
                ? index.search(search).map(({ ref }) => op.get(components, ref))
                : Object.values(components);

        return _.sortBy(output, 'name');
    };

    // initialize();
    const initialize = async () => {
        if (isStatus(ENUMS.STATUS.INITIALIZING)) return;

        setStatus(ENUMS.STATUS.INITIALIZING, true);

        const components = await SDK.list(true);

        const index = new SearchIndex(Object.values(components));

        setState({ components, index });

        _.delay(() => setStatus(ENUMS.STATUS.INITIALIZED, true), 500);
    };

    const isEmpty = () =>
        Boolean(Object.keys(op.get(state, 'components', {})).length < 1);

    const isError = field => Boolean(op.get(state.error, 'field') === field);

    const toggleSearch = () => {
        SearchBar.setState({ visible: !isEmpty() });
    };

    // unMounted();
    const unMounted = () => !refs.get('container');

    const _onAfterSave = () =>
        Toast.show({
            type: Toast.TYPE.INFO,
            message: __('Saved Components'),
            icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
        });

    const _onCreate = e => {
        const { value } = e;
        const form = refs.get('creator');
        const inputs = refs.get('create');

        // validate
        if (!op.get(value, 'name')) {
            const error = {
                field: 'name',
                message: __('enter component name'),
            };

            setState({ error });
            if (op.get(inputs, 'name')) {
                inputs.name.focus();
            }
            return;
        }

        // format attributes
        const attribute = _.chain([op.get(value, 'attribute')])
            .flatten()
            .compact()
            .uniq()
            .value();

        op.set(value, 'attribute', attribute);
        op.set(value, 'uuid', uuid());

        // optimistically update components
        const { components = {} } = state;
        op.set(components, value.uuid, value);

        // update the index
        const index = new SearchIndex(Object.values(components));

        // clear attributes and error
        setState({ attributes: [], index, error: null });

        // clear form
        form.setValue(null);

        // focus on name field
        if (op.get(inputs, 'name')) {
            inputs.name.focus();
        }

        // Save the components setting
        return SDK.add(value).then(newComponents => {
            if (unMounted()) return;
            setState({ components: newComponents });
            _.defer(() => dispatch('create', e));
            return newComponents;
        });
    };

    const _onDelete = e => {
        const { uuid } = e;
        const components = op.get(state, 'components');

        // optimistically delete the component
        op.del(components, uuid);

        // update the index
        const index = new SearchIndex(Object.values(components));

        setState({ components, index });

        return SDK.delete(uuid).then(newComponents => {
            if (unMounted()) return;
            handle.refs.del(`editor.${uuid}`);
            setState({ components: newComponents });
            _.defer(() => dispatch('delete', e));

            return newComponents;
        });
    };

    const _onDisable = uuid => {
        // disable all other editors
        Object.entries(handle.refs.get('editor')).forEach(([id, editor]) => {
            if (id === uuid || !editor) return;
            editor.disable();
        });
    };

    const _onReorder = e => {
        const end = op.get(e, 'destination.index');
        const start = op.get(e, 'source.index');

        if (typeof end === 'undefined') return;

        const attributes = JSON.parse(
            JSON.stringify(op.get(state, 'attributes', [])),
        );

        const [citem] = attributes.splice(start, 1);
        attributes.splice(end, 0, citem);

        setState({ attributes });
    };

    const _onResize = e => {
        switch (breakpoint) {
            case 'sm':
                setState({
                    scrollbar: {
                        autoHeight: true,
                        autoHeightMin: 73,
                        autoHeightMax: 147,
                    },
                });
                break;

            case 'md':
                if (e.type === 'toggle') {
                    if (Sidebar.isCollapsed()) {
                        setState({
                            scrollbar: {
                                autoHeight: true,
                                autoHeightMin: 73,
                                autoHeightMax: '50vh',
                            },
                        });
                    } else {
                        setState({ scrollbar: {} });
                    }
                } else {
                    if (Sidebar.isExpanded()) {
                        setState({
                            scrollbar: {
                                autoHeight: true,
                                autoHeightMin: 73,
                                autoHeightMax: '50vh',
                            },
                        });
                    } else {
                        setState({ scrollbar: {} });
                    }
                }
                break;

            default:
                setState({ scrollbar: {} });
        }

        _.defer(() => dispatch('resize', e));
    };

    const _onSave = (newComponents = {}) => {
        const currentComponents = op.get(state, 'components', {});
        Object.entries(refs.get('editor')).forEach(([uuid, editor]) => {
            const val = editor.form.getValue();
            const attribute = _.chain([op.get(val, 'attribute', [])])
                .flatten()
                .compact()
                .uniq()
                .value();
            val.attribute = attribute;
            op.set(currentComponents, uuid, val);
        });

        const components = { ...currentComponents, ...newComponents };

        setState({ components });

        return SDK.save(components).then(results => {
            // update the index
            const index = new SearchIndex(Object.values(components));

            setState({ components: results, index });
            _.defer(() => dispatch('save'));

            return results;
        });
    };

    const _onSearch = () => {
        setState({ search: SearchBar.state.value });
    };

    const _onStatusChange = () => {
        dispatch('status', { status }, onStatus);

        switch (status) {
            case ENUMS.STATUS.PENDING:
                initialize();
                break;

            case ENUMS.STATUS.INITIALIZED:
                setStatus(ENUMS.STATUS.READY);
                break;
        }
    };

    // -------------------------------------------------------------------------
    // Handle
    // -------------------------------------------------------------------------
    const _handle = () => ({
        ENUMS,
        add: _onCreate,
        attribute: attr,
        children,
        className,
        cx,
        delete: _onDelete,
        disable: _onDisable,
        dispatch,
        initialize,
        isEmpty,
        isError,
        isStatus,
        namespace,
        props,
        refs,
        save: _onSave,
        setState,
        setStatus,
        state,
        status,
        unMounted,
    });
    const [handle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);

    useRegisterHandle('ComponentManager', () => handle, [handle]);

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------
    // Status change
    useEffect(_onStatusChange, [status]);

    // Window resize
    useEffect(() => _onResize(new Event('resize')), [breakpoint]);

    // SearchBar hide/show
    useEffect(toggleSearch, [SearchBar, isEmpty()]);

    useEffect(_onSearch, [op.get(SearchBar, 'state.value')]);

    // Sidebar toggle
    useEffect(() => {
        if (!Sidebar) return;
        Sidebar.addEventListener('toggle', _onResize);

        return () => {
            Sidebar.removeEventListener('toggle', _onResize);
        };
    }, [Sidebar]);

    // On Save
    useEffect(() => {
        handle.addEventListener('save', _onAfterSave);

        return () => {
            handle.removeEventListener('save', _onAfterSave);
        };
    }, []);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div className={cx()}>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <EventForm
                onSubmit={_onCreate}
                className={cx('creator')}
                ref={elm => refs.set('creator', elm)}>
                <div className='info'>
                    <h3>{__('New Component')}</h3>

                    <div
                        className={cn('form-group', {
                            error: isError('name'),
                        })}>
                        <input
                            type='text'
                            name='name'
                            placeholder='Component'
                            ref={elm => refs.set('create.name', elm)}
                        />
                        {isError('name') && (
                            <small>{state.error.message}</small>
                        )}
                    </div>

                    <div className='form-group'>
                        <input
                            type='text'
                            name='label'
                            placeholder='Label'
                            ref={elm => refs.set('create.label', elm)}
                        />
                    </div>
                </div>

                <Attribute
                    color={Button.ENUMS.COLOR.TERTIARY}
                    icon='Feather.Plus'
                    label={__('Attributes')}
                    onClick={attr.add}
                />

                <div className='attributes' id='attributes-1'>
                    <Scrollbars {...state.scrollbar}>
                        <DragDropContext onDragEnd={_onReorder}>
                            <Droppable
                                droppableId={state.dndID}
                                direction='vertical'>
                                {provided => (
                                    <ul
                                        key='attributes'
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}>
                                        {Object.values(state.attributes).map(
                                            (item, i) => (
                                                <Attribute
                                                    key={`attribute-${
                                                        state.dndID
                                                    }-${btoa(item)}`}
                                                    onClick={attr.remove}
                                                    icon='Feather.X'
                                                    name='attribute'
                                                    type='list-item'
                                                    color='danger'
                                                    value={item}
                                                    index={i}
                                                />
                                            ),
                                        )}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </Scrollbars>
                </div>

                <div className='footer'>
                    <Button block size={Button.ENUMS.SIZE.MD} type='submit'>
                        {__('Add Component')}
                    </Button>
                </div>
            </EventForm>
            <div className={cx('list')} ref={elm => refs.set('container', elm)}>
                {filter().map((item, i) => (
                    <Editor
                        {...item}
                        index={i}
                        key={item.uuid}
                        ref={elm => refs.set(`editor.${item.uuid}`, elm)}
                    />
                ))}
                {isStatus(ENUMS.STATUS.INITIALIZING) && <Spinner />}
            </div>
        </div>
    );
};

ComponentManager = forwardRef(ComponentManager);

ComponentManager.ENUMS = ENUMS;

ComponentManager.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    onStatus: PropTypes.func,
};

ComponentManager.defaultProps = {
    namespace: 'admin-components',
    onStatus: noop,
    title: __('Components'),
};

export { ComponentManager, ComponentManager as default };
