import React, { useEffect, useState, useRef } from 'react';
import { useCapabilityCheck, useAsyncEffect } from 'reactium-core/sdk';
import { Icon, Dialog, Checkbox } from '@atomic-reactor/reactium-ui';
import DataTable from '@atomic-reactor/reactium-ui/DataTable';

import Reactium, {
    __,
    useRoles,
    useHandle,
    useWindowSize,
} from 'reactium-core/sdk';
import op from 'object-path';

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

const RoleControl = ({
    canSet = false,
    capName,
    capability,
    role,
    forceRefresh,
}) => {
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
            capability: capName,
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
        capability.allowed && (
            <Checkbox
                defaultChecked={capability.allowed.includes(role.name)}
                onChange={onChange}
                disabled={!canSet}
            />
        )
    );
};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: CapabilityEditor
 * -----------------------------------------------------------------------------
 */
const CapabilityEditor = ({ capabilities = [] }) => {
    const canSet = useCapabilityCheck(
        ['Capability.create', 'Capability.update'],
        false,
    );
    const currentRoles = useRoles();
    const roles = Object.values(currentRoles).filter(
        role => !['banned', 'super-admin', 'administrator'].includes(role.name),
    );

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

    const loadedCaps = useRef({});
    const [updated, setUpdated] = useState(1);
    const forceRefresh = () => setUpdated(updated + 1);
    const capNames = capabilities.map(({ capability }) => capability);
    useAsyncEffect(
        async isMounted => {
            if (capNames.length > 0) {
                const caps = await Reactium.Capability.get(capNames);
                loadedCaps.current = caps;
                if (isMounted()) forceRefresh();
            }
        },
        [capNames.sort().join('')],
    );

    const getColumns = () => {
        const columns = {
            capability: {
                label: __('Capability'),
                verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
                sortType: DataTable.ENUMS.SORT_TYPE.STRING,
                // width: '20vw',
            },
        };

        roles.reduce((columns, role) => {
            columns[role.name] = {
                label: role.label,
                width: `${Math.floor(maxPermWidth / (roles.length + 1))}vw`,
                verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
                textAlign: DataTable.ENUMS.TEXT_ALIGN.CENTER,
            };
            return columns;
        }, columns);

        return columns;
    };

    const roleControls = ({ capability: cap }) => {
        const capability = op.get(loadedCaps, ['current', cap], {
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
                            forceRefresh={forceRefresh}
                            canSet={canSet}
                        />
                    )}
                </>
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
            <DataTable
                scrollable={true}
                height={`${Math.min(data.length * 43 + 21, 450)}px`}
                columns={getColumns()}
                data={data}
            />
        </Dialog>
    );
};

export default CapabilityEditor;
