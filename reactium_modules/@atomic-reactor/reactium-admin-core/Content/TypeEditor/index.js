import React, { useRef, useEffect, useState } from 'react';
import Enums from './enums';
import TypeName from './TypeName';
import Fields from './Fields';
import Tools from './Tools';
import cn from 'classnames';
import op from 'object-path';
import { DragDropContext } from 'react-beautiful-dnd';
import uuid from 'uuid/v4';
import _ from 'underscore';
import CTCapabilityEditor from './Capabilities';
import Reactium, {
    __,
    useAsyncEffect,
    useHookComponent,
    useDispatcher,
    useEventEffect,
} from 'reactium-core/sdk';

import { useRouteParams, useAttachHandle } from 'reactium-admin-core';

const REQUIRED_REGIONS = op.get(Enums, 'REQUIRED_REGIONS', {});

const getToast = () => Reactium.State.Tools.Toast;

export const slugify = name => {
    return !name
        ? ''
        : require('slugify')(name, {
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
    const { Spinner } = useHookComponent('ReactiumUI');
    return (
        <div style={{ position: 'relative' }}>
            <div style={style} className='flex center middle'>
                <Spinner />
            </div>
        </div>
    );
};

const ACTIONS = {
    CLEAR: 'CLEAR',
    LOAD: 'LOAD',
    LOADED: 'LOADED',
    TYPE_CHANGE: 'TYPE_CHANGE',
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

const uiReducer = (ui = {}, { ACTION_TYPE, ...action }) => {
    const fields = { ...op.get(ui, 'fields', {}) };
    const regions = { ...op.get(ui, 'regions', {}) };
    const regionFields = { ...op.get(ui, 'regionFields', {}) };

    switch (ACTION_TYPE) {
        case ACTIONS.CLEAR: {
            return {
                regions: { ...REQUIRED_REGIONS },
                fields: {},
                meta: {},
                active: 'default',
                loading: true,
                error: {},
            };
        }
        case ACTIONS.ADD_FIELD: {
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

        case ACTIONS.REMOVE_FIELD: {
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

        case ACTIONS.LOAD: {
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
                ...action,
                regions: {
                    ...action.regions,
                    ...REQUIRED_REGIONS,
                },
                fields: newFields,
                regionFields,
            };
        }

        case ACTIONS.LOADED: {
            return {
                ...ui,
                loading: false,
            };
        }

        case ACTIONS.TYPE_CHANGE: {
            return {
                ...ui,
                ...action,
                meta: {
                    ...ui.meta,
                    ...action.meta,
                },
            };
        }

        case ACTIONS.ADD_REGION: {
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

        case ACTIONS.ADD_REGION: {
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

        case ACTIONS.SET_ACTIVE: {
            return {
                ...ui,
                active: action.region,
            };
        }

        case ACTIONS.LABEL_REGION: {
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

        case ACTIONS.MOVE_FIELD: {
            const { fieldId, source, destination } = action;
            const rf = { ...regionFields };

            rf[source.region].splice(source.index, 1);
            if (op.has(rf, [destination.region]))
                rf[destination.region].splice(destination.index, 0, fieldId);
            else rf[destination.region] = [fieldId];

            return {
                ...ui,
                regionFields: { ...rf },
            };
        }

        case ACTIONS.ERROR: {
            return {
                ...ui,
                error: action.error,
            };
        }

        case ACTIONS.CLEAR_ERROR: {
            return {
                ...ui,
                error: {},
            };
        }
    }

    return ui;
};

/**
 * Wrapper for naive uiReducer, which assumes all the fields are behaving.
 * This reducer does not, and sanitize out any wonky field definition data,
 * such as undefined or missing field type.
 * Also cleans up regions of any field ids that don't exist.
 */
const sanitizingUIReducer = (state = {}, action) => {
    const ui = uiReducer(state, action);
    const fieldTypes = _.indexBy(
        Object.values(Reactium.ContentType.FieldType.list),
        'type',
    );

    Reactium.Hook.runSync('content-type-field-type-list', fieldTypes);

    // Clean up fields
    const fields = op.get(ui, 'fields', {});
    Object.entries(fields).forEach(([fieldId, field]) => {
        // remove fields missing essential information or of unknown type
        if (
            !op.has(field, 'fieldType') ||
            !op.has(fieldTypes, field.fieldType)
        ) {
            op.del(fields, fieldId);
        }
    });

    // Clean up fields in regions
    const regionFields = op.get(ui, 'regionFields', {});
    Object.entries(regionFields).forEach(([region, ids = []]) => {
        // remove any fields that don't exist from region
        op.set(
            regionFields,
            region,
            ids.filter(id => id in fields),
        );
    });

    return ui;
};

/*
 * Replaces useReducer, pass it an object with values that are event types to listen for
 * Returns the current state from the ReactiumSyncState EventTarget and dispatch function
 * call dispatch(EVENT_TYPE, ACTION = {}, update = true) to trigger reducer to update new state
 * By default this will trigger a rerender on any sync state subscribers,
 */
const debug = false;
const useTargetReducer = (state, reducer, ACTION_TYPES = {}) => {
    const eventHandlers = Object.values(ACTION_TYPES).reduce(
        (eventHandlers, ACTION_TYPE) => {
            eventHandlers[ACTION_TYPE] = e => {
                debug &&
                    console.log(
                        `Event ACTION_TYPE ${ACTION_TYPE}`,
                        e.ACTION,
                        `Rerender: ${e.doUpdate}`,
                    );
                const ct = reducer(state.get('ct'), e.ACTION);
                state.set({ ...state.get(), ct }, undefined, e.doUpdate);
            };

            return eventHandlers;
        },
        {},
    );

    useEventEffect(state, eventHandlers, [state]);

    const dispatcher = useDispatcher({ state, props: {} });
    return (ACTION_TYPE, ACTION = {}, doUpdate = true) => {
        dispatcher(ACTION_TYPE, {
            ACTION: { ACTION_TYPE, ...ACTION },
            doUpdate,
        });
    };
};

const noop = () => {};
const getStubRef = () => ({ getValue: () => ({}), setValue: noop });
const ContentType = props => {
    const params = useRouteParams();
    const id = op.get(params, 'id', 'new');

    const CTE = useAttachHandle('CTE');
    CTE.extend('getValue', CTE.get); // legacy handle
    const dispatch = useTargetReducer(CTE, sanitizingUIReducer, ACTIONS);
    const isLoading = () => CTE.get('ct.loading', true);

    const load = async id => {
        try {
            const contentType = await Reactium.ContentType.retrieve(id);
            const label = op.get(contentType, 'meta.label', contentType.type);
            op.set(contentType, 'type', label);
            dispatch(ACTIONS.LOAD, contentType, false);
        } catch (error) {
            const Toast = getToast();
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

    useAsyncEffect(async () => {
        dispatch(ACTIONS.CLEAR, {}, false);
        if (id !== 'new') {
            await load(id);
        }

        dispatch(ACTIONS.LOADED);
    }, [id]);

    const {
        Form,
        FormContext, // New Form Stuff
        EventForm,
        Icon,
    } = useHookComponent('ReactiumUI');

    const fieldTypes = _.indexBy(
        Object.values(Reactium.ContentType.FieldType.list),
        'type',
    );

    Reactium.Hook.runSync('content-type-field-type-list', fieldTypes);

    const _empty = () => ({
        type: undefined,
        regions: REQUIRED_REGIONS,
        fields: {},
        meta: {},
    });

    const parentFormRef = useRef();
    const formsRef = useRef({});

    const types = CTE.get('types');
    CTE.extend('setTypes', types => CTE.set('types', types));
    const setTypes = CTE.setTypes;

    // Generic State Update to cause rerender
    const updated = CTE.get('ct.updated');
    CTE.extend('update', types => CTE.set('ct.updated', new Date()));
    const update = CTE.update;

    useAsyncEffect(
        async mounted => {
            const results = await Reactium.ContentType.types();
            if (mounted()) setTypes(results);

            return Reactium.Cache.subscribe('content-types', async ({ op }) => {
                if (['set', 'del'].includes(op) && mounted() === true) {
                    update(Date.now());
                }
            });
        },
        [updated],
    );

    useEffect(() => {
        if (isLoading()) return;

        Reactium.Hotkeys.register('content-type-save', {
            callback: saveHotkey,
            key: 'mod+s',
            order: Reactium.Enums.priority.lowest,
            scope: document,
        });

        return () => {
            Reactium.Hotkeys.unregister('content-type-save');
        };
    }, [isLoading()]);

    if (isLoading()) return <Loading />;

    const setRegionLabel = regionId => label => {
        dispatch(ACTIONS.LABEL_REGION, {
            id: regionId,
            label,
        });
    };

    const getRegions = () => CTE.get('ct.regions', {});

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
        dispatch(ACTIONS.CLEAR_ERROR);

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

            const Toast = getToast();
            Toast.show({
                type: Toast.TYPE.ERROR,
                message: nameTakenError,
                icon: <Icon.Feather.AlertOctagon style={{ marginRight: 12 }} />,
                autoClose: 1000,
            });
        }

        const fieldSlugs = {};
        let savedFields = {};
        if (CTE.get('ct.fields')) {
            savedFields = CTE.get('ct.fields');
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
            CTE.get('ct.fields', {}),
        )) {
            const ref = getFormRef(fieldId);
            if (!fieldId || !ref || !ref.setValue) continue;

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
                const Toast = getToast();
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
                slug &&
                op.has(savedFields, slug) &&
                fieldType !== op.get(savedFields, [slug, 'fieldType'])
            ) {
                const errorMessage = __(
                    'Field name %fieldName type exists.',
                ).replace('%fieldName', fieldName);
                const Toast = getToast();
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
        dispatch(ACTIONS.ERROR, {
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

        dispatch(ACTIONS.MOVE_FIELD, {
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
        const value = e.value;
        dispatch(ACTIONS.TYPE_CHANGE, value, false);
    };

    const onTypeSubmit = async () => {
        const value = parentFormRef.current.getValue();
        op.set(value, 'regions', getRegions());

        op.set(value, 'fields', {});
        getOrderedRegions().forEach(({ id: region }) => {
            CTE.get(['ct', 'regionFields', region], []).forEach(fieldId => {
                const def = CTE.get(['ct', 'fields', fieldId], {});
                const ref = getFormRef(fieldId);
                if (ref) {
                    const fieldValue = ref.getValue();
                    const fieldName = op.get(fieldValue, 'fieldName');
                    const fieldType = op.get(def, 'fieldType');

                    const params = {
                        fieldValue,
                        fieldId,
                        fieldName,
                        fieldType,
                        region,
                    };

                    Reactium.Hook.runSync('content-type-form-save', params);

                    op.set(value, ['fields', fieldId], {
                        ...params.fieldValue,
                        fieldId: params.fieldId,
                        fieldName: params.fieldName,
                        fieldType: params.fieldType,
                        region: params.region,
                        saved: true,
                    });
                }
            });
        });

        try {
            const contentType = await Reactium.ContentType.save(id, value);
            const label = op.get(contentType, 'meta.label', contentType.type);
            op.set(contentType, 'type', label);
            dispatch(ACTIONS.LOAD, contentType, false);

            // savedRef.current = _cloneContentType(contentType);
            // ctRef.current = _cloneContentType(contentType);
            dispatch(ACTIONS.LOADED);

            const Toast = getToast();
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
            const Toast = getToast();
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
        if (isNew() || isLoading()) return null;

        const { collection, machineName } = CTE.get('ct', {});
        const label = CTE.get('ct.meta.label');
        return (
            <CTCapabilityEditor
                key={`ct-caps-${id}`}
                type={label}
                collection={collection}
                machineName={machineName}
                ctRef={CTE.get('ct', {})}
            />
        );
    };

    //
    // Handle Interface
    //
    const addRegion = () => {
        const id = uuid();
        const region = { id, label: id, slug: id, order: 0 };

        dispatch(ACTIONS.ADD_REGION, {
            region,
        });
    };

    const removeRegion = region => {
        if (Object.keys(REQUIRED_REGIONS).includes(region)) return;

        dispatch(ACTIONS.REMOVE_REGION, {
            region,
        });
    };

    const setActiveRegion = region => {
        if (region !== CTE.get('ct.active', 'default')) {
            dispatch(ACTIONS.SET_ACTIVE, {
                region,
            });
        }
    };

    const addField = ft => {
        const fields = CTE.get('ct.fields', {});
        const fieldsByType = _.groupBy(Object.values(fields), 'fieldType');
        const activeRegion = CTE.get('ct.active', 'default');
        const fieldType = fieldTypes[ft];
        const region = op.get(fieldType, 'defaultRegion', activeRegion);

        // Only 1 per singular type
        if (op.get(fieldType, 'singular', false) && op.has(fieldsByType, ft))
            return;

        const fieldId = op.get(fieldType, 'id', uuid());

        const field = {
            fieldId,
            saved: false,
            fieldType: ft,
            region,
            ...op.has(fieldType, 'defaultValues', {}),
        };

        dispatch(ACTIONS.ADD_FIELD, {
            region,
            field,
        });
    };

    const removeField = fieldId => {
        dispatch(ACTIONS.REMOVE_FIELD, {
            fieldId,
        });
    };

    const _fieldChangeHandler = id => e => {
        if (isLoading()) return;

        if (e.value && !_.isEqual(e.value, CTE.get(['ct', 'fields', id]))) {
            const fieldPath = ['ct', 'fields', id];
            const shouldUpdate = false;
            CTE.set(
                fieldPath,
                { ...CTE.get(fieldPath, {}), ...e.value },
                shouldUpdate,
            );
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
                op.get(ref(), 'removeEventListener', () => {})(type, cb);
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

    const getFormErrors = id => CTE.get(['ct', 'error', id]);

    const clearDelete = async () => {
        dispatch(ACTIONS.CLEAR);

        if (id !== 'new') {
            try {
                await Reactium.ContentType.delete(id);
                const Toast = getToast();
                Toast.show({
                    type: Toast.TYPE.SUCCESS,
                    message: __('Content type deleted.'),
                    icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
                    autoClose: 1000,
                });

                Reactium.Routing.history.push('/admin/type/new');
            } catch (error) {
                const Toast = getToast();

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

    const isActiveRegion = region => CTE.get('ct.active', 'default') === region;

    const saveHotkey = e => {
        if (e) e.preventDefault();
        parentFormRef.current.submit();
    };

    const _handle = () => ({
        addRegion,
        removeRegion,
        addField,
        removeField,
        addFormRef,
        removeFormRef,
        getFormRef,
        getFormErrors,
        clearDelete,
        isActiveRegion,
        isNew,
        setActiveRegion,
        dispatch,
    });

    Object.entries(_handle()).forEach(([key, value]) => CTE.extend(key, value));
    CTE.ACTIONS = ACTIONS;

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
                value={CTE.get('ct', {})}
                className={'webform webform-content-type'}
                required={['type']}
                validator={validator}>
                <TypeName id={id} error={CTE.get('ct.error.type')} />
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
