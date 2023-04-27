import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Transforms } from 'slate';
import { ReactEditor, useEditor } from 'slate-react';
import { Scrollbars } from '@atomic-reactor/react-custom-scrollbars';

import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Settings
 * -----------------------------------------------------------------------------
 */

const cloneObj = obj => JSON.parse(JSON.stringify(obj));

const Settings = ({
    namespace,
    node = {},
    path = [],
    title,
    updateButtonLabel,
}) => {
    const refs = useRefs();

    const editor = useEditor();

    const [, setVisible, isVisible] = useStatus(true);

    const MediaPicker = useHookComponent('MediaPicker');

    const { Button, Dialog, Icon, Slider, Toggle } = useHookComponent(
        'ReactiumUI',
    );

    const [value, updateValue] = useDerivedState(cloneObj(node));

    const getValue = (key, def = '') => op.get(value, key, def) || def;

    const setValue = (key, newValue, silent) => {
        if (unMounted()) return;

        if (!_.isString(key)) {
            updateValue(cloneObj(key), newValue);
        } else {
            if (_.isNumber(newValue)) {
                newValue = Number(newValue);
            }

            if (_.isString(newValue) && String(newValue).length < 1) {
                newValue = null;
            }

            updateValue({ [key]: newValue }, silent);
        }
    };

    // className prefixer
    const cx = Reactium.Utils.cxFactory(namespace);

    const hide = () => {
        editor.panel.hide(false, true).setID('rte-panel');
        Transforms.collapse(editor, { edge: 'end' });
        ReactEditor.focus(editor);
    };

    const showPicker = (TYPE, TITLE) => () => {
        setVisible(false, true);
        const { Modal } = Reactium.Handle.get('AdminTools').current;
        Modal.show(
            <MediaPicker
                dismissable
                title={TITLE}
                filters={TYPE}
                confirm={false}
                onDismiss={() => Modal.hide()}
                onSubmit={_onMediaSelect(TYPE)}
            />,
        );
    };

    const submit = (newValue = {}) =>
        Transforms.setNodes(editor, { ...value, ...newValue }, { at: path });

    const unMounted = () => !refs.get('container');

    const _header = () => ({ title });

    const _footer = () => ({
        align: 'center',
        elements: [
            <Button
                block
                size='sm'
                type='button'
                color='primary'
                key='submit-btn'
                onClick={_onSubmit}
                children={updateButtonLabel}
            />,
        ],
    });

    const _onDismiss = () => hide();

    const _onInput = KEY => e => setValue(KEY, e.target.value);

    const _onMediaSelect = TYPE => e => {
        if (!Array.isArray(e.selection) || e.selection.length < 1) return;
        const item = e.selection.pop();

        const { Modal } = Reactium.Handle.get('AdminTools').current;

        let newValue;

        if (TYPE === 'VIDEO') {
            const { objectId, url: src, ext } = item;
            newValue = { objectId, src, ext };
        }

        if (TYPE === 'IMAGE') {
            const { url: thumbnail } = item;
            newValue = { thumbnail, autoplay: !!thumbnail };
        }
        submit(newValue);
        Modal.hide();
    };

    const _onSubmit = e => {
        if (e) e.preventDefault();
        submit();
        hide();
    };

    const _onToggle = KEY => e => setValue(KEY, e.target.checked);

    // Renderer
    return (
        <Dialog
            dismissable
            footer={_footer()}
            header={_header()}
            collapsible={false}
            onDismiss={_onDismiss}
            visible={isVisible(true)}
            className='ar-settings-dialog'
            ref={elm => refs.set('container', elm)}>
            <div className={cn('rte-settings', cx())}>
                <Scrollbars autoHeight autoHeightMin={286} autoHeightMax='80vh'>
                    <Container title={__('URL')} id='classname'>
                        <div className='p-xs-16'>
                            <div className='form-group'>
                                <div className='input-group-full'>
                                    <input
                                        type='text'
                                        onChange={_onInput('src')}
                                        value={getValue('src', '')}
                                        ref={elm => refs.set('src', elm)}
                                    />
                                    <Button
                                        title={__('Select Video')}
                                        className={cx('btn-inline')}
                                        color={Button.ENUMS.COLOR.TERTIARY}
                                        onClick={showPicker(
                                            'VIDEO',
                                            __('Select Video'),
                                        )}>
                                        <Icon name='Feather.Film' />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Container>
                    <Container title={__('Thumbnail')} id='classname'>
                        <div className='p-xs-16'>
                            <div className='form-group'>
                                <div className='input-group-full'>
                                    <input
                                        type='text'
                                        onChange={_onInput('thumbnail')}
                                        value={getValue('thumbnail', '')}
                                        ref={elm => refs.set('thumbnail', elm)}
                                    />
                                    <Button
                                        className={cx('btn-inline')}
                                        title={__('Select Thumbnail')}
                                        color={Button.ENUMS.COLOR.TERTIARY}
                                        onClick={showPicker(
                                            'IMAGE',
                                            __('Select Thumbnail'),
                                        )}>
                                        <Icon name='Feather.Camera' />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Container>
                    <Container title={__('Size')} id='size'>
                        <div className='flex flex-middle p-xs-16'>
                            <div className='col-xs-5'>
                                <div className='form-group'>
                                    <input
                                        type='text'
                                        title={__('width')}
                                        className='text-center'
                                        placeholder={__('width')}
                                        value={getValue('width')}
                                        onChange={_onInput('width')}
                                    />
                                </div>
                            </div>
                            <div className='col-xs-2 flex middle center gray'>
                                <Icon name='Feather.X' />
                            </div>
                            <div className='col-xs-5'>
                                <div className='form-group'>
                                    <input
                                        type='text'
                                        title={__('height')}
                                        className='text-center'
                                        placeholder={__('height')}
                                        value={getValue('height')}
                                        onChange={_onInput('height')}
                                    />
                                </div>
                            </div>
                        </div>
                    </Container>
                    <Container title={__('Settings')} id='player'>
                        <div className='p-xs-16'>
                            <div className='form-group'>
                                <Toggle
                                    label={__('Autoplay')}
                                    onChange={_onToggle('autoplay')}
                                    checked={getValue('autoplay', false)}
                                />
                            </div>
                            <div className='form-group'>
                                <Toggle
                                    label={__('Play Controls')}
                                    onChange={_onToggle('controls')}
                                    checked={getValue('controls', false)}
                                />
                            </div>
                            <div className='form-group'>
                                <Toggle
                                    label={__('Loop')}
                                    onChange={_onToggle('loop')}
                                    checked={getValue('loop', false)}
                                />
                            </div>
                            <div className='form-group'>
                                <Toggle
                                    label={__('Muted')}
                                    onChange={_onToggle('muted')}
                                    checked={getValue('muted', false)}
                                />
                            </div>
                        </div>
                    </Container>
                    <Container title={__('Volume')} id='volume'>
                        <div className='py-xs-16 px-xs-32'>
                            <Slider
                                value={getValue('volume', 0)}
                                onChange={({ value }) =>
                                    setValue('volume', value)
                                }
                            />
                        </div>
                    </Container>
                </Scrollbars>
            </div>
        </Dialog>
    );
};

Settings.propTypes = {
    title: PropTypes.string,
    namespace: PropTypes.string,
    updateButtonLabel: PropTypes.node,
};

Settings.defaultProps = {
    title: __('Video Properties'),
    namespace: 'rte-video-settings',
    updateButtonLabel: __('Apply Settings'),
};

const Container = ({ children, id, title }) => {
    const { Dialog } = useHookComponent('ReactiumUI');

    return (
        <Dialog
            collapsible
            className='sub'
            header={{ title }}
            pref={`admin.dialog.rteVideo.setting.${id}`}>
            {children}
        </Dialog>
    );
};

export default Settings;
