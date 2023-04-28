import React, { useState } from 'react';
import { useCapabilityCheck, useAsyncEffect } from 'reactium-core/sdk';
import { Button, Icon, Dialog, Checkbox, Spinner } from 'reactium-ui';
import DataTable from 'reactium-ui/DataTable';

import Reactium, { __, useRoles, useWindowSize } from 'reactium-core/sdk';
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
    pref = 'admin.capability-editor',
}) => {
    const canSet = useCapabilityCheck(
        ['capability.create', 'capability.update'],
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

    // const tools = useHandle('AdminTools');
    const Toast = op.get(Reactium.State.Tools, 'Toast');

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

    const capNames = capabilities.map(({ capability }) =>
        String(capability).toLowerCase(),
    );
    useAsyncEffect(
        async isMounted => {
            if (capNames.length > 0) {
                const caps = await Reactium.Capability.get(capNames);
                if (isMounted())
                    updateLoadedCaps({
                        loading: false,
                        caps: _.indexBy(caps, 'group'),
                    });
            }
        },
        [capNames.sort().join('')],
    );

    const clearCap = capability => {
        capability = String(capability).toLowerCase();
        const role = op.get(loadedCaps, ['caps', capability, 'allowed']);
        return save(capability, role, 'revoke');
    };

    const addRole = capability => role => save(capability, role, 'grant');

    const removeRole = capability => role => save(capability, role, 'revoke');

    const save = (capability, role, action) => {
        capability = String(capability).toLowerCase();

        const defaultError = __('Unable to save capability');

        let caps = { ...op.get(loadedCaps, 'caps') };

        if (_.isString(role)) {
            if (action === 'grant') {
                const roleArray = _.chain(Object.values(roles))
                    .sortBy('level')
                    .value();
                const idx = _.findIndex(roleArray, { name: role });
                const related = _.pluck(roleArray.slice(idx), 'name');
                role = _.chain([role, related])
                    .flatten()
                    .uniq()
                    .value();
            } else {
                role = _.flatten([role]);
            }
        }

        role = _.without(role, 'super-admin', 'administrator');

        if (role.length < 1) return;

        // Optimistic update
        let { allowed = [] } = op.get(caps, [capability], []);
        allowed = _.flatten([allowed]);
        allowed =
            action === 'grant' ? [allowed, role] : _.without(allowed, ...role);

        allowed = _.chain(allowed)
            .flatten()
            .uniq()
            .value();

        op.set(caps, [capability, 'allowed'], allowed);
        updateLoadedCaps({ caps });

        // Send to server
        return Reactium.Capability[action](capability, role)
            .then(() => {
                // Notify on success
                Toast.show({
                    autoClose: 1000,
                    type: Toast.TYPE.INFO,
                    message: __('Capability Saved'),
                    icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
                });
            })
            .catch(err => {
                Toast.show({
                    autoClose: 1000,
                    type: Toast.TYPE.ERROR,
                    message: op.get(err, 'message', defaultError),
                    icon: (
                        <Icon.Feather.AlertOctagon
                            style={{ marginRight: 12 }}
                        />
                    ),
                });
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
        cap = String(cap).toLowerCase();
        const capability = op.get(loadedCaps, ['caps', cap], {
            allowed: null,
        });

        return roles.reduce((controls, role) => {
            controls[role.name] = (
                <>
                    {capability && (
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
