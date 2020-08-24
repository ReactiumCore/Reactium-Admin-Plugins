import _ from 'underscore';
import op from 'object-path';
import React, { useEffect } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
    useRefs,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: JsxComponent
 * -----------------------------------------------------------------------------
 */
const HelpText = () => __('Enter the JSX output of a React component render()');

const defaultCode = '<div>Component</div>';

const themeIcon = theme =>
    theme === 'ReactiumDark' ? 'Feather.Sun' : 'Feather.Moon';

const JsxComponent = ({ handle, id }) => {
    // -------------------------------------------------------------------------
    // Props
    // -------------------------------------------------------------------------
    const { cx, editor, namespace } = handle;

    // -------------------------------------------------------------------------
    // Components
    // -------------------------------------------------------------------------
    const { Alert, Button, Collapsible, Icon } = useHookComponent('ReactiumUI');

    const CodeEditor = useHookComponent('CodeEditor');

    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------
    const refs = useRefs();

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [state, setState] = useDerivedState({
        code: defaultCode,
        helpExpanded: Reactium.Prefs.get(`admin.help.${namespace}-type`),
        theme: Reactium.Prefs.get('admin.theme.codeEditor', 'ReactiumDark'),
    });

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------

    const component = () => {
        const { type } = editor.value;
        return type !== id
            ? state.code
            : op.get(editor.value, 'component', state.code);
    };

    const header = ({ header: currentHeader, active }) => {
        if (active !== id) return;
        const { elements = [] } = handle.header(true);

        const buttons = [
            {
                key: 'component-type-info',
                onClick: helpToggle,
                icon: 'Feather.AlertCircle',
            },
            {
                key: 'component-type-theme',
                onClick: themeToggle,
                icon: themeIcon(state.theme),
            },
        ];

        const buttonProps = {
            className: 'ar-dialog-header-btn',
            color: Button.ENUMS.COLOR.CLEAR,
            style: { paddingLeft: 2 },
        };

        buttons.forEach(({ key, icon, ...btn }) =>
            elements.splice(
                0,
                0,
                <Button key={key} {...buttonProps} {...btn}>
                    <Icon name={icon} />
                </Button>,
            ),
        );
        op.set(currentHeader, 'elements', elements);
    };

    const helpToggle = () => {
        const help = refs.get('help');
        if (help) help.toggle();
    };

    const reset = () => {
        setState({ code: defaultCode });
        const codeEditor = refs.get('code');
        if (codeEditor) codeEditor.setValue(component());
    };

    const themeToggle = () => {
        let { theme } = state;
        theme = theme === 'ReactiumDark' ? 'ReactiumLight' : 'ReactiumDark';
        Reactium.Prefs.set('admin.theme.codeEditor', theme);
        setState({ theme });
        _.defer(() => handle.setState({ updated: Date.now() }));
    };

    const _onActive = ({ active = 'selector' }) => {
        if (active !== id) {
            reset();
        } else {
            const codeEditor = refs.get('code');
            if (codeEditor) codeEditor.setValue(component());
        }
    };

    const _onHelpToggle = () => {
        const help = refs.get('help');
        const { expanded } = help.state;
        Reactium.Prefs.set(`admin.help.${namespace}-type`, !expanded);
        setState({ helpExpanded: !expanded });
    };

    const _onSubmit = () => {
        handle.save({ ...editor.value, type: id, component: state.code });
    };

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------

    useEffect(() => {
        handle.addEventListener('change', _onActive);
        handle.addEventListener('header', header);

        return () => {
            handle.removeEventListener('change', _onActive);
            handle.removeEventListener('header', header);
        };
    }, [Object.values(editor.value)]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <div className={cx('jsx')}>
            <Collapsible
                expanded={state.helpExpanded}
                onCollapse={_onHelpToggle}
                onExpand={_onHelpToggle}
                ref={elm => refs.set('help', elm)}>
                <div className='help'>
                    <Alert>
                        <HelpText />
                    </Alert>
                </div>
            </Collapsible>
            <div className={cx('jsx-code')}>
                <Scrollbars>
                    <CodeEditor
                        lineNumbers
                        onChange={({ value: code }) => setState({ code })}
                        ref={elm => refs.set('code', elm)}
                        theme={state.theme}
                        value={component()}
                    />
                </Scrollbars>
            </div>
            <div className={cx('jsx-footer')}>
                <Button onClick={_onSubmit}>
                    {__('Apply Component Type')}
                </Button>
            </div>
        </div>
    );
};

export default JsxComponent;
