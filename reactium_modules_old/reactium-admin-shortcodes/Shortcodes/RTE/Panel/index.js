import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Transforms } from 'slate';
import React, { useRef } from 'react';
import Attributes from './Attributes';
import { ReactEditor, useEditor } from 'slate-react';
import { Scrollbars } from 'react-custom-scrollbars';

import SDK from '../../sdk';

import Reactium, {
    useAsyncEffect,
    useDerivedState,
    useHandle,
    useHookComponent,
    useStatus,
} from 'reactium-core/sdk';

const ENUMS = {
    STATUS: {
        PENDING: 'PENDING',
        INITIALIZING: 'INITIALIZING',
        READY: 'READY',
    },
};

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Panel
 * -----------------------------------------------------------------------------
 */
let Panel = ({ editor, namespace, title, ...props }) => {
    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------

    const containerRef = useRef();

    // Components
    const { Dialog, Spinner } = useHookComponent('ReactiumUI');
    const tools = useHandle('AdminTools');

    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    const [state, update] = useDerivedState({
        search: null,
        selection: props.selection,
        shortcodes: {},
    });

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------

    // cx(suffix:String);
    // className extension
    const cx = Reactium.Utils.cxFactory(namespace);

    const hide = () => {
        editor.panel.hide(false, true).setID('rte-panel');
        //ReactEditor.focus(editor);
    };

    const insertNode = shortcode => {
        const node = {
            id: uuid(),
            children: [{ text: shortcode.code }],
            shortcode,
            type: 'shortcode',
        };
        Transforms.insertNodes(editor, node, { at: state.selection });
    };

    // initialize();
    const initialize = async () => {
        if (!isStatus(ENUMS.STATUS.PENDING)) return;
        setStatus(ENUMS.STATUS.INITIALIZING, true);

        let shortcodes = SDK.list();
        if (!shortcodes || Object.keys(shortcodes).length < 1) {
            shortcodes = await SDK.list(true);
        }

        if (unMounted()) return;
        setStatus(ENUMS.STATUS.READY);
        setState({ shortcodes });
    };

    const _search = value => {
        value = _.isEmpty([value]) ? null : value;
        setState({ search: value });
    };

    const search = _.throttle(_search, 100);

    const shortcodes = () =>
        Object.values(state.shortcodes).filter(item => {
            let s = state.search;
            if (s === null) return true;

            s = String(s).toLowerCase();
            const { code, replacer } = item;

            return (
                String(code)
                    .toLowerCase()
                    .includes(s) ||
                String(replacer)
                    .toLowerCase()
                    .includes(s)
            );
        });

    // unmount();
    // check if the component has been unmounted
    const unMounted = () => !containerRef.current;

    const insert = shortcode => {
        insertNode(shortcode);
        hide();
    };

    // handlers
    const onSelect = shortcode => {
        const type = SDK.Component.get(shortcode.type);

        if (!op.get(type, 'attributes')) {
            insert(shortcode);
        } else {
            const Modal = op.get(tools, 'Modal');
            Modal.show(
                <Attributes
                    shortcode={shortcode}
                    insert={insert}
                    Modal={Modal}
                />,
            );
        }
    };

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------
    useAsyncEffect(initialize, [status]);

    return (
        <Dialog
            ref={containerRef}
            collapsible={false}
            dismissable={false}
            header={{
                elements: [<CloseButton key='close-btn' onClick={hide} />],
                title,
            }}>
            <div className={cx()}>
                <div className={cx('search')}>
                    <div className='form-group'>
                        <input
                            data-focus
                            type='search'
                            placeholder='search'
                            className='grow'
                            onFocus={e => e.target.select()}
                            onChange={e => search(e.target.value)}
                        />
                    </div>
                </div>
                <div className={cx('list')}>
                    <Scrollbars>
                        <ul>
                            {shortcodes().map((shortcode, i) => (
                                <Shortcode
                                    cx={cx}
                                    key={`shortcode-${i}`}
                                    onClick={() => onSelect(shortcode)}
                                    shortcode={shortcode}
                                />
                            ))}
                        </ul>
                    </Scrollbars>
                    {!isStatus(ENUMS.STATUS.READY) && (
                        <div className={cx('spinner')}>
                            <Spinner />
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
};

const Shortcode = ({ cx, shortcode, ...props }) => {
    const { code } = shortcode;

    return (
        <li className={cx('list-item')}>
            <button {...props}>{code}</button>
        </li>
    );
};

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

Panel.ENUMS = ENUMS;

Panel.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    onStatus: PropTypes.func,
};

Panel.defaultProps = {
    namespace: 'shortcodes-rte',
    onStatus: noop,
    title: 'Shortcodes',
};

export { Panel, Panel as default };
