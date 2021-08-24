import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';
import Reactium, {
    __,
    useEventHandle,
    useHookComponent,
    useIsContainer,
    useRefs,
} from 'reactium-core/sdk';

const HeaderButton = forwardRef(
    ({ children, className, icon, ...props }, ref) => {
        const { Button, Icon } = useHookComponent('ReactiumUI');
        className = cn('ar-dialog-header-btn', className);
        return (
            <Button
                size={Button.ENUMS.SIZE.XS}
                color={Button.ENUMS.COLOR.CLEAR}
                className={className}
                ref={ref}
                {...props}>
                {icon && <Icon name={icon} />}
                {children}
            </Button>
        );
    },
);

const defaultValue = content => {
    content = Array.isArray(content) ? content : [content];
    content = content.map(item => {
        return op.get(item, 'type') === 'empty'
            ? { ...item, type: 'div' }
            : item;
    });

    return { children: content };
};

let TabEditor = (props, ref) => {
    const { addTab, setActive, setState, state } = props;
    const refs = useRefs();

    const Portal = useHookComponent('Portal');
    const RichTextEditor = useHookComponent('RichTextEditor');
    const { Button, Dialog, Icon } = useHookComponent('ReactiumUI');

    const isContainer = useIsContainer();

    const [value, updateValue] = useState();

    const [titleEdit, setTitleEdit] = useState(false);

    const [visible, updateVisible] = useState(false);

    const setVisible = val => {
        op.set(handle, 'visible', val);
        setHandle(handle);
        updateVisible(val);
    };

    const cx = Reactium.Utils.cxFactory('rte-tabs');

    const dismiss = () => setVisible(false);

    const header = () => {
        const title = state.tabs[state.active];
        const icon = titleEdit === true ? 'Feather.Check' : 'Feather.Edit2';

        return {
            elements: [
                <input
                    type='text'
                    key='title-input'
                    className='title'
                    defaultValue={title}
                    readOnly={!titleEdit}
                    onKeyDown={e => {
                        if (e.keyCode === 13) {
                            e.preventDefault();
                            setTitleEdit(false);
                        }
                    }}
                    ref={elm => refs.set('tabs.editor.title', elm)}
                />,
                <HeaderButton
                    icon={icon}
                    key='edit-btn'
                    onClick={toggleTitle}
                    className={titleEdit === true ? 'active' : null}
                    ref={elm => refs.set('tabs.editor.btn.edit', elm)}
                />,
                <HeaderButton
                    icon='Feather.Plus'
                    key='add-btn'
                    ref={elm => refs.set('tabs.editor.btn.add', elm)}
                    onClick={() => addTab({ index: state.active + 1 })}
                />,
                <HeaderButton
                    key='close-btn'
                    icon='Feather.X'
                    onClick={dismiss}
                />,
            ],
        };
    };

    const toggleTitle = () => {
        if (titleEdit === false) {
            const input = refs.get('tabs.editor.title');
            if (input) input.select();
        }

        setTitleEdit(!titleEdit);
    };

    const _onSubmit = (close = false) => {
        const contentInput = refs.get('tabs.editor.rte');
        const cont = contentInput.value;
        const content = Array.from(state.content);
        content.splice(state.active, 1, cont);

        const tabInput = refs.get('tabs.editor.title');
        const tab = tabInput.value;
        const tabs = Array.from(state.tabs);
        tabs.splice(state.active, 1, tab);

        if (close === true) setVisible(false);
        setState({ content, tabs, updated: Date.now() });
        return new Promise(resolve => _.defer(resolve));
    };

    const _onTitleBlur = e => {
        const btn = refs.get('tabs.editor.btn.edit');
        const tabInput = refs.get('tabs.editor.title');

        if (!btn || !tabInput) return;

        if (isContainer(e.target, btn) || isContainer(e.target, tabInput)) {
            return;
        }

        const value = tabInput.value;
        if (String(value).length < 1) {
            e.target.value = state.tabs[state.active];
        }

        setTitleEdit(false);
    };

    const excludes = {
        blocks: ['tabs'],
        buttons: ['tabs'],
    };

    const next = () => {
        let n = state.active + 1;
        n = n >= state.tabs.length ? 0 : n;
        navTo(n);
    };

    const prev = () => {
        let n = state.active - 1;
        n = n < 0 ? state.tabs.length - 1 : n;
        navTo(n);
    };

    const navTo = n => _onSubmit().then(() => setActive(n));

    const _handle = () => ({
        hide: () => setVisible(false),
        show: () => setVisible(true),
        navTo,
        next,
        prev,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    useEffect(() => {
        const container = refs.get('tabs.editor.container');
        if (typeof window === 'undefined' || !container) return;

        container.addEventListener('mousedown', _onTitleBlur);
        return () => {
            container.removeEventListener('mousedown', _onTitleBlur);
        };
    }, [refs.get('tabs.editor.container')]);

    useEffect(() => {
        const content = defaultValue(state.content[state.active]);
        const tab = state.tabs[state.active];

        updateValue(content);
        const rte = refs.get('tabs.editor.rte');
        if (rte) rte.setValue(content);

        const title = refs.get('tabs.editor.title');
        if (title) title.value = tab;
    }, [state.active, state.updated]);

    return visible === true && value ? (
        <Portal>
            <div
                className={cx('content-editor')}
                ref={elm => refs.set('tabs.editor.container', elm)}>
                <Dialog collapsible={false} header={header()}>
                    <div className={cx('content-editor-container')}>
                        <RichTextEditor
                            exclude={excludes}
                            value={value}
                            placeholder={__('Tab Content')}
                            ref={elm => refs.set('tabs.editor.rte', elm)}
                        />
                        <Button
                            size='md'
                            type='button'
                            appearance='pill'
                            onClick={() => _onSubmit(true)}
                            className={cx('content-editor-submit')}>
                            {__('Save and Exit')}
                        </Button>
                        {state.tabs.length > 1 && (
                            <>
                                <div className='nav left'>
                                    <Button onClick={prev} appearance='circle'>
                                        <Icon name='Feather.ChevronLeft' />
                                    </Button>
                                </div>
                                <div className='nav right'>
                                    <Button onClick={next} appearance='circle'>
                                        <Icon name='Feather.ChevronRight' />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </Dialog>
            </div>
        </Portal>
    ) : null;
};

TabEditor = forwardRef(TabEditor);

export default TabEditor;
