import React, { useRef, useState, useEffect, memo } from 'react';
import TypeName from './TypeName';
import Fields from './Fields';
import Tools from './Tools';
import Reactium, { useRegisterHandle, useHandle, __ } from 'reactium-core/sdk';
import { WebForm, Icon } from '@atomic-reactor/reactium-ui';
import cn from 'classnames';
import slugify from 'slugify';
import op from 'object-path';
import { DragDropContext } from 'react-beautiful-dnd';
import uuid from 'uuid/v4';
import _ from 'underscore';

const noop = () => {};
const getStubRef = () => ({ getValue: () => ({}), update: noop });
const defaultRegion = {
    id: 'default',
    label: __('Default'),
    slug: 'default',
};

const ContentType = memo(
    props => {
        const id = op.get(props, 'params.id', 'new');
        const Enums = op.get(props, 'Enums', {});
        const stateRef = useRef({ fields: {} });
        const regionRef = useRef({
            regions: { default: defaultRegion },
        });
        const parentFormRef = useRef();
        const formsRef = useRef({});
        const formsErrors = useRef({});
        const nameError = useRef(false);
        const [, setVersion] = useState(uuid());
        const SidebarWidget = useHandle('ContentType/SidebarWidget');
        const tools = useHandle('AdminTools');
        const Toast = op.get(tools, 'Toast');

        const getValue = () => {
            const currentValue = {};
            op.set(
                currentValue,
                'type',
                op.get(parentFormRef.current.getValue(), 'type'),
            );
            getComponents().map(({ id: fieldId, region }) => {
                const ref = op.get(formsRef.current, [fieldId], getStubRef)();
                op.set(currentValue, ['fields', fieldId], {
                    ...ref.getValue(),
                    region,
                });
            });

            return currentValue;
        };

        const setValue = value => {
            stateRef.current = value;
            parentFormRef.current.update(value);
            Object.entries(
                op.get(value, 'fields', {}),
            ).forEach(([fieldId, value]) => getFormRef(fieldId).update(value));
        };

        const addRegion = () => {
            const regions = { ...getRegions() };
            const region = uuid();
            regions[region] = { id: region, label: region, slug: region };
            regionRef.current = { regions };
            setVersion(uuid());
            setTimeout(() => {
                refreshForms();
            }, 1);
        };

        const setRegionLabel = regionId => label => {
            const regions = getRegions();
            if (regionId in regions) {
                const region = regions[regionId];
                region.label = label;
                region.slug = label ? slugify(label).toLowerCase() : '';

                setVersion(uuid());
            }
        };

        const removeRegion = region => {
            if (region === 'default') return;

            updateRestore(async value => {
                let next = Reactium.Zone.getZoneComponents(Enums.ZONE(region))
                    .length;
                op.del(regionRef.current, ['regions', region]);
                const zoneComponents = Reactium.Zone.getZoneComponents(
                    Enums.ZONE(region),
                );

                for (const component of zoneComponents) {
                    Reactium.Zone.updateComponent(component.id, {
                        order: next++,
                        zone: [Enums.ZONE('default')],
                        region: 'default',
                    });
                }

                setTimeout(() => {
                    setValue(value);
                    setVersion(uuid());
                }, 1);
            });
        };

        const getRegions = () =>
            op.get(regionRef.current, 'regions', { default: defaultRegion });

        const getZones = () => {
            return Object.values(getRegions()).map(region => ({
                region,
                zone: Enums.ZONE(region.id),
            }));
        };

        const getComponents = () => {
            return getZones().reduce((components, { zone }) => {
                return components.concat(Reactium.Zone.getZoneComponents(zone));
            }, []);
        };

        const clear = () => {
            setValue({});
            getComponents().forEach(({ id: fieldId }) =>
                Reactium.Zone.removeComponent(fieldId),
            );
            regionRef.current = { regions: { default: defaultRegion } };
            setVersion(uuid());
        };

        const clearDelete = async () => {
            clear();

            if (id !== 'new') {
                try {
                    await Reactium.ContentType.delete(id);

                    Toast.show({
                        type: Toast.TYPE.SUCCESS,
                        message: __('Content type deleted.'),
                        icon: (
                            <Icon.Feather.Check style={{ marginRight: 12 }} />
                        ),
                        autoClose: 1000,
                    });

                    SidebarWidget.getTypes(true);
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

        const load = async () => {
            clear();
            SidebarWidget.getTypes(true);

            if (id !== 'new') {
                try {
                    const contentType = await Reactium.ContentType.retrieve(id);
                    const regions = op.get(contentType, 'regions', {
                        default: defaultRegion,
                    });

                    op.set(regionRef.current, 'regions', regions);

                    Object.entries(op.get(contentType, 'fields', {})).forEach(
                        ([fieldId, fieldDefinition], index) => {
                            const { fieldType } = fieldDefinition;
                            let region = op.get(
                                fieldDefinition,
                                'region',
                                'default',
                            );

                            if (!(region in regions)) region = 'default';

                            const type = Object.values(Enums.TYPES).find(
                                ({ type }) => fieldType === type,
                            );

                            Reactium.Zone.addComponent({
                                ...type,
                                id: fieldId,
                                region,
                                zone: Enums.ZONE(region),
                                order: index,
                                component: 'FieldType',
                                fieldTypeComponent: type.component,
                            });
                        },
                    );

                    setVersion(uuid());
                    setTimeout(() => {
                        setValue(contentType);
                    }, 1);
                } catch (error) {
                    Toast.show({
                        type: Toast.TYPE.ERROR,
                        message: __('Error loading content type.'),
                        icon: (
                            <Icon.Feather.AlertOctagon
                                style={{ marginRight: 12 }}
                            />
                        ),
                        autoClose: 1000,
                    });
                    console.error(error);
                    Reactium.Routing.history.push('/admin/type/new');
                }
            }
        };

        useEffect(() => {
            load();
        }, [id]);

        const validator = async (value, valid, errors) => {
            formsErrors.current = {};

            const responseContext = await Reactium.Hook.run(
                'content-type-validate-fields',
            );

            const fieldNames = {};
            for (let { id: fieldId } of getComponents()) {
                const ref = getFormRef(fieldId);

                // collect results of fields hook
                if (
                    op.get(responseContext, [fieldId, 'valid'], true) !== true
                ) {
                    op.set(
                        formsErrors.current,
                        [fieldId],
                        op.get(responseContext, [fieldId]),
                    );

                    ref.setState(op.get(responseContext, [fieldId]));
                    valid = false;
                }

                // make sure all fields are unique
                const { fieldName } = ref.getValue();
                const slug = slugify(fieldName || '').toLowerCase();
                const errors = op.get(ref, 'errors') || {
                    focus: null,
                    fields: [],
                    errors: [],
                };

                if (slug in fieldNames) {
                    const error = __('Duplicate field name %fieldName').replace(
                        '%fieldName',
                        fieldName,
                    );
                    Toast.show({
                        type: Toast.TYPE.ERROR,
                        message: error,
                        icon: (
                            <Icon.Feather.AlertOctagon
                                style={{ marginRight: 12 }}
                            />
                        ),
                        autoClose: 1000,
                    });

                    valid = false;
                    const updatedErrors = {
                        ...errors,
                        focus: 'fieldName',
                        fields: _.uniq([
                            ...op.get(errors, 'fields', []),
                            'fieldName',
                        ]),
                        errors: [...op.get(errors, 'errors', []), error],
                    };

                    ref.setState({
                        errors: updatedErrors,
                    });

                    op.set(formsErrors.current, [fieldId], {
                        valid: false,
                        errors: updatedErrors,
                    });
                }

                fieldNames[slug] = fieldId;
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

            return { valid, errors };
        };

        const onError = async ({ errors }) => {
            if (op.get(errors, 'fields', []).includes('type')) {
                nameError.current = true;
            } else {
                nameError.current = false;
            }

            updateRestore(value => {
                // render errors
                setVersion(uuid());
            });
        };

        const refreshForms = () => {
            // put values back in form without rerender
            parentFormRef.current.refresh();
            getComponents().forEach(({ id }) => {
                const ref = getFormRef(id);
                if (ref && ref.refresh) ref.refresh();
            });
        };

        const updateRestore = async (cb = noop) => {
            // preserve values
            const value = getValue();

            // in case cb caused rerender
            await cb(value);

            // refresh forms in dom
            refreshForms();

            return value;
        };

        const onTypeSave = async () => {
            updateRestore(async value => {
                try {
                    op.set(value, 'regions', getRegions());

                    const type = await Reactium.ContentType.save(id, value);
                    SidebarWidget.getTypes(true);

                    Toast.show({
                        type: Toast.TYPE.SUCCESS,
                        message: __('Content type saved'),
                        icon: (
                            <Icon.Feather.Check style={{ marginRight: 12 }} />
                        ),
                        autoClose: 1000,
                    });

                    if (id === 'new' && type.uuid) {
                        Reactium.Routing.history.push(
                            `/admin/type/${type.uuid}`,
                        );
                    }

                    formsErrors.current = {};
                    setValue(value);
                    setVersion(uuid());
                } catch (error) {
                    Toast.show({
                        type: Toast.TYPE.ERROR,
                        message: __('Error saving content type.'),
                        icon: (
                            <Icon.Feather.AlertOctagon
                                style={{ marginRight: 12 }}
                            />
                        ),
                        autoClose: 1000,
                    });
                    console.error(error);
                }
            });
        };

        const addFormRef = (id, cb) => {
            formsRef.current[id] = cb;
        };

        const removeFormRef = id => {
            op.del(formsRef.current, [id]);
        };

        const onDragEnd = result => {
            const draggableId = op.get(result, 'draggableId');
            const sourceIndex = op.get(result, 'source.index');
            const sourceRegion = op.get(result, 'source.droppableId');
            const destinationIndex = op.get(result, 'destination.index');
            const destinationRegion = op.get(result, 'destination.droppableId');

            if (
                sourceIndex === destinationIndex &&
                sourceRegion === destinationRegion
            )
                return;

            const moveInRegion = (
                id,
                sourceIndex,
                region,
                destinationIndex,
            ) => {
                const zone = Enums.ZONE(region);
                const fieldIds = Reactium.Zone.getZoneComponents(zone).map(
                    ({ id }) => id,
                );

                fieldIds.splice(sourceIndex, 1);
                fieldIds.splice(destinationIndex, 0, id);
                fieldIds.forEach((id, order) =>
                    Reactium.Zone.updateComponent(id, { order }),
                );
            };

            const moveToRegion = (
                id,
                sourceRegion,
                destinationIndex,
                destinationRegion,
            ) => {
                const destinationZone = Enums.ZONE(destinationRegion);
                const destinationFieldIds = Reactium.Zone.getZoneComponents(
                    destinationZone,
                ).map(({ id }) => id);

                destinationFieldIds.splice(destinationIndex, 0, id);
                destinationFieldIds.forEach((id, order) =>
                    Reactium.Zone.updateComponent(id, {
                        order,
                        region: destinationRegion,
                        zone: destinationZone,
                    }),
                );

                const sourceZone = Enums.ZONE(sourceRegion);
                Reactium.Zone.getZoneComponents(sourceZone).forEach(
                    ({ id }, order) => {
                        Reactium.Zone.updateComponent(id, { order });
                    },
                );
            };

            if (sourceRegion === destinationRegion) {
                moveInRegion(
                    draggableId,
                    sourceIndex,
                    sourceRegion,
                    destinationIndex,
                );
            } else {
                const value = getValue();
                moveToRegion(
                    draggableId,
                    sourceRegion,
                    destinationIndex,
                    destinationRegion,
                );
                setTimeout(() => {
                    setValue(value);
                }, 1);
            }
        };

        const addField = type => {
            if (op.has(Enums, ['TYPES', type])) {
                updateRestore(
                    value =>
                        new Promise(resolve => {
                            const existing = getComponents();
                            Reactium.Zone.addComponent({
                                ...Enums.TYPES[type],
                                zone: Enums.ZONE('default'),
                                order: existing.length,
                                component: 'FieldType',
                                region: 'default',
                                fieldTypeComponent: Enums.TYPES[type].component,
                            });

                            setTimeout(() => {
                                resolve();
                            }, 1);
                        }),
                );
            }
        };

        const removeField = id => {
            // Make async so dismissable _onHide() reconciles before removing component
            updateRestore(
                value =>
                    new Promise(resolve => {
                        setTimeout(() => {
                            Reactium.Zone.removeComponent(id);
                            op.del(formsRef.current, [id]);
                            resolve();
                        }, 1);
                    }),
            );
        };

        const getFormRef = id => op.get(formsRef.current, [id], getStubRef)();

        const getFormErrors = id => op.get(formsErrors.current, [id, 'errors']);

        const isNew = () => id === 'new';

        useRegisterHandle(
            'ContentTypeEditor',
            () => {
                return {
                    addRegion,
                    addField,
                    removeField,
                    addFormRef,
                    removeFormRef,
                    getFormRef,
                    getFormErrors,
                    clearDelete,
                    isNew,
                };
            },
            [id],
        );

        return (
            <div
                className={cn(
                    'type-editor',
                    slugify(`type-editor ${id}`).toLowerCase(),
                )}>
                <WebForm
                    ref={parentFormRef}
                    onSubmit={onTypeSave}
                    onError={onError}
                    required={['type']}
                    showError={false}
                    validator={validator}>
                    <TypeName id={id} error={nameError.current} />
                </WebForm>

                <DragDropContext onDragEnd={onDragEnd}>
                    {getZones().map(({ region, zone }) => (
                        <Fields
                            key={region.id}
                            onRegionLabelChange={setRegionLabel(region.id)}
                            onRemoveRegion={() => removeRegion(region.id)}
                            region={region}
                            regions={getRegions()}
                            zone={zone}
                        />
                    ))}
                </DragDropContext>
                <Tools enums={Enums} />
            </div>
        );
    },
    (prev, next) => {
        return op.get(prev, 'params.id') === op.get(next, 'params.id');
    },
);

export default ContentType;
