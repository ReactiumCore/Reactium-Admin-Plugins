import _ from 'underscore';
import uuid from 'uuid/v4';

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
    useRefs,
} from 'reactium-core/sdk';

const noop = () => {};

const defaultValue = {
    type: 'div',
    children: [{ type: 'p', children: [{ text: '' }] }],
};

export default forwardRef(
    ({ onSubmit = noop, title = __('Component Content'), ...props }, ref) => {
        const refs = useRefs();
        const idx = uuid();

        const [value, update] = useState(props.value || defaultValue);
        const setValue = newValue => {
            if (unMounted()) return;

            const rte = refs.get('rte');
            if (rte) rte.setValue(newValue);
            update(newValue);
        };

        const header = { title };

        const excludes = {
            blocks: ['tabs'],
            buttons: ['tabs'],
        };

        const RichTextEditor = useHookComponent('RichTextEditor');
        const { Button, Dialog, Modal } = useHookComponent('ReactiumUI');

        const cx = Reactium.Utils.cxFactory('rte-jsx-component');

        const unMounted = () => !refs.get('modal');

        const hasClass = (target, className) =>
            new RegExp('(\\s|^)' + className + '(\\s|$)').test(
                target.className,
            );

        const _dismiss = () =>
            new Promise(resolve => {
                const modal = refs.get('modal');
                modal.hide();

                const ival = setInterval(() => {
                    if (!hasClass(modal.container, 'visible')) {
                        clearInterval(ival);
                        resolve();
                    }
                }, 1);
            });

        const _onSubmit = () => {
            const rte = refs.get('rte');
            const value = rte.value.children;
            _dismiss().then(() => onSubmit(value));
        };

        const _show = () => {
            const modal = refs.get('modal');
            modal.show();
        };

        const _handle = () => ({
            dismiss: _dismiss,
            hide: _dismiss,
            show: _show,
            setValue,
            value,
            refs,
        });

        const [handle, updateHandle] = useEventHandle(_handle());
        const setHandle = newHandle => {
            if (!unMounted()) return;
            updateHandle(newHandle);
        };

        useImperativeHandle(ref, () => handle);

        useEffect(() => {
            if (_.isEqual(handle.value, value)) return;
            handle.value = value;
            setHandle(handle);
        }, [value]);

        return (
            <Modal className={cx('modal')} ref={elm => refs.set('modal', elm)}>
                <Dialog
                    dismissable
                    header={header}
                    collapsible={false}
                    onDismiss={_dismiss}>
                    <div className={cx('content-editor')}>
                        <div className={cx('content-editor-container')}>
                            <RichTextEditor
                                id={idx}
                                value={value}
                                exclude={excludes}
                                placeholder={__('Content')}
                                ref={elm => refs.set('rte', elm)}
                                onChange={e => setValue(e.target.value)}
                            />
                            <Button
                                size='md'
                                type='button'
                                appearance='pill'
                                onClick={() => _onSubmit()}
                                className={cx('content-editor-submit')}>
                                {__('Update')}
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </Modal>
        );
    },
);
