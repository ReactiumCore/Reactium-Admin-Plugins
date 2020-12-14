import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import { List } from './List';
import { Editor } from 'slate';
import { useEditor } from 'slate-react';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useHookComponent,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

const ENUMS = {
    STATUS: {
        FETCHING: 'FETCHING',
        PENDING: 'PENDING',
        READY: 'READY',
    },
};

const SidebarButton = props => {
    const editor = useEditor();

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const onClick = () => {
        const x = window.innerWidth / 2 - 150;
        editor.panel
            .setID('block-select')
            .setContent(<Panel />)
            .moveTo(x, 50)
            .show();
    };

    return (
        <Button
            {...Reactium.RTE.ENUMS.PROPS.BUTTON}
            data-tooltip={__('Content Block')}
            onClick={onClick}
            {...props}>
            <Icon
                {...Reactium.RTE.ENUMS.PROPS.ICON}
                name='Feather.Box'
                size={20}
            />
        </Button>
    );
};

const Panel = () => {
    const refs = useRefs();

    const editor = useEditor();

    const { Dialog, Spinner } = useHookComponent('ReactiumUI');

    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    const [state, update] = useDerivedState({
        data: [],
        search: null,
    });

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    const cx = Reactium.Utils.cxFactory('blocks-rte');

    const fetch = params => {
        const refresh = op.get(params, 'refresh');
        const search = op.get(params, 'search');

        if (refresh === true) Reactium.Cache.del('rte-block-list');

        let qry = Reactium.Cache.get('rte-block-list');

        if (qry) return qry;

        qry = new Reactium.Query('Content_block');
        qry.equalTo('status', 'PUBLISHED');
        qry.ascending('title');
        qry.limit(100);

        if (search) qry.matches('title', new RegExp(search, 'gi'));
        Reactium.Cache.set('rte-block-list', qry, 5000);

        return qry.find().then(response =>
            response.map(item => ({
                objectId: item.id,
                label: item.get('title'),
                content: item.get('content'),
            })),
        );
    };

    const hide = () => editor.panel.hide(false, true).setID('rte-panel');

    const insertNodes = (children = []) => {
        const nodes = JSON.parse(JSON.stringify(children));
        const last = _.last(nodes);
        if (Editor.isEmpty(editor, last)) nodes.pop();
        if (nodes.length < 1) return;
        Reactium.RTE.insertBlock(editor, nodes);
    };

    const search = _.throttle(_search, 100);

    const unMounted = () => !refs.get('container');

    const _onSelect = value => {
        insertNodes(op.get(value, 'content.children', []));
        hide();
    };

    const _onSearch = e => search(e.target.value);

    const _search = value => {
        value = _.isEmpty([value]) ? null : value;
        setState({ search: value });
    };

    useAsyncEffect(async () => {
        if (!isStatus(ENUMS.STATUS.PENDING)) return;
        setStatus(ENUMS.STATUS.FETCHING, true);
        const data = await fetch();
        setStatus(ENUMS.STATUS.READY);
        setState({ data });
    }, [status]);

    useAsyncEffect(async () => {
        if (!isStatus(ENUMS.STATUS.READY)) return;
        const data = await fetch({ refresh: true, search: state.search });
        setState({ data });
    }, [op.get(state, 'search')]);

    return (
        <Dialog
            dismissable
            onDismiss={hide}
            collapsible={false}
            ref={elm => refs.set('container', elm)}
            header={{ title: __('Content Block') }}>
            <div className={cx()}>
                <List
                    cx={cx}
                    blocks={state.data}
                    onClick={_onSelect}
                    onSearch={_onSearch}
                />
                {!isStatus(ENUMS.STATUS.READY) && (
                    <div className={cx('spinner')}>
                        <Spinner />
                    </div>
                )}
            </div>
        </Dialog>
    );
};

export { SidebarButton };
