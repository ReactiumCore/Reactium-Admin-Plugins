import React, {
    useRef,
    useState,
    useLayoutEffect as useWindowEffect,
    useEffect,
} from 'react';
import Reactium, {
    __,
    useSettingGroup,
    useHandle,
    useHookComponent,
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
    const valueRef = useRef();
    const value = op.get(valueRef.current) || {};
    const setValue = newValue => {
        valueRef.current = newValue;
        update();
    };

    const updateValue = name => inputValue => {
        op.set(valueRef.current, name, inputValue);
        update();
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

    const InputRender = () => {
        const renderInput = (key, config) => {
            const type = op.get(config, 'type', 'text');
            const hasError = op.has(errorsRef.current, [key]);
            const formGroupClasses = cn('form-group', {
                error: hasError,
            });
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
                                value={op.get(value, key)}
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
                                    <span
                                        data-tooltip={config.tooltip}
                                        data-align='left'>
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
                                    <span
                                        data-tooltip={config.tooltip}
                                        data-align='left'>
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
                    case 'text':
                    default:
                        return (
                            <div className={formGroupClasses} key={key}>
                                <label>
                                    <span
                                        data-tooltip={config.tooltip}
                                        data-align='left'>
                                        {config.label}
                                    </span>
                                    <input
                                        type='text'
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

    useEffect(() => {
        if (!loading) {
            const newValue = {};
            Object.keys(inputs).forEach(key => {
                op.set(newValue, key, op.get(group, key, null));
            });

            setValue(newValue);
        }
    }, [settingGroup, loading]);

    useEffect(() => {
        const IID = Reactium.Zone.addComponent({
            component: InputRender,
            order: Reactium.Enums.priority.normal,
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

    const onSubmit = async e => {
        const { value: formValues } = e;
        errorsRef.current = {};
        if (!canSet) return;

        const newSettingsGroup = {};
        Object.entries(inputs).forEach(([key, config]) => {
            const currentInputValue = sanitizeInput(
                op.get(formValues, key, op.get(value, key)),
                config,
            );

            op.set(newSettingsGroup, key, currentInputValue);
        });

        try {
            valueRef.current = newSettingsGroup;
            await setSettingGroup(op.get(newSettingsGroup, groupName));

            Toast.show({
                type: Toast.TYPE.SUCCESS,
                message: __('Settings saved'),
                icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
                autoClose: 1000,
            });
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
            dismissable={false}
            header={{
                title,
                elements: [
                    <Button
                        key='app-settings-save'
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
                />

                <div className='flex middle center'>
                    <Button
                        appearance={Button.ENUMS.APPEARANCE.PILL}
                        disabled={!canSet}
                        className={'mt-20'}
                        color={Button.ENUMS.COLOR.PRIMARY}
                        size={Button.ENUMS.SIZE.MD}
                        type='submit'>
                        {__('Save Settings')}
                    </Button>
                </div>
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
