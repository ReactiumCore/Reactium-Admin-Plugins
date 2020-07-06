import cn from 'classnames';
import React, { useRef } from 'react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';
import {
    Alert,
    Button,
    Checkbox,
    Collapsible,
    Dialog,
    Icon,
} from '@atomic-reactor/reactium-ui';

export default props => {
    const {
        children,
        className,
        editor,
        elements = [],
        footer,
        helpText,
        pref,
        title,
    } = props;

    const header = {
        title,
        elements,
    };

    const collapsibleRef = useRef();
    const dialogRef = useRef();

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

    return (
        <Dialog
            ref={dialogRef}
            pref={pref}
            footer={footer}
            header={header}
            className={className}>
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
