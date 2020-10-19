import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import Reactium, {
    __,
    useDerivedState,
    useEventHandle,
    useHookComponent,
    useRefs,
} from 'reactium-core/sdk';

let Settings = (props, ref) => {
    const { handle } = props;
    const { config, fieldName } = handle;

    const refs = useRefs();

    const Portal = useHookComponent('Portal');
    const { Button, Dialog, EventForm, Icon, Toggle } = useHookComponent(
        'ReactiumUI',
    );

    const [state, setState] = useDerivedState({
        visible: props.visible,
    });

    const cx = Reactium.Utils.cxFactory('field-media-slide');

    const header = () => ({
        title: `${fieldName} ${__('Config')}`,
    });

    const _createHandle = () => ({
        panel: refs.get('panel'),
    });

    const [_handle, setHandle] = useEventHandle(() => _createHandle());

    useEffect(() => {
        _handle.panel = refs.get('panel');
        setHandle(_handle);
    }, [refs.get('panel')]);

    useEffect(() => {
        const form = refs.get('form');
        if (!form) return;
        if (!config) return;
        form.setValue(config);
    }, [config]);

    useImperativeHandle(ref, () => _handle);

    return (
        <Portal>
            <Dialog
                header={header()}
                collapsible={false}
                className={cx('config')}
                dismissable
                ref={elm => refs.set('panel', elm)}
                visible={state.visible}>
                <EventForm
                    className='form'
                    value={config}
                    ref={elm => refs.set('form', elm)}>
                    <div className='form-group'>
                        <Toggle
                            name='autoplay'
                            label={__('Autoplay:')}
                            value={true}
                        />
                    </div>
                    <div className='form-group'>
                        <Toggle name='loop' label={__('Loop:')} value={true} />
                    </div>
                    <div className='form-group'>
                        <label>
                            {__('Duration:')}
                            <input type='number' name='duration' />
                        </label>
                    </div>
                    <div className='form-group'>
                        <label>
                            {__('Animation Speed:')}
                            <input
                                type='number'
                                name='animationSpeed'
                                placeholder={__('0.5')}
                            />
                        </label>
                    </div>
                    <div className='form-group'>
                        <label>
                            {__('Class:')}
                            <input type='text' name='className' />
                        </label>
                    </div>
                </EventForm>
            </Dialog>
        </Portal>
    );
};

Settings = forwardRef(Settings);

Settings.defaultProps = {
    autohide: false,
    draggable: true,
    visible: false,
};

export { Settings, Settings as default };
