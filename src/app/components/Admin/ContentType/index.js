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
import { Redirect } from 'react-router-dom';

const noop = () => {};
const getStubRef = () => ({ getValue: () => ({}), update: noop });

const ContentType = memo(
    props => {
        const id = op.get(props, 'params.id', 'new');
        const Enums = op.get(props, 'Enums', {});
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
            Reactium.Zone.getZoneComponents(Enums.ZONE).map(
                ({ id: fieldId }) => {
                    const ref = op.get(
                        formsRef.current,
                        [fieldId],
                        getStubRef,
                    )();
                    op.set(currentValue, ['fields', fieldId], ref.getValue());
                },
            );

            return currentValue;
        };

        const setValue = value => {
            parentFormRef.current.update(value);
            Object.entries(
                op.get(value, 'fields', {}),
            ).forEach(([fieldId, value]) => getFormRef(fieldId).update(value));
        };

        const clearDelete = async () => {
            setValue({});
            Reactium.Zone.getZoneComponents(
                Enums.ZONE,
            ).forEach(({ id: fieldId }) =>
                Reactium.Zone.removeComponent(fieldId),
            );

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
            setValue({});
            Reactium.Zone.getZoneComponents(
                Enums.ZONE,
            ).forEach(({ id: fieldId }) =>
                Reactium.Zone.removeComponent(fieldId),
            );
            SidebarWidget.getTypes(true);

            if (id !== 'new') {
                try {
                    const contentType = await Reactium.ContentType.retrieve(id);

                    Object.entries(op.get(contentType, 'fields', {})).forEach(
                        ([fieldId, fieldDefinition], index) => {
                            const { fieldType } = fieldDefinition;
                            const type = Object.values(Enums.TYPES).find(
                                ({ type }) => fieldType === type,
                            );
                            Reactium.Zone.addComponent({
                                ...type,
                                id: fieldId,
                                zone: Enums.ZONE,
                                order: index,
                                component: 'FieldType',
                                fieldTypeComponent: type.component,
                            });
                        },
                    );

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

            for (let { id: fieldId } of Reactium.Zone.getZoneComponents(
                Enums.ZONE,
            )) {
                if (
                    op.get(responseContext, [fieldId, 'valid'], true) !== true
                ) {
                    op.set(
                        formsErrors.current,
                        [fieldId],
                        op.get(responseContext, [fieldId]),
                    );

                    const ref = op.get(
                        formsRef.current,
                        [fieldId],
                        getStubRef,
                    )();
                    ref.setState(op.get(responseContext, [fieldId]));
                    valid = false;
                }
            }

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

        const updateRestore = async (cb = noop) => {
            // preserve values
            const value = getValue();

            await cb(value);

            // put values back in form
            setValue(value);

            return value;
        };

        const onTypeSave = async () => {
            updateRestore(async value => {
                try {
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

        const saveField = (id, value) => {
            setState; // TODO save state here, and interact with SDK
            console.log({ id, value });
        };

        const addFormRef = (id, cb) => {
            formsRef.current[id] = cb;
        };

        const removeFormRef = id => {
            op.del(formsRef.current, [id]);
        };

        const onDragEnd = result => {
            const draggableId = op.get(result, 'draggableId');
            const source = op.get(result, 'source.index');
            const destination = op.get(result, 'destination.index');
            if (source === destination) return;

            const fieldIds = Reactium.Zone.getZoneComponents(Enums.ZONE).map(
                ({ id }) => id,
            );
            fieldIds.splice(source, 1);
            fieldIds.splice(destination, 0, draggableId);
            fieldIds.forEach((id, order) =>
                Reactium.Zone.updateComponent(id, { order }),
            );
        };

        const addField = type => {
            if (op.has(Enums, ['TYPES', type])) {
                updateRestore(
                    value =>
                        new Promise(resolve => {
                            const existing = Reactium.Zone.getZoneComponents(
                                Enums.ZONE,
                            );
                            Reactium.Zone.addComponent({
                                ...Enums.TYPES[type],
                                zone: Enums.ZONE,
                                order: existing.length,
                                component: 'FieldType',
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

        useRegisterHandle(
            'ContentTypeEditor',
            () => {
                return {
                    addField,
                    removeField,
                    saveField,
                    addFormRef,
                    removeFormRef,
                    getFormRef,
                    getFormErrors,
                    clearDelete,
                };
            },
            [id],
        );

        return (
            <div className={cn('type-editor', slugify(`type-editor ${id}`))}>
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
                    <Fields />
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
