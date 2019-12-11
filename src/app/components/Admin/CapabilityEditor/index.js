import React, { useEffect, useState, useRef } from 'react';
import { Icon, Dialog, Checkbox } from '@atomic-reactor/reactium-ui';
import DataTable, { Column, Row } from '@atomic-reactor/reactium-ui/DataTable';
import Reactium, { __, useRoles, useHandle } from 'reactium-core/sdk';
import op from 'object-path';

const CapabilityDescription = ({
    capability = '',
    title = '',
    tooltip = '',
}) => {
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

const RoleControl = ({ capability, role, forceRefresh }) => {
    const tools = useHandle('AdminTools');
    const Toast = op.get(tools, 'Toast');

    const onChange = e => {
        const target = e.target;
        const perms = {
            ...capability,
        };

        if (target.checked) {
            perms.allowed.push(role.name);
        } else {
            perms.allowed = perms.allowed.filter(name => name !== role.name);
        }

        Reactium.Cloud.run('capability-edit', {
            capability: capability.capability,
            perms,
        })
            .then(() => {
                Toast.show({
                    type: Toast.TYPE.SUCCESS,
                    message: target.checked
                        ? __('Role added')
                        : __('Role removed'),
                    icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
                    autoClose: 1000,
                });
            })
            .catch(error => {
                Toast.show({
                    type: Toast.TYPE.ERROR,
                    message: target.checked
                        ? __('Error added role')
                        : __('Error removing role'),
                    icon: (
                        <Icon.Feather.AlertOctagon
                            style={{ marginRight: 12 }}
                        />
                    ),
                    autoClose: 1000,
                });

                console.log(error);
                forceRefresh();
            });
    };

    return (
        <Checkbox
            defaultChecked={capability.allowed.includes(role.name)}
            onChange={onChange}
        />
    );
};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: CapabilityEditor
 * -----------------------------------------------------------------------------
 */
const CapabilityEditor = ({ capabilities = [] }) => {
    const currentRoles = useRoles();
    const roles = Object.values(currentRoles).filter(
        role => !['banned', 'super-admin', 'administrator'].includes(role.name),
    );

    const loadedCaps = useRef({});
    const [updated, setUpdated] = useState(1);
    const forceRefresh = () => setUpdated(updated + 1);
    const updateLoadedCaps = caps => {
        loadedCaps.current = caps.reduce((loaded, cap) => {
            loaded[cap.capability] = cap;
            return loaded;
        }, {});
        forceRefresh();
    };
    const capNames = capabilities.map(({ capability }) => capability);

    useEffect(() => {
        if (capNames.length > 0) {
            Promise.all(
                capNames.map(capability =>
                    Reactium.Cloud.run('capability-get', { capability }).then(
                        perm => ({
                            ...perm,
                            capability,
                        }),
                    ),
                ),
            ).then(updateLoadedCaps);
        }
    }, [capNames.sort().join('')]);

    const getColumns = () => {
        const columns = {
            capability: {
                label: __('Capability'),
                verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
                sortType: DataTable.ENUMS.SORT_TYPE.STRING,
                width: '40vw',
            },
        };

        roles.reduce((columns, role) => {
            columns[role.name] = {
                label: role.label,
                width: `${Math.floor(60 / (roles.length + 1))}vw`,
                verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
                textAlign: DataTable.ENUMS.TEXT_ALIGN.CENTER,
            };
            return columns;
        }, columns);

        return columns;
    };

    const roleControls = ({ capability: cap }) => {
        const capability = op.get(loadedCaps, ['current', cap], {
            allowed: [],
        });

        return roles.reduce((controls, role) => {
            controls[role.name] = (
                <RoleControl
                    capability={capability}
                    role={role}
                    forceRefresh={forceRefresh}
                />
            );
            return controls;
        }, {});
    };

    const data = capabilities.map(cap => ({
        capability: <CapabilityDescription {...cap} />,
        ...roleControls(cap),
    }));

    return (
        <Dialog header={{ title: __('Capabilities'), dismissable: false }}>
            <DataTable columns={getColumns()} data={data} />
        </Dialog>
    );
};

export default CapabilityEditor;
