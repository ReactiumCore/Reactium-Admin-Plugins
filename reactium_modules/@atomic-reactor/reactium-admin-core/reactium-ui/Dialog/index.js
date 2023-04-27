import uuid from 'uuid/v4';
import ENUMS from './enums';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import Icon from 'reactium-ui/Icon';
import Prefs from 'reactium-ui/Prefs';
import Button from 'reactium-ui/Button';
import Collapsible from 'reactium-ui/Collapsible';
import Dismissable from 'reactium-ui/Dismissable';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Dialog
 * -----------------------------------------------------------------------------
 */
let Dialog = ({ children, id, pref, ...props }, ref) => {
    // Refs
    const containerRef = useRef();
    const contentRef = useRef();
    const stateRef = useRef({
        ...props,
        ...Prefs.get(pref),
    });

    // State
    const [, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = newState => {
        // Update the stateRef
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        // Trigger useEffect()
        setNewState(stateRef.current);

        // Update prefs
        setPrefs();
    };

    const setPrefs = () => {
        const { expanded } = stateRef.current;
        if (pref) {
            Prefs.set(pref, { expanded });
        }
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        collapse: () => contentRef.current.collapse(),
        container: containerRef,
        content: contentRef,
        expand: () => contentRef.current.expand(),
        hide: () => containerRef.current.hide(),
        show: () => containerRef.current.show(),
        state: stateRef.current,
        toggle: {
            collapse: () => contentRef.current.toggle(),
            visible: () => containerRef.current.toggle(),
        },
    }));

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    // Handlers
    const _onButtonClick = (e, callback = noop) => {
        const { dismiss, toggle } = e.currentTarget.dataset;

        if (toggle) {
            contentRef.current.toggle();
            return;
        }

        if (dismiss) {
            containerRef.current
                .hide()
                .then(() => setState({ visible: false }));
        }

        callback(e);
    };

    const _onCollapse = e => {
        e.target = contentRef.current;
        const { onCollapse } = stateRef.current;
        setState({ expanded: false });
        onCollapse(e);
    };

    const _onExpand = e => {
        e.target = contentRef.current;
        const { onExpand } = stateRef.current;
        setState({ expanded: true });
        onExpand(e);
    };

    const _onHide = e => {
        e.target = containerRef.current;
        const { onDismiss, onHide } = stateRef.current;
        setState({ visible: false });
        onHide(e);
        onDismiss({ ...e, type: 'dismiss' });
    };

    const _onShow = e => {
        e.target = containerRef.current;
        const { onShow } = stateRef.current;
        setState({ visible: true });
        onShow(e);
    };

    const _clone = (elements = []) =>
        elements.map(element => {
            const key = op.get(element, 'key');
            const newKey = `dialog-clone-${uuid()}`;
            const onClick = op.get(element, 'onClick');
            const newProps = {
                key: key ? key : newKey,
            };
            if (onClick)
                op.set(newProps, 'onClick', e => _onButtonClick(e, onClick));
            // only need clone for onClick decorator
            if (onClick) return React.cloneElement(element, newProps);
            // if key provided, pass on through
            if (key) return element;
            // fragment will do if all we need is key
            return <React.Fragment key={newKey}>{element}</React.Fragment>;
        });

    // Renderers
    const renderHeader = () => {
        const {
            collapsible,
            dismissable,
            expanded = true,
            header = {},
            namespace,
        } = stateRef.current;

        let { elements = [], title } = header;

        const cname = cn({
            [`${namespace}-header`]: true,
            expanded,
        });

        title = typeof title === 'string' ? <h2>{title}</h2> : title;

        return (
            <div className={cname}>
                {title}
                {(elements.length > 0 || collapsible || dismissable) && (
                    <div className={`${namespace}-header-buttons`}>
                        {elements.length > 0 && _clone(elements)}
                        {collapsible === true && (
                            <Button
                                data-toggle
                                onClick={_onButtonClick}
                                size={Button.ENUMS.SIZE.XS}
                                color={Button.ENUMS.COLOR.CLEAR}
                                className='ar-dialog-header-btn toggle'>
                                <Icon name='Feather.ChevronDown' />
                            </Button>
                        )}
                        {dismissable === true && (
                            <Button
                                data-dismiss
                                onClick={_onButtonClick}
                                size={Button.ENUMS.SIZE.XS}
                                color={Button.ENUMS.COLOR.CLEAR}
                                className='ar-dialog-header-btn dismiss'>
                                <Icon name='Feather.X' />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        const { collapsible, expanded, namespace } = stateRef.current;

        return collapsible ? (
            <Collapsible
                ref={contentRef}
                expanded={expanded}
                onCollapse={_onCollapse}
                onExpand={_onExpand}>
                <div className={`${namespace}-content`}>{children}</div>
                {renderFooter()}
            </Collapsible>
        ) : (
            <>
                <div ref={contentRef} className={`${namespace}-content`}>
                    {children}
                </div>
                {renderFooter()}
            </>
        );
    };

    const renderFooter = () => {
        let { footer = {}, namespace } = stateRef.current;
        const { elements = [], align } = {
            ...Dialog.defaultProps.footer,
            ...footer,
        };

        const cname = cn({
            [`${namespace}-footer`]: true,
            [`flex-${align}`]: true,
        });

        return (
            <div className={cname}>
                {elements.length > 0 && _clone(elements)}
            </div>
        );
    };

    const Content = ({ className, dismissable, namespace, visible }) => (
        <div
            id={id}
            ref={!dismissable ? containerRef : null}
            className={cn({
                [className]: !!className,
                [namespace]: !!namespace,
                visible,
            })}>
            {renderHeader()}
            {renderContent()}
        </div>
    );

    const render = () => {
        const { dismissable, visible } = stateRef.current;

        return dismissable === true ? (
            <Dismissable
                visible={visible}
                ref={containerRef}
                onHide={_onHide}
                onShow={_onShow}>
                {Content(stateRef.current)}
            </Dismissable>
        ) : (
            Content(stateRef.current)
        );
    };

    return render();
};

Dialog = forwardRef(Dialog);

Dialog.ENUMS = ENUMS;

Dialog.propTypes = {
    className: PropTypes.string,
    collapsible: PropTypes.bool,
    dismissable: PropTypes.bool,
    expanded: PropTypes.bool,
    footer: PropTypes.shape({
        align: PropTypes.oneOf(Object.values(ENUMS.ALIGN)),
        elements: PropTypes.arrayOf(PropTypes.element),
    }),
    header: PropTypes.shape({
        title: PropTypes.node,
        elements: PropTypes.arrayOf(PropTypes.element),
    }),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    namespace: PropTypes.string,
    onCollapse: PropTypes.func,
    onDismiss: PropTypes.func,
    onExpand: PropTypes.func,
    onHide: PropTypes.func,
    onShow: PropTypes.func,
    pref: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    style: PropTypes.object,
    visible: PropTypes.bool,
};

Dialog.defaultProps = {
    collapsible: true,
    footer: {
        align: ENUMS.ALIGN.RIGHT,
        elements: [],
    },
    id: `ar-${uuid()}`,
    namespace: 'ar-dialog',
    onCollapse: noop,
    onDismiss: noop,
    onExpand: noop,
    onHide: noop,
    onShow: noop,
    style: {},
    visible: true,
};

export { Dialog, Dialog as default };
