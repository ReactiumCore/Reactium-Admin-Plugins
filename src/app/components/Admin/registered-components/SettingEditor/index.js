import React, {
    useRef,
    useState,
    useLayoutEffect as useWindowEffect,
    useEffect,
} from 'react';
import { __, useSettingGroup, useHandle } from 'reactium-core/sdk';
import {
    Dialog,
    Toggle,
    Checkbox,
    Button,
    Icon,
    WebForm,
} from '@atomic-reactor/reactium-ui';
// import WebForm from './WebForm';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';

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
    const errorsRef = useRef(null);
    const [version, setVersion] = useState(uuid());
    const groupName = op.get(settings, 'group');

    useLayoutEffect(() => {
        if (errorsRef.current && formRef.current) {
            const [field] = errorsRef.current.fields;
            if (field) {
                formRef.current.focus(field);
            }
        }
    }, [errorsRef.current]);

    // hooks above here ^
    if (!groupName) return null;

    const title = op.get(
        settings,
        'title',
        SettingEditor.defaultProps.settings.title,
    );

    const { canGet, canSet, settingGroup, setSettingGroup } = useSettingGroup(
        groupName,
    );

    const group = {
        [groupName]: settingGroup,
    };

    const inputs = op.get(settings, 'inputs', {});

    const value = Object.keys(inputs).reduce((value, key) => {
        op.set(value, key, op.get(group, key, null));
        return value;
    }, {});

    if (!canGet) return null;

    const sanitizeInput = (value, key) => {
        const config = op.get(inputs, key, {});
        const type = op.get(config, 'type');
        const sanitize = op.get(config, 'sanitize', val => val);

        if (type === 'checkbox' || type === 'toggle') {
            return value === true || value === 'true';
        } else {
            return sanitize(value, key);
        }
    };

    const onError = ({ value: formValues, errors }) => {
        const preserved = Object.entries(formValues).reduce(
            (preservedValue, [key, value]) => {
                op.set(preservedValue, key, value);
                return preservedValue;
            },
            {},
        );
        console.log({ formValues, preserved });

        errorsRef.current = errors;
        setVersion(uuid());
        setTimeout(() => {
            formRef.current.update(preserved);
        }, 1);
    };

    const onSubmit = async () => {
        errorsRef.current = null;
        if (!canSet) return;

        const values = formRef.current.getValue();
        const newSettingsGroup = {};
        Object.entries(values).forEach(([key, value]) => {
            op.set(newSettingsGroup, key, sanitizeInput(value, key));
        });

        try {
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

    const renderInput = (key, config) => {
        const type = op.get(config, 'type', 'text');
        const errorIndex = op
            .get(errorsRef.current, ['fields'], [])
            .findIndex(fieldName => fieldName === key);
        const hasError = errorIndex > -1;
        const formGroupClasses = cn('form-group', {
            error: hasError,
        });
        const helpText = hasError
            ? errorsRef.current.errors[errorIndex]
            : config.tooltip;

        if (typeof type === 'string') {
            switch (type) {
                case 'checkbox': {
                    return (
                        <div className={formGroupClasses} key={key}>
                            <label>
                                <span
                                    data-tooltip={config.tooltip}
                                    data-align='left'>
                                    {config.label}
                                </span>
                                <Checkbox name={key} />
                                <small>{helpText}</small>
                            </label>
                        </div>
                    );
                }
                case 'toggle': {
                    return (
                        <div className={formGroupClasses} key={key}>
                            <label>
                                <span
                                    data-tooltip={config.tooltip}
                                    data-align='left'>
                                    {config.label}
                                </span>
                                <Toggle name={key} />
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
                                    required={op.get(config, 'required', false)}
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

    return (
        <Dialog
            dismissable={false}
            header={{
                title,
            }}>
            {
                <WebForm
                    onError={onError}
                    onSubmit={onSubmit}
                    noValidate={true}
                    required={Object.entries(inputs)
                        .filter(([, config]) => op.get(config, 'required'))
                        .map(([key]) => key)}
                    value={value}
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
                    {Object.entries(inputs).map(([key, config]) =>
                        renderInput(key, config),
                    )}

                    <Button
                        disabled={!canSet}
                        className={'mt-20'}
                        color={Button.ENUMS.COLOR.PRIMARY}
                        size={Button.ENUMS.SIZE.MD}
                        type='submit'>
                        {__('Save Settings')}
                    </Button>
                </WebForm>
            }
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
