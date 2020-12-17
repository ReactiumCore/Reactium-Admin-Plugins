import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Editor, Transforms } from 'slate';
import { ReactEditor, useEditor } from 'slate-react';
import { Scrollbars } from 'react-custom-scrollbars';
import React, { useEffect } from 'react';

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

const Panel = ({
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

    const getValue = (key, def = '') => op.get(value, key, def);

    const setValue = (key, newValue = null) => {
        if (unMounted()) return;

        if (!_.isString(key)) {
            updateValue(cloneObj(key));
        } else {
            if (_.isNumber(newValue)) {
                newValue = Number(newValue);
            }

            updateValue({ [key]: newValue });
        }
    };

    // className prefixer
    const cx = Reactium.Utils.cxFactory(namespace);

    const hide = () => {
        editor.panel.hide(false, true).setID('rte-panel');
        Transforms.collapse(editor, { edge: 'end' });
        ReactEditor.focus(editor);
    };

    const showPicker = () => {
        setVisible(false, true);
        const { Modal } = Reactium.Handle.get('AdminTools').current;
        Modal.show(
            <MediaPicker
                dismissable
                filters='VIDEO'
                confirm={false}
                title={__('Select Video')}
                onSubmit={_onMediaSelect}
                onDismiss={() => Modal.hide()}
            />,
        );
    };

    const submit = () => Transforms.setNodes(editor, value, { at: path });

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

    const _onInput = key => e => setValue(key, e.target.value);

    const _onMediaSelect = e => {
        if (!Array.isArray(e.selection) || e.selection.length < 1) return;
        const item = e.selection.pop();

        const { Modal } = Reactium.Handle.get('AdminTools').current;
        const { objectId, url: src, ext } = item;
        setValue({ objectId, src, ext });
        submit();
        Modal.hide();
    };

    const _onSubmit = e => {
        if (e) e.preventDefault();
        submit();
    };

    const _onToggle = key => e => setValue(key, e.target.checked);

    useEffect(() => {
        console.log(value);
    }, [Object.values(value)]);

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
                                        value={getValue('src')}
                                        onChange={_onInput('src')}
                                        ref={elm => refs.set('src', elm)}
                                    />
                                    <Button
                                        onClick={showPicker}
                                        title={__('Select Video')}
                                        className={cx('btn-inline')}
                                        color={Button.ENUMS.COLOR.TERTIARY}>
                                        <Icon name='Feather.Film' />
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

Panel.propTypes = {
    namespace: PropTypes.string,
    updateButtonLabel: PropTypes.node,
    title: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'rte-video-settings',
    updateButtonLabel: __('Apply Settings'),
    title: __('Video Inspector'),
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

const Settings = props => {
    const { id } = props;
    const editor = useEditor();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const getNode = () => {
        const nodes = Array.from(Editor.nodes(editor, { at: [] }));
        if (nodes.length < 1) return;

        const result = nodes.reduce((output, [node, selection]) => {
            if (!op.get(node, 'id')) return output;
            if (op.get(node, 'id') === id && !output) {
                output = { node, selection };
            }

            return output;
        }, null);

        return result ? result : { node: null, selection: [] };
    };

    const showPanel = () => {
        const { node, selection: path } = getNode();
        const x = window.innerWidth / 2 - 150;
        const y = 50;

        editor.panel
            .setID('grid')
            .setContent(
                <Panel
                    selection={editor.selection}
                    node={node}
                    path={path}
                    id={id}
                />,
            )
            .moveTo(x, y)
            .show();
    };

    return (
        <Button color={Button.ENUMS.COLOR.SECONDARY} onClick={showPanel}>
            <Icon name='Feather.Film' size={16} />
        </Button>
    );
};

export { Settings as default, Panel };
