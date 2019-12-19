import React, { useRef } from 'react';
import { __, useSettingGroup, useHandle } from 'reactium-core/sdk';
import {
    Dialog,
    Toggle,
    Checkbox,
    Button,
    Icon,
} from '@atomic-reactor/reactium-ui';
// import { WebForm } from '@atomic-reactor/reactium-ui';
import WebForm from './WebForm';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: SettingEditor
 * -----------------------------------------------------------------------------
 */
const SettingEditor = ({ settings = {}, classNames = [] }) => {
    const tools = useHandle('AdminTools');
    const Toast = op.get(tools, 'Toast');
    const formRef = useRef();
    const groupName = op.get(settings, 'group');
    if (!groupName) return null;

    const title = op.get(
        settings,
        'title',
        SettingEditor.defaultProps.settings.title,
    );

    const { canGet, canSet, settingGroup, setSettingGroup } = useSettingGroup(
        groupName,
    );

    if (!canGet) return null;

    const group = {
        [groupName]: settingGroup,
    };

    const inputs = op.get(settings, 'inputs', {});

    const value = Object.keys(inputs).reduce((value, key) => {
        op.set(value, [key], op.get(group, key));
        return value;
    }, {});

    const sanitizeInput = (value, key) => {
        const config = op.get(inputs, [key], {});
        const type = op.get(config, 'type');
        const sanitize = op.get(config, 'sanitize', val => val);

        if (type === 'checkbox' || type === 'toggle') {
            console.log({ value, bool: value === true, str: value === 'true' });
            return value === true || value === 'true';
        } else {
            return sanitize(value, key);
        }
    };

    const onSubmit = async ({ value, valid }) => {
        if (!canSet || !valid) return;

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
        const defaultValue = op.get(config, 'defaultValue', undefined);
        let defaultValueProps =
            defaultValue === undefined ? {} : { defaultValue };

        console.log({ value, config });
        if (typeof type === 'string') {
            switch (type) {
                case 'checkbox': {
                    return (
                        <div className='form-group' key={key}>
                            <label>
                                {config.label}
                                <Checkbox name={key} />
                                <small>{config.tooltip}</small>
                            </label>
                        </div>
                    );
                }
                case 'toggle': {
                    return (
                        <div className='form-group' key={key}>
                            <label>
                                {config.label}
                                <Toggle name={key} />
                                <small>{config.tooltip}</small>
                            </label>
                        </div>
                    );
                }
                case 'text':
                default:
                    return (
                        <div className='form-group' key={key}>
                            <label>
                                {config.label}
                                <input
                                    type='text'
                                    autoComplete='off'
                                    name={key}
                                    required={op.get(config, 'required', false)}
                                    {...defaultValueProps}
                                />
                                <small>{config.tooltip}</small>
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
                    onSubmit={onSubmit}
                    noValidate={true}
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
