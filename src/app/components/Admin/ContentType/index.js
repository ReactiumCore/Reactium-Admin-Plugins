import React, { useRef, useState, useEffect, useReducer, memo } from 'react';
import TypeName from './TypeName';
import Fields from './Fields';
import Tools from './Tools';
import Reactium, {
    __,
    useAsyncEffect,
    useRegisterHandle,
    useHandle,
} from 'reactium-core/sdk';
import { Icon, Spinner } from '@atomic-reactor/reactium-ui';
import { EventForm } from 'components/EventForm';
import cn from 'classnames';
import op from 'object-path';
import { DragDropContext } from 'react-beautiful-dnd';
import uuid from 'uuid/v4';
import _ from 'underscore';
import CTCapabilityEditor from './Capabilities';

export const slugify = name => {
    if (!name) return '';

    return require('slugify')(name, {
        replacement: '_', // replace spaces with replacement
        remove: /[^A-Za-z0-9_\s]/g, // regex to remove characters
        lower: true, // result in lower case
    });
};

const Loading = () => {
    const style = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 'calc(100vh - 60px)',
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={style} className='flex center middle'>
                <Spinner />
            </div>
        </div>
    );
};

const UI = {
    CLEAR: 'CLEAR',
    LOAD: 'LOAD',
    LOADED: 'LOADED',
    ADD_FIELD: 'ADD_FIELD',
    REMOVE_FIELD: 'REMOVE_FIELD',
    MOVE_FIELD: 'MOVE_FIELD',
    SET_ACTIVE: 'SET_ACTIVE',
    ADD_REGION: 'ADD_REGION',
    LABEL_REGION: 'LABEL_REGION',
    REMOVE_REGION: 'REMOVE_REGION',
    ERROR: 'ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

const uiReducer = (ui = {}, action) => {
    // console.log('uiReducer', { action, ui });
    const fields = { ...op.get(ui, 'fields', {}) };
    const regions = { ...op.get(ui, 'regions', {}) };
    const regionFields = { ...op.get(ui, 'regionFields', {}) };

    switch (action.type) {
        case UI.CLEAR: {
            return {
                ...ui,
                fields: {},
                regions: { ...op.get(ui, 'requiredRegions', {}) },
                active: 'default',
                loading: true,
                error: {},
            };
        }
        case UI.ADD_FIELD: {
            const { region, field } = action;
            const { fieldId } = field;

            return {
                ...ui,
                fields: {
                    ...fields,
                    [fieldId]: field,
                },
                regionFields: {
                    ...regionFields,
                    [region]: [...op.get(regionFields, [region], []), fieldId],
                },
            };
        }

        case UI.REMOVE_FIELD: {
            const { fieldId } = action;
            const field = op.get(fields, [fieldId], {});
            const region = op.get(field, 'region');

            op.set(
                regionFields,
                region,
                op.get(regionFields, [region], []).filter(id => id !== fieldId),
            );
            op.del(fields, [fieldId]);

            return {
                ...ui,
                fields,
                regionFields,
            };
        }

        case UI.LOAD: {
            const newRegions = {
                ...op.get(ui, 'requiredRegions'),
                ...action.regions,
            };

            const newFields = { ...action.fields };
            const regionFields = _.groupBy(Object.values(newFields), 'region');
            Object.entries(regionFields).forEach(([region, fields]) => {
                op.set(
                    regionFields,
                    region,
                    fields.map(({ fieldId }) => fieldId),
                );
            });

            return {
                ...ui,
                regions: newRegions,
                fields: newFields,
                regionFields,
            };
        }

        case UI.LOADED: {
            return {
                ...ui,
                loading: false,
            };
        }

        case UI.ADD_REGION: {
            const { id } = action.region;
            return {
                ...ui,
                regions: {
                    ...regions,
                    [id]: action.region,
                },
                active: id,
            };
        }

        case UI.ADD_REGION: {
            const id = action.region;
            op.del(regions, [id]);
            const rfs = op.get(regionFields, [id], []);
            op.set(
                regionFields,
                'default',
                _.compact(op.get(regionFields, 'default', []).concat(rfs)),
            );

            return {
                ...ui,
                regions,
                regionFields,
                active: id === ui.active ? 'default' : ui.active,
            };
        }

        case UI.SET_ACTIVE: {
            return {
                ...ui,
                active: action.region,
            };
        }

        case UI.LABEL_REGION: {
            const { id, label } = action;

            return {
                ...ui,
                regions: {
                    ...regions,
                    [id]: {
                        ...regions[id],
                        label,
                        slug: slugify(label),
                    },
                },
            };
        }

        case UI.MOVE_FIELD: {
            const { fieldId, source, destination } = action;

            regionFields[source.region].splice(source.index, 1);
            if (op.has(regionFields, [destination.region]))
                regionFields[destination.region].splice(
                    destination.index,
                    0,
                    fieldId,
                );
            else regionFields[destination.region] = [fieldId];

            return {
                ...ui,
                regionFields,
            };
        }

        case UI.ERROR: {
            return {
                ...ui,
                error: action.error,
            };
        }

        case UI.CLEAR_ERROR: {
            return {
                ...ui,
                error: {},
            };
        }
    }

    return ui;
};

const noop = () => {};
const getStubRef = () => ({ getValue: () => ({}), setValue: noop });
const ContentType = props => {
    const fieldTypes = _.indexBy(
        Object.values(Reactium.ContentType.FieldType.list),
        'type',
    );
    const id = op.get(props, 'params.id', 'new');
    const Enums = op.get(props, 'Enums', {});

    const REQUIRED_REGIONS = op.get(Enums, 'REQUIRED_REGIONS', {});
    const [ui, dispatch] = useReducer(uiReducer, {
        fields: {},
        regions: REQUIRED_REGIONS,
        requiredRegions: REQUIRED_REGIONS,
        regionFields: {},
        active: 'default',
        error: {},
    });

    const _empty = () => ({
        type: undefined,
        regions: REQUIRED_REGIONS,
        fields: {},
        meta: {},
    });

    const tools = useHandle('AdminTools');
    const Toast = op.get(tools, 'Toast');

    const parentFormRef = useRef();
    const formsRef = useRef({});

    const [types, setTypes] = useState([]);

    // Generic State Update to cause rerender
    const [updated, update] = useState(new Date());

    // Content Type Data
    const savedRef = useRef();
    const ctRef = useRef(_empty());
    const getValue = () => ctRef.current;
    const saved = () => savedRef.current;

    const getTypes = refresh => Reactium.ContentType.types(refresh);

    useEffect(() => {
        clear();
        if (id === 'new') {
            const autoIncludes = Object.values(fieldTypes).filter(fieldType =>
                op.get(fieldType, 'autoInclude', false),
            );

            for (const type of autoIncludes) {
                addField(type.type);
            }

            dispatch({
                type: UI.LOADED,
            });
        } else {
            load();
        }
    }, [id]);

    useAsyncEffect(
        async mounted => {
            const results = await getTypes(true);
            if (mounted()) setTypes(results);

            return Reactium.Cache.subscribe('content-types', async ({ op }) => {
                if (['set', 'del'].includes(op) && mounted() === true) {
                    update(Date.now());
                }
            });
        },
        [updated],
    );

    const clear = () => {
        savedRef.current = {};

        dispatch({
            type: UI.CLEAR,
        });

        ctRef.current = _empty();
    };

    const _cloneContentType = (contentType = {}) => {
        return {
            ...contentType,
            regions: {
                ...op.get(contentType, 'regions', {}),
            },
            fields: {
                ...op.get(contentType, 'fields', {}),
            },
            meta: {
                ...op.get(contentType, 'meta', {}),
            },
        };
    };

    const load = async () => {
        try {
            const contentType = await Reactium.ContentType.retrieve(id);
            const label = op.get(contentType, 'meta.label', contentType.type);
            op.set(contentType, 'type', label);

            dispatch({
                type: UI.LOAD,
                fields: op.get(contentType, 'fields', {}),
                regions: op.get(contentType, 'regions', {}),
            });

            savedRef.current = _cloneContentType(contentType);
            ctRef.current = _cloneContentType(contentType);
            dispatch({
                type: UI.LOADED,
            });
        } catch (error) {
            Toast.show({
                type: Toast.TYPE.ERROR,
                message: __('Error loading content type.'),
                icon: <Icon.Feather.AlertOctagon style={{ marginRight: 12 }} />,
                autoClose: 1000,
            });
            console.error(error);
            Reactium.Routing.history.push('/admin/type/new');
        }
    };

    const setRegionLabel = regionId => label => {
        dispatch({
            type: UI.LABEL_REGION,
            id: regionId,
            label,
        });
    };

    const getRegions = () => op.get(ui, 'regions', {});

    const getOrderedRegions = () => {
        const regions = getRegions();
        return _.sortBy(
            Object.values(regions).map(region => {
                // TODO: Make these rearrangable
                const order = op.get(
                    REQUIRED_REGIONS,
                    [region.id, 'order'],
                    op.get(region, 'order', 0),
                );
                return {
                    ...region,
                    order,
                };
            }),
            'order',
        );
    };

    const validator = async context => {
        let { valid, error, value } = context;
        dispatch({
            type: UI.CLEAR_ERROR,
        });

        const responseContext = await Reactium.Hook.run(
            'content-type-validate-fields',
        );

        // type labels that are currently used
        const taken = types
            .filter(({ uuid }) => uuid !== id)
            .reduce((takenLabels, { type, meta }) => {
                return _.compact(
                    _.uniq(
                        takenLabels.concat([
                            slugify(type),
                            slugify(op.get(meta, 'label', '')),
                        ]),
                    ),
                );
            }, []);

        const typeString = op.get(context, 'value.type', '') || '';
        const typeSlug = slugify(typeString);

        const nameTakenError = __('Type name taken.');
        if (taken.includes(typeSlug)) {
            valid = false;
            op.set(error, 'type.field', 'type');
            op.set(error, 'type.message', nameTakenError);

            Toast.show({
                type: Toast.TYPE.ERROR,
                message: nameTakenError,
                icon: <Icon.Feather.AlertOctagon style={{ marginRight: 12 }} />,
                autoClose: 1000,
            });
        }

        const fieldSlugs = {};
        let savedFields = {};
        if (op.has(saved(), ['fields'])) {
            savedFields = saved().fields;
            savedFields = _.indexBy(
                Object.values(savedFields).map(field => ({
                    id: field.id,
                    fieldSlug: slugify(field.fieldName),
                    fieldType: field.fieldType,
                })),
                'fieldSlug',
            );
        }

        for (const [fieldId, uiFT] of Object.entries(
            op.get(ui, 'fields', {}),
        )) {
            const ref = getFormRef(fieldId);
            if (!ref) continue;

            const ftContext = op.get(responseContext, fieldId, {
                valid: true,
                error: {},
                value: ref.getValue(),
            });

            // collect results of fields hook
            if (!ftContext.valid) {
                error = {
                    ...error,
                    [fieldId]: ftContext.error,
                };

                ref.setState({
                    error: ftContext.error,
                    status: EventForm.ENUMS.ERROR,
                });
                valid = false;
            }

            // Check for duplicate fieldName
            const fieldName = op.get(ftContext, 'value.fieldName');
            const fieldType = op.get(uiFT, 'fieldType');
            const slug = slugify(fieldName).toLowerCase();
            if (fieldName && slug in fieldSlugs) {
                const errorMessage = __(
                    'Duplicate field name %fieldName',
                ).replace('%fieldName', fieldName);

                Toast.show({
                    type: Toast.TYPE.ERROR,
                    message: errorMessage,
                    icon: (
                        <Icon.Feather.AlertOctagon
                            style={{ marginRight: 12 }}
                        />
                    ),
                    autoClose: 1000,
                });

                op.set(error, [fieldId, 'fieldName', 'field'], 'fieldName');
                op.set(error, [fieldId, 'fieldName', 'message'], errorMessage);
                valid = false;

                ref.setState({
                    error: op.get(error, [fieldId, 'fieldName']),
                    status: EventForm.ENUMS.ERROR,
                });
            }
            fieldSlugs[slug] = fieldId;

            // check to make sure UI version of field type matches saved
            if (
                op.has(savedFields, slug) &&
                fieldType !== op.get(savedFields, [slug, 'fieldType'])
            ) {
                const errorMessage = __(
                    'Field name %fieldName type exists.',
                ).replace('%fieldName', fieldName);
                Toast.show({
                    type: Toast.TYPE.ERROR,
                    message: errorMessage,
                    icon: (
                        <Icon.Feather.AlertOctagon
                            style={{ marginRight: 12 }}
                        />
                    ),
                    autoClose: 2000,
                });

                op.set(error, [fieldId, 'fieldName', 'field'], 'fieldName');
                op.set(error, [fieldId, 'fieldName', 'message'], errorMessage);
                valid = false;

                ref.setState({
                    error: op.get(error, [fieldId, 'fieldName']),
                    status: EventForm.ENUMS.ERROR,
                });
            }
        }

        const regionSlugs = Object.values(getRegions()).reduce(
            (slugs, { id, slug }) => ({ ...slugs, [slug]: id }),
            {},
        );

        if (
            _.compact(Object.keys(regionSlugs)).length !==
            Object.values(getRegions()).length
        )
            valid = false;

        return { error, valid, value };
    };

    const onError = async e => {
        dispatch({
            type: UI.ERROR,
            error: e.error,
        });
    };

    const onDragEnd = result => {
        const fieldId = op.get(result, 'draggableId');
        const sourceIndex = op.get(result, 'source.index');
        const sourceRegion = op.get(result, 'source.droppableId');
        const destinationIndex = op.get(result, 'destination.index');
        const destinationRegion = op.get(result, 'destination.droppableId');

        if (
            sourceIndex === destinationIndex &&
            sourceRegion === destinationRegion
        )
            return;

        dispatch({
            type: UI.MOVE_FIELD,
            fieldId,
            source: {
                region: sourceRegion,
                index: sourceIndex,
            },
            destination: {
                region: destinationRegion,
                index: destinationIndex,
            },
        });
    };

    const onTypeChange = async e => {
        if (!ui.loading && e.value) {
            const value = e.value;
            ctRef.current = {
                ...ctRef.current,
                ...value,
            };

            await Reactium.Hook.run('content-type-form-change', {
                value,
                id,
                handle: _handle(),
                target: e.target,
            });
        }
    };

    const onTypeSubmit = async e => {
        const value = parentFormRef.current.getValue();
        op.set(value, 'regions', getRegions());

        Object.entries(ui.fields).forEach(([fieldId, def]) => {
            const ref = getFormRef(fieldId);
            if (ref) {
                const fieldValue = ref.getValue();
                const fieldName = op.get(fieldValue, 'fieldName');
                const fieldType = op.get(def, 'fieldType');
                const [region] = Object.entries(
                    op.get(ui, 'regionFields', {}),
                ).find(([region, ids]) => ids.includes(fieldId));

                op.set(value, ['fields', fieldId], {
                    ...fieldValue,
                    fieldId,
                    fieldName,
                    fieldType,
                    region,
                });
            }
        });

        try {
            const contentType = await Reactium.ContentType.save(id, value);
            const label = op.get(contentType, 'meta.label', contentType.type);
            op.set(contentType, 'type', label);

            dispatch({
                type: UI.LOAD,
                fields: op.get(contentType, 'fields', {}),
                regions: op.get(contentType, 'regions', {}),
            });

            savedRef.current = _cloneContentType(contentType);
            ctRef.current = _cloneContentType(contentType);
            dispatch({
                type: UI.LOADED,
            });

            Toast.show({
                type: Toast.TYPE.SUCCESS,
                message: __('Content type saved'),
                icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
                autoClose: 1000,
            });

            if (id === 'new' && contentType.uuid) {
                Reactium.Routing.history.push(
                    `/admin/type/${contentType.uuid}`,
                );
            }
        } catch (error) {
            Toast.show({
                type: Toast.TYPE.ERROR,
                message: __('Error saving content type.'),
                icon: <Icon.Feather.AlertOctagon style={{ marginRight: 12 }} />,
                autoClose: 1000,
            });
            console.error(error);
        }
    };

    const renderCapabilityEditor = () => {
        if (isNew() || ui.loading) return null;

        const { collection, machineName } = getValue();
        const label = op.get(getValue(), 'meta.label');
        return (
            <CTCapabilityEditor
                key={`ct-caps-${id}`}
                type={label}
                collection={collection}
                machineName={machineName}
                ctRef={ctRef}
            />
        );
    };

    //
    // Handle Interface
    //
    const addRegion = () => {
        const id = uuid();
        const region = { id, label: id, slug: id, order: 0 };

        dispatch({
            type: UI.ADD_REGION,
            region,
        });
    };

    const removeRegion = region => {
        if (Object.keys(REQUIRED_REGIONS).includes(region)) return;

        dispatch({
            type: UI.REMOVE_REGION,
            region,
        });
    };

    const setActiveRegion = region => {
        if (region !== ui.active) {
            dispatch({
                type: UI.SET_ACTIVE,
                region,
            });
        }
    };

    const addField = ft => {
        const fields = op.get(ui, 'fields', {});
        const fieldsByType = _.groupBy(Object.values(fields), 'fieldType');
        const activeRegion = op.get(ui, 'active', 'default');
        const fieldType = fieldTypes[ft];
        const region = op.get(fieldType, 'defaultRegion', activeRegion);

        // Only 1 per singular type
        if (op.get(fieldType, 'singular', false) && op.has(fieldsByType, ft))
            return;

        const fieldId = op.get(fieldType, 'id', uuid());

        const field = { fieldId, fieldType: ft, region };

        if (op.has(fieldType, 'defaultValues'))
            op.set(ctRef.current, ['fields', fieldId], fieldType.defaultValues);

        dispatch({
            type: UI.ADD_FIELD,
            region,
            field,
        });
    };

    const removeField = fieldId => {
        dispatch({
            type: UI.REMOVE_FIELD,
            fieldId,
        });
    };

    const _fieldChangeHandler = id => e => {
        if (ui.loading) return;

        if (
            e.value &&
            !_.isEqual(e.value, op.get(getValue(), ['fields', id]))
        ) {
            const value = { ...getValue() };
            const field = { ...op.get(value, ['fields', id], {}), ...e.value };
            op.set(value, ['fields', id], field);
        }
    };

    const _subFormHandlers = (id, ref) => {
        const handlers = {
            change: _fieldChangeHandler(id),
        };

        Object.entries(handlers).forEach(([type, cb]) => {
            ref().addEventListener(type, cb);
        });

        return () => {
            Object.entries(handlers).forEach(([type, cb]) => {
                ref().removeEventListener(type, cb);
            });
        };
    };

    const addFormRef = (id, cb) => {
        const form = cb();
        const existing = op.get(formsRef.current, id);

        if (existing) return;

        formsRef.current[id] = {
            ref: cb,
            unsub: _subFormHandlers(id, cb),
        };
    };

    const removeFormRef = id => {
        if (op.has(formsRef.current, [id])) {
            const subForm = formsRef.current[id];
            subForm.unsub();
        }
        op.del(formsRef.current, [id]);
    };

    const getFormRef = id =>
        op.get(formsRef.current, [id, 'ref'], getStubRef)();

    const getFormErrors = id => op.get(ui.error, [id]);

    const clearDelete = async () => {
        clear();

        if (id !== 'new') {
            try {
                await Reactium.ContentType.delete(id);

                Toast.show({
                    type: Toast.TYPE.SUCCESS,
                    message: __('Content type deleted.'),
                    icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
                    autoClose: 1000,
                });

                Reactium.Routing.history.push('/admin/type/new');
            } catch (error) {
                Toast.show({
                    type: Toast.TYPE.ERROR,
                    message: __('Error deleting content type.'),
                    icon: (
                        <Icon.Feather.AlertOctagon
                            style={{ marginRight: 12 }}
                        />
                    ),
                    autoClose: 1000,
                });
                console.error(error);
                return;
            }
        }
    };

    const isNew = () => id === 'new';

    const isActiveRegion = region => ui.active === region;

    const _handle = () => ({
        ui,
        addRegion,
        removeRegion,
        addField,
        removeField,
        addFormRef,
        removeFormRef,
        parentFormRef,
        getFormRef,
        getFormErrors,
        clearDelete,
        isActiveRegion,
        isNew,
        id,
        getValue,
        saved,
        setActiveRegion,
    });

    useRegisterHandle('ContentTypeEditor', _handle, [id, ui]);

    if (ui.loading) return <Loading />;

    return (
        <div
            className={cn(
                'type-editor',
                slugify(`type-editor ${id}`).toLowerCase(),
            )}>
            <EventForm
                ref={parentFormRef}
                onSubmit={onTypeSubmit}
                onChange={onTypeChange}
                onError={onError}
                value={getValue()}
                className={'webform webform-content-type'}
                required={['type']}
                validator={validator}>
                <TypeName id={id} error={ui.error['type']} />
            </EventForm>

            <DragDropContext onDragEnd={onDragEnd}>
                {getOrderedRegions().map(region => (
                    <Fields
                        key={region.id}
                        onRegionLabelChange={setRegionLabel(region.id)}
                        onRemoveRegion={() => removeRegion(region.id)}
                        region={region}
                    />
                ))}
            </DragDropContext>
            <Tools enums={Enums} />
            {renderCapabilityEditor()}
        </div>
    );
};

export default ContentType;
