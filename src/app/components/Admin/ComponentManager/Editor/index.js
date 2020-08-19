import _ from 'underscore';
import op from 'object-path';
import Attribute from '../Attribute';

import {
    __,
    useDerivedState,
    useEventHandle,
    useHandle,
    useHookComponent,
    useIsContainer,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useState,
} from 'react';

export default forwardRef((props, ref) => {
    // -------------------------------------------------------------------------
    // Props
    // -------------------------------------------------------------------------
    const { attribute = [], component, label, name, uuid, type } = props;

    // -------------------------------------------------------------------------
    // Components & external handles
    // -------------------------------------------------------------------------
    const handle = useHandle('ComponentManager');
    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');
    const ConfirmBox = useHookComponent('ConfirmBox');
    const { Button, Dialog, EventForm, Icon } = useHookComponent('ReactiumUI');
    const TypeEditor = useHookComponent('ComponentManagerTypeEditor');

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [edit, setEdit] = useState(false);

    const [value, setValue] = useDerivedState({
        attribute,
        component,
        label,
        name,
        type,
        uuid,
    });

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------
    const isContainer = useIsContainer();

    const confirmDelete = () => {
        Modal.show(
            <ConfirmBox
                message={
                    <>
                        {__('Are you sure you want to delete')}
                        <div className='my-xs-8 break-word blue'>{name}</div>
                    </>
                }
                onCancel={() => Modal.dismiss()}
                onConfirm={() => {
                    Modal.dismiss();
                    handle.delete(props);
                }}
                title={__('Confirm Delete')}
            />,
        );
    };

    const disable = () => setEdit(false);

    const dismiss = e => {
        const form = editor.form.form;
        const cont = _.compact(form.getElementsByClassName('ar-dialog'));
        const modal = _.chain(document.getElementsByClassName('ar-modal'))
            .compact()
            .first()
            .value();

        if (cont.length < 1) return;

        const container = _.first(cont);

        if (isContainer(e.target, modal)) return;
        if (isContainer(e.target, container)) return;

        disable();
    };

    const enable = () => {
        handle.disable(uuid);

        const input = handle.refs.get(`component.${uuid}.name`);
        if (input) {
            input.removeAttribute('readOnly');
            input.focus();
        }
        setEdit(true);
    };

    const header = () =>
        handle
            ? {
                  title: null,
                  elements: _.compact([
                      <div
                          className='component-name'
                          key={`component-name-${uuid}`}>
                          <input
                              type='text'
                              name='name'
                              placeholder={__('Component')}
                              readOnly={!edit}
                              ref={elm =>
                                  handle.refs.set(`component.${uuid}.name`, elm)
                              }
                          />
                      </div>,
                      edit === true ? (
                          <Button
                              className='ar-dialog-header-btn danger'
                              color={Button.ENUMS.COLOR.CLEAR}
                              onMouseDown={confirmDelete}
                              key={`component-delete-${uuid}`}>
                              <Icon name='Feather.Trash2' />
                          </Button>
                      ) : null,
                      edit === true ? (
                          <Button
                              className='ar-dialog-header-btn primary'
                              color={Button.ENUMS.COLOR.CLEAR}
                              onMouseDown={showTypeEditor}
                              key={`component-type-${uuid}`}>
                              <Icon name='Feather.Package' />
                          </Button>
                      ) : null,
                      <Button
                          className='ar-dialog-header-btn'
                          color={Button.ENUMS.COLOR.CLEAR}
                          onClick={toggle}
                          key={`component-edit-${uuid}`}>
                          <Icon
                              name={edit ? 'Feather.Check' : 'Feather.Edit2'}
                          />
                      </Button>,
                  ]),
              }
            : {};

    const save = newValue => {
        setValue(_.first(Object.values(newValue)));
        handle.save(newValue);
    };

    const showTypeEditor = () => {
        Modal.show(
            <TypeEditor
                editor={editor}
                active={op.get(value, 'type', 'selector') || 'selector'}
            />,
        );
    };

    const stateKey = `components.${uuid}.attribute`;

    const toggle = () => {
        if (edit === true) {
            disable();
        } else {
            enable();
        }
    };

    const updateValue = () => setValue(editor.form.getValue());

    const _onChange = () => {
        _.defer(() => updateValue());
    };

    const _onRemove = e => {
        handle.attribute.remove(e);
        _.defer(() => updateValue());
    };

    const _onAdd = e => {
        const { value } = e.input;
        if (!value) {
            e.input.focus();
            return;
        }

        handle.attribute.add(e);
        _.defer(() => updateValue());
    };

    // -------------------------------------------------------------------------
    // Handle
    // -------------------------------------------------------------------------
    const _editor = () => ({
        delete: confirmDelete,
        disable,
        enable,
        form: null,
        save,
        setValue,
        value,
    });
    const [editor, setEditor] = useEventHandle(_editor());
    useImperativeHandle(ref, () => editor, [Object.values(value)]);

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------

    // listeners
    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.addEventListener('mousedown', dismiss);
        window.addEventListener('touchstart', dismiss);

        return () => {
            window.removeEventListener('mousedown', dismiss);
            window.removeEventListener('touchstart', dismiss);
        };
    }, []);

    // value
    useEffect(() => {
        editor.value = value;
        setEditor(editor);
    }, [Object.values(value)]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <EventForm
            name={`component-${uuid}`}
            onChange={_onChange}
            ref={elm => {
                handle.refs.set(`component.${uuid}.form`, elm);
                editor.form = elm;
            }}
            value={value}>
            <input type='hidden' name='type' value={type || ''} />
            <input type='hidden' name='uuid' value={uuid || ''} />
            <input
                type='hidden'
                name='component'
                value={
                    _.isObject(component)
                        ? JSON.stringify(component)
                        : component || ''
                }
            />

            <Dialog
                header={header()}
                onCollapse={disable}
                pref={`admin.dialog.component.${uuid}`}>
                <div className='info'>
                    <div className='form-group'>
                        <input
                            type='text'
                            name='label'
                            placeholder={__('Label')}
                            readOnly={!edit}
                        />
                    </div>
                </div>
                {edit && (
                    <div className='attribute-add'>
                        <Attribute
                            color={Button.ENUMS.COLOR.TERTIARY}
                            icon='Feather.Plus'
                            label={__('Attributes')}
                            onClick={_onAdd}
                            readOnly={!edit}
                            stateKey={stateKey}
                        />
                    </div>
                )}
                {!edit && attribute.length > 0 && (
                    <div className='attribute-add'>
                        <div className='attribute'>
                            <h3>{__('Attributes')}</h3>
                        </div>
                    </div>
                )}
                <div className='attributes'>
                    <ul>
                        {attribute.map((item, i) => (
                            <li key={item}>
                                <Attribute
                                    color={Button.ENUMS.COLOR.DANGER}
                                    icon='Feather.X'
                                    index={i}
                                    name='attribute'
                                    onClick={_onRemove}
                                    readOnly={!edit}
                                    stateKey={stateKey}
                                    value={item}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </Dialog>
        </EventForm>
    );
});
