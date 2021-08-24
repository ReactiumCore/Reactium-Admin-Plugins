import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import React, { useRef } from 'react';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';

const defaultValue = {
    type: 'div',
    children: [
        {
            type: 'block',
            id: uuid(),
            blocked: true,
            children: [
                {
                    type: 'h1',
                    style: {
                        textAlign: 'center',
                        color: '#FFFFFF',
                    },
                    children: [{ text: 'Slide Content' }],
                },
            ],
        },
    ],
};

const SlideContent = ({ handle, file }) => {
    const { setSlides, slides = [] } = handle;

    const tools = useHandle('AdminTools');
    const RichTextEditor = useHookComponent('RichTextEditor');
    const { Button, Dialog, Icon } = useHookComponent('ReactiumUI');

    const idx = _.findIndex(handle.value, { objectId: file.objectId });

    const value = op.get(slides, idx, defaultValue);

    const editorRef = useRef();

    const cx = Reactium.Utils.cxFactory('field-media-slide');

    const dismiss = () => {
        const Modal = op.get(tools, 'Modal');
        Modal.hide();
    };

    const save = () => {
        op.set(slides, idx, editorRef.current.value);
        setSlides(slides);
        dismiss();
        _.defer(() => handle.editor.save());
    };

    const excludes = () => {
        const exc = {
            blocks: ['tabs'],
            buttons: ['tabs'],
        };

        Reactium.Hook.runSync('field-media-slide-rte-excludes', exc);

        return exc;
    };

    const header = () => ({
        title: __('Slide Content'),
        elements: [
            <Button
                className='ar-dialog-header-btn'
                color={Button.ENUMS.COLOR.CLEAR}
                onClick={dismiss}
                key='delete-btn'>
                <Icon name='Feather.X' />
            </Button>,
        ],
    });

    const footer = () => ({
        align: 'center',
        elements: [
            <Button
                appearance={Button.ENUMS.APPEARANCE.PILL}
                key='save-btn'
                onClick={save}>
                {__('Update Slide')}
            </Button>,
        ],
    });

    return (
        <Dialog collapsible={false} footer={footer()} header={header()}>
            <div className={cx()}>
                {file.type === 'IMAGE' && (
                    <img src={file.url} className={cx('image')} />
                )}
                {file.type === 'VIDEO' && (
                    <video
                        width='100%'
                        height='auto'
                        className={cx('video')}
                        controls
                        loop>
                        <source src={file.url} type={`video/${file.ext}`} />
                    </video>
                )}
                <div className={cx('rte')}>
                    <RichTextEditor
                        value={value}
                        ref={editorRef}
                        excludes={excludes()}
                        placeholder={__('Slide Content')}
                    />
                </div>
            </div>
        </Dialog>
    );
};

export { SlideContent, SlideContent as default };
