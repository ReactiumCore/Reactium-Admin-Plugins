import React, {
    useRef,
    useState,
    useLayoutEffect as useWindowEffect,
    useEffect,
} from 'react';
import Reactium, {
    __,
    useAsyncEffect,
    useSettingGroup,
    useHandle,
    Zone,
} from 'reactium-core/sdk';
import {
    Dialog,
    Toggle,
    Checkbox,
    Button,
    Icon,
    EventForm,
} from '@atomic-reactor/reactium-ui';
// import EventForm from 'components/EventForm';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import MediaSetting from './MediaSetting';

// Server-Side Render safe useLayoutEffect (useEffect when node)
const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

/**
 * -----------------------------------------------------------------------------
 * Functional Component: SettingEditor
 * -----------------------------------------------------------------------------
 */
const SettingEditor = ({ settings = {}, classNames = [] }) => {
    const tools = useHandle('AdminTools');
    const Toast = op.get(tools, 'Toast');
    const formRef = useRef();
    const errorsRef = useRef({});
    const [, setVersion] = useState(new Date());
    const update = () => setVersion(new Date());
    const groupName = op.get(settings, 'group');
    const valueRef = useRef({});
    const value = valueRef.current;

    const setValue = newValue => {
        valueRef.current = newValue;
        update();
    };

    const updateValue = name => (inputValue, forceRender = false) => {
        op.set(valueRef.current, name, inputValue);
        if (forceRender) update();
    };

    useLayoutEffect(() => {
        if (errorsRef.current && formRef.current) {
            const field = Object.values(errorsRef.current || {}).find(
                f => f.focus,
            );

            if (field) {
                field.focus.focus();
            }
        }
    }, [errorsRef.current]);

    const title = op.get(
        settings,
        'title',
        SettingEditor.defaultProps.settings.title,
    );

    const {
        canGet,
        canSet,
        loading = true,
        settingGroup,
        setSettingGroup,
    } = useSettingGroup(groupName);

    const group = {
        [groupName]: settingGroup,
    };

    const inputs = op.get(settings, 'inputs', {});
    Reactium.Hook.runSync(`settings-editor-config-${groupName}`, inputs);

    const InputRender = () => {
        const renderInput = (key, config) => {
            const type = op.get(config, 'type', 'text');
            const hasError = op.has(errorsRef.current, [key]);
            const formGroupClasses = cn('form-group', { error: hasError });
            const helpText = op.get(
                errorsRef.current,
                [key, 'message'],
                op.get(config, 'tooltip', ''),
            );

            if (typeof type === 'string') {
                switch (type) {
                    case 'media': {
                        return (
                            <MediaSetting
                                value={op.get(valueRef.current, key)}
                                updateValue={updateValue(key)}
                                key={key}
                                name={key}
                                config={config}
                                helpText={helpText}
                            />
                        );
                    }

                    case 'checkbox': {
                        return (
                            <div
                                className={cn(formGroupClasses, 'inline')}
                                key={key}>
                                <label htmlFor={key}>
                                    <span aria-label={config.tooltip}>
                                        {config.label}
                                    </span>
                                    <small>{helpText}</small>
                                </label>
                                <Checkbox name={key} value={true} id={key} />
                            </div>
                        );
                    }
                    case 'toggle': {
                        return (
                            <div
                                className={cn(formGroupClasses, 'inline')}
                                key={key}>
                                <label htmlFor={key}>
                                    <span aria-label={config.tooltip}>
                                        {config.label}
                                    </span>
                                    <small>{helpText}</small>
                                </label>
                                <Toggle name={key} value={true} id={key} />
                            </div>
                        );
                    }
                    case 'textarea': {
                        return (
                            <div className={formGroupClasses} key={key}>
                                <label>
                                    <span aria-label={config.tooltip}>
                                        {config.label}
                                    </span>
                                    <textarea
                                        autoComplete='off'
                                        name={key}
                                        required={op.get(
                                            config,
                                            'required',
                                            false,
                                        )}
                                    />
                                    <small>{helpText}</small>
                                </label>
                            </div>
                        );
                    }

                    default:
                        return (
                            <div className={formGroupClasses} key={key}>
                                <label>
                                    <span aria-label={config.tooltip}>
                                        {config.label}
                                    </span>
                                    <input
                                        name={key}
                                        type={type}
                                        autoComplete='off'
                                        spellCheck='false'
                                        required={op.get(
                                            config,
                                            'required',
                                            false,
                                        )}
                                    />
                                    <small>{helpText}</small>
                                </label>
                            </div>
                        );
                }
            } else if (typeof type === 'function') {
                try {
                    const Component = type;
                    return <Component key={key} {...config} />;
                } catch (error) {
                    console.log(error);
                }
            }
        };

        return Object.entries(inputs).map(([key, config]) =>
            renderInput(key, config),
        );
    };

    const saveHotkey = e => {
        if (e) e.preventDefault();
        formRef.current.submit();
    };

    useEffect(() => {
        if (!loading) setValue(group);
    }, [settingGroup, loading]);

    // save hotkey
    useEffect(() => {
        if (loading) return;

        Reactium.Hotkeys.register('settings-save', {
            callback: saveHotkey,
            key: 'mod+s',
            order: Reactium.Enums.priority.lowest,
            scope: document,
        });

        return () => {
            Reactium.Hotkeys.unregister('settings-save');
        };
    }, [loading]);

    useAsyncEffect(async () => {
        const IID = await Reactium.Zone.addComponent({
            component: InputRender,
            order: Reactium.Enums.priority.neutral,
            zone: [`settings-editor-${groupName}-inputs`],
        });

        return () => {
            Reactium.Zone.removeComponent(IID);
        };
    }, []);

    if (!canGet) return null;

    // hooks above here ^
    if (!groupName) return null;

    const sanitizeInput = (value, config) => {
        const type = op.get(config, 'type');
        const sanitize = op.get(config, 'sanitize', val => val);

        if (type === 'checkbox' || type === 'toggle') {
            return value === true || value === 'true';
        } else {
            return sanitize(value, config);
        }
    };

    const onError = e => {
        const { error } = e;

        errorsRef.current = error;
        setVersion(new Date());
    };

    const submit = (value, silent = false) => onSubmit({ value }, silent);

    const onSubmit = async (e, silent) => {
        const { value: formValues } = e;
        errorsRef.current = {};
        if (!canSet) return;

        const newSettingsGroup = { ...valueRef.current, ...formValues };
        Object.entries(inputs).forEach(([key, config]) => {
            const currentInputValue = sanitizeInput(
                op.get(newSettingsGroup, key, op.get(valueRef.current, key)),
                config,
            );

            op.set(newSettingsGroup, key, currentInputValue);
        });

        valueRef.current = newSettingsGroup;

        await Reactium.Hook.run(`setting-save-${groupName}`, valueRef.current);

        try {
            await setSettingGroup(op.get(newSettingsGroup, groupName));
            formRef.current.setValue(valueRef.current);

            if (silent !== true) {
                Toast.show({
                    type: Toast.TYPE.SUCCESS,
                    message: __('Settings saved'),
                    icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
                    autoClose: 1000,
                });
            }
        } catch (error) {
            Toast.show({
                type: Toast.TYPE.ERROR,
                message: __('Error saving settings'),
                icon: <Icon.Feather.AlertOctagon style={{ marginRight: 12 }} />,
                autoClose: 1000,
            });
            console.error(error);
        }
    };

    const pref = op.has(settings, 'group')
        ? `setting-editor-${settings.group.toLowerCase()}`
        : 'setting-editor';

    return (
        <Dialog
            pref={pref}
            className='mb-xs-24'
            dismissable={false}
            footer={{
                elements: [
                    <Button
                        key='app-settings-save-footer'
                        disabled={!canSet}
                        color={Button.ENUMS.COLOR.PRIMARY}
                        onClick={e => formRef.current.submit(e)}
                        size={Button.ENUMS.SIZE.SM}
                        type='button'>
                        {__('Save Settings')}
                    </Button>,
                ],
            }}
            header={{
                title,
                elements: [
                    <Button
                        key='app-settings-save-header'
                        className='ar-dialog-header-btn'
                        color={Button.ENUMS.COLOR.CLEAR}
                        disabled={!canSet}
                        onClick={e => formRef.current.submit(e)}
                        size={Button.ENUMS.SIZE.XS}
                        title={__('Save Settings')}
                        type='button'>
                        <Icon name='Feather.Check' size={18} />
                    </Button>,
                ],
            }}>
            <Zone
                zone={'settings-editor-all'}
                groupName={groupName}
                settingGroup={settingGroup}
                value={valueRef.current}
            />
            <Zone
                zone={`settings-editor-${groupName}`}
                groupName={groupName}
                settingGroup={settingGroup}
            />
            <EventForm
                value={value}
                onError={onError}
                onSubmit={onSubmit}
                noValidate={true}
                required={Object.entries(inputs)
                    .filter(([, config]) => op.get(config, 'required'))
                    .map(([key]) => key)}
                ref={formRef}
                className={cn(
                    'setting-editor',
                    {
                        [`setting-editor-${op.get(
                            settings,
                            'group',
                        )}`.toLowerCase()]: op.has(settings, 'group'),
                    },
                    ...classNames,
                )}>
                <Zone
                    zone={`settings-editor-${groupName}-inputs`}
                    groupName={groupName}
                    settingGroup={settingGroup}
                    form={formRef.current}
                    submit={submit}
                    value={valueRef.current}
                />
            </EventForm>
        </Dialog>
    );
};

SettingEditor.propTypes = {
    settings: PropTypes.shape({
        title: PropTypes.string.isRequired,
        group: PropTypes.string.isRequired,
        inputs: PropTypes.objectOf(
            PropTypes.shape({
                type: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.elementType,
                    PropTypes.node,
                ]).isRequired,
                tooltip: PropTypes.string,
                required: PropTypes.bool,
                defaultValue: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.bool,
                    PropTypes.number,
                ]),
                sanitize: PropTypes.function,
            }),
        ).isRequired,
    }),
};

SettingEditor.defaultProps = {
    settings: {
        title: __('Settings Group'),
    },
};

export default SettingEditor;
