import op from 'object-path';
import ENUMS from 'components/Admin/Content/enums';
import useRouteParams from 'components/Admin/Tools/useRouteParams';
import { Button, Icon, Dropdown } from '@atomic-reactor/reactium-ui';
import React, { useCallback, useEffect, useState } from 'react';

import Reactium, {
    useAsyncEffect,
    useFulfilledObject,
    useHandle,
    __,
} from 'reactium-core/sdk';

const AddButton = ({ type }) => {
    return (
        <Button
            appearance='pill'
            className='mr-xs-24'
            color='primary'
            outline
            size='xs'
            to={`/admin/content/${type}/new`}
            type='link'>
            <Icon name='Feather.Plus' size={18} />
            <span className='hide-xs show-md ml-xs-12'>
                {ENUMS.TEXT.NEW} {type}
            </span>
        </Button>
    );
};

const SaveButton = ({ type }) => {
    const [status, setStatus] = useState();
    const Editor = useHandle('AdminContentEditor');
    const [ready] = useFulfilledObject(Editor, ['EventForm']);

    const isBusy = stat =>
        [
            Editor.EventForm.ENUMS.STATUS.SUBMITTING,
            Editor.EventForm.ENUMS.STATUS.VALIDATING,
        ].includes(stat);

    const onStatus = e => {
        const newStatus = e.event;
        if (newStatus !== status) setStatus(newStatus);
    };

    useEffect(() => {
        if (ready !== true) return;
        Editor.addEventListener('status', onStatus);
        return () => {
            Editor.removeEventListener('status', onStatus);
        };
    }, [ready]);

    const render = () => {
        const busy = isBusy(status);
        const label = busy ? ENUMS.TEXT.SAVING : ENUMS.TEXT.SAVE;
        const icon = busy ? 'Feather.UploadCloud' : 'Feather.Check';
        return (
            <Button
                appearance='pill'
                className='mr-xs-24'
                color='primary'
                disabled={busy}
                onClick={e => Editor.submit(e)}
                size='xs'
                type='button'>
                <Icon name={icon} size={18} />
                <span className='hide-xs show-md ml-xs-12'>
                    {String(label).replace('%type', type)}
                </span>
            </Button>
        );
    };

    return ready !== true ? null : render();
};

const BranchSelector = ({ type }) => {
    const [status, setStatus] = useState();
    const Editor = useHandle('AdminContentEditor');
    const [ready] = useFulfilledObject(Editor, ['EventForm']);

    const isBusy = stat =>
        [
            Editor.EventForm.ENUMS.STATUS.SUBMITTING,
            Editor.EventForm.ENUMS.STATUS.VALIDATING,
        ].includes(stat);

    const onStatus = e => {
        const newStatus = e.event;
        if (newStatus !== status) setStatus(newStatus);
    };

    useEffect(() => {
        if (ready !== true) return;
        Editor.addEventListener('status', onStatus);
        return () => {
            Editor.removeEventListener('status', onStatus);
        };
    }, [ready]);

    const render = () => {
        const busy = isBusy(status);
        const tooltip = __('Select version');
        const branches = op.get(Editor, 'value.branches', {});
        const branch = op.get(Editor, 'value.history.branch');
        const currentLabel = op.get(branches, [branch, 'label'], branch);
        const showDropdown = branch && Object.values(branches).length > 1;
        if (!showDropdown) return null;
        return (
            <Dropdown
                className='header-branch-selector mr-xs-8'
                data={Object.entries(branches).map(([branchId, value]) => ({
                    label: op.get(value, 'label', branchId),
                    value: branchId,
                }))}
                size={Button.ENUMS.SIZE.MD}
                maxHeight={160}
                selection={[branch]}
                onChange={({ selection }) => {
                    const [branchId] = selection;
                    if (branchId !== branch) {
                        Editor.setBranch(branchId);
                    }
                }}>
                <div className='header-branch-selector-trigger'>
                    <Button
                        className='header-branch-selector-trigger-btn'
                        size={Button.ENUMS.SIZE.SM}
                        color={Button.ENUMS.COLOR.CLEAR}
                        data-vertical-align='bottom'
                        data-align='center'
                        data-tooltip={tooltip}
                        data-dropdown-element>
                        <div className={'select-dropdown-label'}>
                            <span>{currentLabel}</span>
                            <Icon name='Feather.ChevronDown' />
                        </div>
                    </Button>
                </div>
            </Dropdown>
        );
    };

    return ready !== true ? null : render();
};

export default () => {
    const { path, slug, type } = useRouteParams(['path', 'type', 'slug']);
    const visible = String(path).startsWith('/admin/content/:type');

    if (!visible) return null;
    return !slug ? (
        <AddButton type={type} />
    ) : (
        <>
            <BranchSelector type={type} /> <SaveButton type={type} />
        </>
    );
};
