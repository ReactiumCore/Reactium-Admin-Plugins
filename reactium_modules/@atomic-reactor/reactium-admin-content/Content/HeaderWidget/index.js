import op from 'object-path';
import React, { useCallback, useEffect } from 'react';
import ENUMS from 'reactium_modules/@atomic-reactor/reactium-admin-content/Content/enums';

import Reactium, {
    useDerivedState,
    useFulfilledObject,
    useHandle,
    useHookComponent,
    __,
} from 'reactium-core/sdk';

const AddButton = ({ type }) => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
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
    const [state, setState] = useDerivedState({
        init: false,
        status: null,
    });

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const Editor = useHandle('AdminContentEditor');
    const [ready] = useFulfilledObject(Editor, ['EventForm']);

    const isBusy = stat =>
        ['BEFORE-SAVE', 'SAVE', 'SAVE-SUCCESS'].includes(stat);

    const isLoading = stat => Boolean(String(stat).search(/^load/gi) > -1);

    const onStatus = e => {
        const status = e.event;
        setState({ status });
    };

    useEffect(() => {
        if (state.init === true || !ready) return;
        setState({ init: true });
        Editor.addEventListener('status', onStatus);
        return () => {
            Editor.removeEventListener('status', onStatus);
        };
    }, [ready]);

    const render = () => {
        const loading = isLoading(state.status);
        const busy = isBusy(state.status);
        const label = busy ? ENUMS.TEXT.SAVING : ENUMS.TEXT.SAVE;
        let icon = busy ? 'Feather.UploadCloud' : 'Feather.Check';
        icon = loading ? 'Feather.DownloadCloud' : icon;

        return (
            <Button
                appearance='pill'
                className='mr-xs-24 content-save-btn'
                color='primary'
                disabled={busy || loading}
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

const BranchSelector = () => {
    const [state, setState] = useDerivedState({
        init: false,
        status: null,
    });

    const Editor = useHandle('AdminContentEditor');
    const [ready] = useFulfilledObject(Editor, ['EventForm']);
    const { Button, Dropdown, Icon } = useHookComponent('ReactiumUI');

    const onStatus = e => {
        const status = e.event;
        if (status !== state.status) setState({ status });
    };

    useEffect(() => {
        if (state.init === true || !ready) return;
        setState({ init: true });
        Editor.addEventListener('status', onStatus);
        return () => {
            Editor.removeEventListener('status', onStatus);
        };
    }, [ready]);

    const render = () => {
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
    const path = op.get(Reactium.Routing.currentRoute, 'match.route.path');
    const { slug, type } = op.get(Reactium.Routing.currentRoute, 'params', {});

    const isVisible = useCallback(
        () => String(path).startsWith('/admin/content/:type'),
        [path],
    );

    return !isVisible() ? null : !slug ? (
        <AddButton type={type} />
    ) : (
        <>
            <BranchSelector /> <SaveButton type={type} />
        </>
    );
};
