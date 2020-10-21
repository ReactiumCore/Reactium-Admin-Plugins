import op from 'object-path';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';
import Reactium, { useEventHandle, useHookComponent } from 'reactium-core/sdk';

let ElementDialog = (props, ref) => {
    const {
        children,
        className,
        editor,
        elements = [],
        footer,
        helpText,
        pref,
        onCollapse,
        onExpand,
        title,
    } = props;

    const header = {
        title,
        elements,
    };

    const collapsibleRef = useRef();
    const dialogRef = useRef();

    const { Alert, Button, Collapsible, Dialog, Icon } = useHookComponent(
        'ReactiumUI',
    );

    let HelpComponent;
    const helpPrefsKey = String(pref).replace('.dialog.', '.help.');
    const expandedHelp = Reactium.Prefs.get(helpPrefsKey, true);
    const _onHelpCollapse = () => Reactium.Prefs.set(helpPrefsKey, false);
    const _onHelpExpand = () => Reactium.Prefs.set(helpPrefsKey, true);
    const toggleHelp = () => {
        const { expanded } = dialogRef.current.state;

        if (expanded) {
            collapsibleRef.current.toggle();
        } else {
            collapsibleRef.current.setState({ expanded: true });
            dialogRef.current.expand();
        }
    };

    if (helpText) {
        header.elements.push(
            <Button
                key='help'
                className='ar-dialog-header-btn'
                color={Button.ENUMS.COLOR.CLEAR}
                onClick={toggleHelp}
                size={Button.ENUMS.SIZE.XS}>
                <Icon name='Feather.HelpCircle' />
            </Button>,
        );

        HelpComponent = useHookComponent(helpText, props => (
            <div className={editor.cx('help')}>
                <Alert
                    {...props}
                    color={Alert.ENUMS.COLOR.INFO}
                    icon={<Icon name='Feather.HelpCircle' />}
                />
            </div>
        ));
    }

    const _handle = () => ({
        ...props,
        ...dialogRef.current,
    });

    const [handle, setHandle] = useEventHandle(() => _handle);

    useImperativeHandle(ref, () => handle);

    useEffect(() => {
        const newHandle = _handle();
        Object.entries(newHandle).forEach(([key, value]) => {
            handle[key] = value;
        });
        setHandle(handle);
    }, [dialogRef.current]);

    return (
        <Dialog
            ref={dialogRef}
            pref={pref}
            footer={footer}
            header={header}
            className={className}
            onCollapse={onCollapse}
            onExpand={onExpand}
            {...props}>
            {helpText && (
                <Collapsible
                    ref={collapsibleRef}
                    expanded={expandedHelp}
                    onCollapse={_onHelpCollapse}
                    onExpand={_onHelpExpand}>
                    <HelpComponent>{helpText}</HelpComponent>
                </Collapsible>
            )}
            {children}
        </Dialog>
    );
};

ElementDialog = forwardRef(ElementDialog);

export { ElementDialog, ElementDialog as default };
