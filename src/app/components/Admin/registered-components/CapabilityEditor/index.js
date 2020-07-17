import React, { useState } from 'react';
import { useCapabilityCheck, useAsyncEffect } from 'reactium-core/sdk';
import {
    Button,
    Icon,
    Dialog,
    Checkbox,
    Spinner,
} from '@atomic-reactor/reactium-ui';
import DataTable from '@atomic-reactor/reactium-ui/DataTable';

import Reactium, {
    __,
    useRoles,
    useHandle,
    useWindowSize,
} from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';

const CapabilityDescription = ({ title = '', tooltip = '' }) => {
    return (
        <span
            title={tooltip}
            tabIndex={0}
            data-tooltip={tooltip}
            data-align='right'
            data-vertical-align='middle'>
            {title}
        </span>
    );
};

const Loading = () => {
    const style = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '200px',
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={style} className='flex center middle'>
                <Spinner />
            </div>
        </div>
    );
};

const noop = () => {};
const RoleControl = ({
    canSet = false,
    capability,
    role,
    onAdd = noop,
    onRemove = noop,
}) => {
    const name = role.name;

    const onChange = e => {
        const target = e.target;

        if (target.checked) {
            onAdd(name);
        } else {
            onRemove(name);
        }
    };

    const allowed = op.get(capability, 'allowed', []) || [];
    const anonymous = allowed.includes('anonymous');
    const checked = allowed.includes(name);
    const disabled = !canSet || (anonymous && name !== 'anonymous');

    return (
        <Checkbox
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            label={name}
            labelAlign='right'
        />
    );
};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: CapabilityEditor
 * -----------------------------------------------------------------------------
 */
const CapabilityEditor = ({
    capabilities = [],
    height,
    pref = 'capability-editor',
}) => {
    const canSet = useCapabilityCheck(
        ['Capability.create', 'Capability.update'],
        false,
    );
    const currentRoles = useRoles();
    const roles = Object.values(currentRoles).filter(
        role => !['banned', 'super-admin', 'administrator'].includes(role.name),
    );

    const [loadedCaps, setLoadedCaps] = useState({
        loading: true,
        caps: {},
    });

    const updateLoadedCaps = update => {
        const newValue = {
            ...loadedCaps,
            ...update,
        };

        setLoadedCaps(newValue);
    };

    const tools = useHandle('AdminTools');
    const Toast = op.get(tools, 'Toast');

    const { breakpoint } = useWindowSize();

    let maxPermWidth;
    switch (breakpoint) {
        case 'xl':
            maxPermWidth = 50;
            break;

        case 'lg':
        case 'md':
            maxPermWidth = 70;
            break;

        case 'xs':
        case 'sm':
        default:
            maxPermWidth = 85;
    }

    const clearLabel = __('Clear roles');

    const capNames = capabilities.map(({ capability }) => capability);
    useAsyncEffect(
        async isMounted => {
            if (capNames.length > 0) {
                const caps = await Reactium.Capability.get(capNames);
                if (isMounted())
                    updateLoadedCaps({
                        loading: false,
                        caps,
                    });
            }
        },
        [capNames.sort().join('')],
    );

    const clearCap = capName => save(capName, { allowed: [], excluded: [] });

    const addRole = capName => role => {
        const excluded = op.get(loadedCaps, ['caps', capName, 'excluded'], []);
        const allowed = op.get(loadedCaps, ['caps', capName, 'allowed'], []);
        save(capName, {
            allowed: _.uniq(allowed.concat(role)),
            excluded: excluded.filter(r => r !== role),
        });
    };

    const removeRole = capName => role => {
        const excluded = op.get(loadedCaps, ['caps', capName, 'excluded'], []);
        const allowed = op.get(loadedCaps, ['caps', capName, 'allowed'], []);
        save(capName, {
            allowed: allowed.filter(r => r !== role),
            excluded: _.uniq(excluded.concat(role)),
        });
    };

    const save = (capName, perms) => {
        // updateLoadedCaps({ loading: true });
        return Reactium.Cloud.run('capability-edit', {
            capability: capName,
            perms,
        })
            .then(updated => {
                const caps = { ...op.get(loadedCaps, 'caps') };
                op.set(caps, [capName], updated);
                updateLoadedCaps({ caps, loading: false });

                Toast.show({
                    type: Toast.TYPE.SUCCESS,
                    message: __('Capability Saved'),
                    icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
                    autoClose: 1000,
                });
            })
            .catch(error => {
                Toast.show({
                    type: Toast.TYPE.ERROR,
                    message: __('Error saving capability'),
                    icon: (
                        <Icon.Feather.AlertOctagon
                            style={{ marginRight: 12 }}
                        />
                    ),
                    autoClose: 1000,
                });

                console.log(error);
            });
    };

    const getColumns = () => {
        const columns = {
            capability: {
                label: __('Capability'),
                verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
                sortType: DataTable.ENUMS.SORT_TYPE.STRING,
            },
        };

        roles.reduce((columns, role) => {
            columns[role.name] = {
                label: role.label,
                width: `${Math.floor(maxPermWidth / (roles.length + 1))}%`,
                verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
                textAlign: DataTable.ENUMS.TEXT_ALIGN.CENTER,
            };
            return columns;
        }, columns);

        columns.clear = {
            width: 43,
        };

        return columns;
    };

    const roleControls = ({ capability: cap }) => {
        const capability = op.get(loadedCaps, ['caps', cap], {
            allowed: null,
        });

        return roles.reduce((controls, role) => {
            controls[role.name] = (
                <>
                    {capability.allowed !== null && (
                        <RoleControl
                            capName={cap}
                            capability={capability}
                            role={role}
                            canSet={canSet}
                            onAdd={addRole(cap)}
                            onRemove={removeRole(cap)}
                        />
                    )}
                </>
            );
            return controls;
        }, {});
    };

    const data = capabilities.map(cap => ({
        clear: (
            <Button
                className='clear-cap'
                data-tooltip={clearLabel}
                data-vertical-align='middle'
                data-align='left'
                color={Button.ENUMS.COLOR.DANGER}
                onClick={() => clearCap(cap.capability)}>
                <Icon name={'Feather.X'} />
                <span className='sr-only'>{clearLabel}</span>
            </Button>
        ),
        capability: <CapabilityDescription {...cap} />,
        ...roleControls(cap),
    }));

    return (
        <Dialog
            pref={pref}
            className='capability-editor'
            header={{ title: __('Capabilities'), dismissable: false }}>
            {loadedCaps.loading ? (
                <Loading />
            ) : (
                <DataTable
                    scrollable={!!height}
                    height={height}
                    columns={getColumns()}
                    data={data}
                />
            )}
        </Dialog>
    );
};

export default CapabilityEditor;
