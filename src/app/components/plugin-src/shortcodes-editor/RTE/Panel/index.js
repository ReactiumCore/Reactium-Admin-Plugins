import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Editor, Transforms } from 'slate';
import { ReactEditor, useEditor } from 'slate-react';
import { Scrollbars } from 'react-custom-scrollbars';

import Attributes from './Attributes';

import Reactium, {
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useFullfilledObject,
    useHandle,
    useHookComponent,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useEffect,
} from 'react';

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
let Panel = ({ namespace, title, ...props }) => {
    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------
    const status = useRef(ENUMS.STATUS.PENDING);
    const containerRef = useRef();

    // Components
    const { Dialog, Spinner } = useHookComponent('ReactiumUI');
    const tools = useHandle('AdminTools');

    // editor ref
    const editor = useEditor();

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

    const setStatus = newStatus => {
        if (unMounted()) return;
        status.current = newStatus;
    };

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------

    // cx(suffix:String);
    // className extension
    const cx = Reactium.Utils.cxFactory(namespace);

    const hide = () => {
        editor.panel.hide(false, true).setID('rte-panel');
        ReactEditor.focus(editor);
    };

    const insertNode = shortcode => {
        const children = [{ text: shortcode.code }];
        const node = {
            id: uuid(),
            children,
            shortcode,
            type: 'shortcode',
        };

        Transforms.insertNodes(editor, node, { at: state.selection });
    };

    // initialize();
    const initialize = async mounted => {
        if (status.current !== ENUMS.STATUS.PENDING) return;
        setStatus(ENUMS.STATUS.INITIALIZING);

        let shortcodes = Reactium.Shortcode.list();
        if (!shortcodes || Object.keys(shortcodes).length < 1) {
            shortcodes = await Reactium.Shortcode.list(true);
        }

        if (!mounted()) return;
        setState({ shortcodes });
        setStatus(ENUMS.STATUS.READY);
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
        const type = Reactium.Shortcode.Component.get(shortcode.type);

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
    useAsyncEffect(initialize, [status.current]);

    return (
        <Dialog
            ref={containerRef}
            collapsible={false}
            dismissable={false}
            header={{
                elements: [<CloseButton onClick={hide} />],
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
                    {status.current !== ENUMS.STATUS.READY && (
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
    const { code, key, replacer, type } = shortcode;

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
