import React from 'react';
import uuid from 'uuid/v4';
import { Transforms } from 'slate';
import { ReactEditor, useEditor } from 'slate-react';

import Reactium, {
    __,
    useDerivedState,
    useFocusEffect,
    useHookComponent,
    useRefs,
} from 'reactium-core/sdk';

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

const Panel = ({ selection, title = __('Tabs') }) => {
    const refs = useRefs();
    const editor = useEditor();

    const [state, update] = useDerivedState({
        vertical: false,
    });

    const setState = newState => {
        if (unMounted()) return;

        update(newState);
    };

    const { Button, Dialog, Toggle } = useHookComponent('ReactiumUI');

    const cx = Reactium.Utils.cxFactory('rte-tabs-editor');

    const label = () => {
        const dir = state.vertical === true ? __('vertical') : __('horizontal');
        return String(__('Direction: %dir')).replace(/\%dir/gi, dir);
    };

    const hide = (noFocus = false) => {
        editor.panel.hide(false, true).setID('rte-panel');
        if (noFocus !== true) ReactEditor.focus(editor);
    };

    const header = () => ({
        elements: [<CloseButton onClick={hide} key='close-btn' />],
        title,
    });

    const insertNode = () => {
        const { vertical } = state;
        const nodes = [
            {
                id: uuid(),
                children: [{ text: '' }],
                content: [{ children: [{ text: '' }], type: 'empty' }],
                tabs: ['Tab Title'],
                type: 'tabs',
                vertical,
            },
            {
                children: [{ text: '' }],
                type: 'p',
            },
        ];

        Transforms.insertNodes(editor, nodes, { at: selection });
    };

    const unMounted = () => !refs.get('dialog');

    const _onChangeType = e => setState({ vertical: e.target.checked });

    const _onSubmit = () => {
        insertNode();
        hide(true);
    };

    useFocusEffect(editor.panel.container);

    return (
        <Dialog
            collapsible={false}
            dismissable={false}
            header={header()}
            ref={elm => refs.set('dialog', elm)}>
            <div className={cx()}>
                <div className={cx('direction')}>
                    <Toggle label={label()} onChange={_onChangeType} />
                </div>
                <div className={cx('footer')}>
                    <Button
                        block
                        type='button'
                        size={Button.ENUMS.SIZE.MD}
                        onClick={_onSubmit}>
                        {__('Insert Tabs')}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default Panel;
