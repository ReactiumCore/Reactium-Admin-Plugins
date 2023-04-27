import uuid from 'uuid/v4';
import cn from 'classnames';
import PropTypes from 'prop-types';
import Dialog from 'reactium-ui/Dialog';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const noop = () => {};

const ENUMS = Dialog.ENUMS;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Tabs
 * -----------------------------------------------------------------------------
 */
let Tabs = ({ children, data = {}, id, namespace, ...props }, ref) => {
    // Refs
    const dialogRef = useRef();
    const stateRef = useRef({
        prevState: { activeTab: -1 },
        ...props,
    });

    // State
    const [state, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = newState => {
        // Get the previous state
        const prevState = { ...stateRef.current };

        // Update the stateRef
        stateRef.current = {
            ...prevState,
            ...newState,
            prevState,
        };

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    const _onChange = () => {
        const { activeTab, onChange, prevState } = stateRef.current;

        if (activeTab === prevState.activeTab) {
            return;
        }

        const evt = {
            type: ENUMS.EVENT.CHANGE,
            activeTab,
            state: stateRef.current,
        };
        onChange(evt);
    };

    const _onTabClick = (e, index, callback = noop) => {
        const { activeTab } = stateRef.current;
        if (activeTab !== index) {
            setState({ activeTab: index });
            callback({ ...e, activeTab: index });
        }
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        dialog: dialogRef.current,
        setState,
        state: stateRef.current,
    }));

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    useEffect(() => _onChange(), Object.values(state));

    const renderContent = () => {
        const { activeTab = 0 } = stateRef.current;
        return (
            <div className={`${namespace}-panels`} id={`${id}-panels`}>
                {data.map((item, i) => {
                    const { content } = item;

                    if (!content) {
                        return null;
                    }

                    const active = activeTab === i;
                    const key = `${id}-panel-${i}`;
                    const cname = cn({
                        [`${namespace}-panel`]: true,
                        active,
                    });

                    return (
                        <div key={key} className={cname}>
                            {content}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderTabs = () => {
        const { activeTab = 0, disabled = false } = stateRef.current;

        return (
            <div className={`${namespace}-bar`} id={`${id}-bar`}>
                {data.map((item, i) => {
                    const { tab } = item;

                    if (!tab) {
                        return null;
                    }

                    const active = activeTab === i;
                    const key = `${id}-tab-${i}`;
                    let cname = cn({
                        [namespace]: true,
                        active,
                    });

                    if (typeof tab === 'string') {
                        return (
                            <button
                                disabled={disabled}
                                key={key}
                                type='button'
                                className={cname}
                                onClick={e => _onTabClick(e, i)}>
                                {tab}
                            </button>
                        );
                    } else {
                        const { className, onClick } = tab.props;

                        cname = cn({
                            [className]: !!className,
                            [namespace]: true,
                            active,
                        });

                        return React.cloneElement(tab, {
                            ...tab.props,
                            key,
                            disabled,
                            className: cname,
                            onClick: e => _onTabClick(e, i, onClick),
                        });
                    }
                })}
                {children}
            </div>
        );
    };

    const render = () => {
        const header = {
            elements: [renderTabs()],
        };
        const dprops = { ...props };
        delete dprops.disabled;
        delete dprops.activeTab;

        return (
            <Dialog {...dprops} header={header} ref={dialogRef}>
                {renderContent()}
            </Dialog>
        );
    };

    return render();
};

Tabs = forwardRef(Tabs);

Tabs.propTypes = {
    ...Dialog.propTypes,
    activeTab: PropTypes.number,
    data: PropTypes.array.isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
};

Tabs.defaultProps = {
    ...Dialog.defaultProps,
    activeTab: 0,
    data: [],
    disabled: false,
    id: `ar-tab-${uuid()}`,
    namespace: 'ar-tab',
    onChange: noop,
};

export { Tabs, Tabs as default };
