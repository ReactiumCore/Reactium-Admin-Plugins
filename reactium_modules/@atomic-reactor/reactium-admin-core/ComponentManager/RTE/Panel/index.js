import List from './List';
import _ from 'underscore';
import uuid from 'uuid/v4';
import SDK from '../../sdk';
import op from 'object-path';
import PropTypes from 'prop-types';
import Attributes from './Attributes';
import { useEditor } from 'slate-react';
import React, { useEffect } from 'react';
import { useEditorSelection } from '../../../registered-components/RichTextEditor/_utils';

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
        INITIALIZING: 'INITIALIZING',
        READY: 'READY',
    },
};

const noop = () => {};

const CloseButton = props => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <Button
            size={Button.ENUMS.SIZE.XS}
            color={Button.ENUMS.COLOR.CLEAR}
            className='ar-dialog-header-btn dismiss'
            {...props}>
            <Icon name='Feather.X' />
        </Button>
    );
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Panel
 * -----------------------------------------------------------------------------
 */
let Panel = ({ namespace, title, ...props }) => {
    const editor = useEditor();
    const [selection] = useEditorSelection(editor);

    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------
    const refs = useRefs();

    // -------------------------------------------------------------------------
    // Components & Handles
    // -------------------------------------------------------------------------
    // const tools = useHandle('AdminTools');
    const { Carousel, Dialog, Slide, Spinner } = useHookComponent('ReactiumUI');

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------
    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [state, update] = useDerivedState({
        blocks: {},
        request: null,
        search: null,
        selection: props.selection,
    });

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------
    const blocks = () =>
        Object.values(state.blocks).filter(item => {
            let s = state.search;
            if (s === null) return true;

            s = String(s).toLowerCase();
            const label = op.get(item, 'label', '');
            const name = op.get(item, 'name', '');

            return (
                String(label)
                    .toLowerCase()
                    .includes(s) ||
                String(name)
                    .toLowerCase()
                    .includes(s)
            );
        });

    const cx = Reactium.Utils.cxFactory(namespace);

    const hide = index => {
        const carousel = refs.get('carousel');
        if (!carousel) return;

        index = index || carousel.index;

        if (index > 0) {
            carousel.prev();
        } else {
            editor.panel.hide(false, true).setID('rte-panel');
        }
    };

    const initialize = async () => {
        if (!isStatus(ENUMS.STATUS.PENDING)) return;
        setStatus(ENUMS.STATUS.INITIALIZING, true);

        const blocks = await SDK.list();

        if (unMounted()) return;
        setStatus(ENUMS.STATUS.READY);
        setState({ blocks });
    };

    const insert = async block => {
        if (isStatus(ENUMS.STATUS.FETCHING)) return;

        const { attribute = [] } = block;

        if (attribute.length > 0) {
            const carousel = refs.get('carousel');
            const form = refs.get('attributes');

            if (!carousel || !form) return;

            form.setAttributes(attribute);
            form.setBlock(block);
            form.setValue(null);

            setState({ block });

            carousel.next();
        } else {
            insertNode(block);
            hide();
        }
    };

    const insertNode = ({ children, ...block }) => {
        children = children || [{ text: '' }];
        const id = uuid();
        const node = [
            {
                children,
                ID: id,
                id,
                block,
                type: 'component',
            },
        ];

        Reactium.RTE.insertBlock(editor, node, {
            at: selection,
            id: `block-${id}`,
        });
    };

    const listeners = () => {
        const form = refs.get('attributes');
        if (form) form.addEventListener('submit', _onSubmit);

        return () => {
            if (form) form.removeEventListener('submit', _onSubmit);
        };
    };

    const search = value => {
        value = _.isEmpty([value]) ? null : value;
        setState({ search: value });
    };

    const unMounted = () => !refs.get('container');

    // -------------------------------------------------------------------------
    // Callbacks
    // -------------------------------------------------------------------------

    const _onSearch = _.throttle(search, 100);

    const _onSelect = block => insert(block);

    const _onSubmit = ({ block }) => {
        const attr = op.get(block, 'attribute');
        if (!attr || !_.isObject(attr)) op.set(block, 'attribute', {});
        Reactium.Hook.runSync('block-attributes', block);
        insertNode(block);
        hide(-1);
    };

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------
    useAsyncEffect(initialize, [status]);

    useEffect(listeners, []);

    return (
        <Dialog
            collapsible={false}
            dismissable={false}
            header={{
                elements: [
                    <CloseButton key='close-btn' onClick={() => hide()} />,
                ],
                title,
            }}
            ref={elm => refs.set('container', elm)}>
            <div className={cx()}>
                <Carousel ref={elm => refs.set('carousel', elm)}>
                    <Slide>
                        <List
                            blocks={blocks()}
                            cx={cx}
                            onClick={_onSelect}
                            onSearch={e => _onSearch(e.target.value)}
                        />
                    </Slide>
                    <Slide>
                        <Attributes
                            cx={cx}
                            onSubmit={_onSubmit}
                            refs={refs}
                            ref={elm => refs.set('attributes', elm)}
                            unMounted={unMounted}
                        />
                    </Slide>
                </Carousel>
            </div>
            {!isStatus(ENUMS.STATUS.READY) && (
                <div className={cx('spinner')}>
                    <Spinner />
                </div>
            )}
        </Dialog>
    );
};

Panel.ENUMS = ENUMS;

Panel.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    onStatus: PropTypes.func,
};

Panel.defaultProps = {
    namespace: 'blocks-rte',
    onStatus: noop,
    title: __('Components'),
};

export { Panel, Panel as default };
