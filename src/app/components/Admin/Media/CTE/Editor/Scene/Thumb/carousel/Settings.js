import React, { forwardRef, useEffect } from 'react';
import Reactium, {
    __,
    useHookComponent,
    useIsContainer,
    useRefs,
} from 'reactium-core/sdk';

let Settings = (props, ref) => {
    const { handle } = props;
    const { config, fieldName } = handle;

    const refs = useRefs();

    const Portal = useHookComponent('Portal');
    const { Dialog, EventForm, Toggle } = useHookComponent('ReactiumUI');

    const isContainer = useIsContainer();

    const cx = Reactium.Utils.cxFactory('field-media-slide');

    const header = () => ({
        title: `${fieldName} ${__('Config')}`,
    });

    const dismiss = e => {
        let container = refs.get('container');
        if (!container) return;
        const elm = container.container.current.container;
        if (elm && isContainer(e.target, elm)) return;
        container.hide();
    };

    useEffect(() => {
        const form = refs.get('form');
        if (!form) return;
        if (!config) return;
        form.setValue(config);
    }, [config]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.addEventListener('mousedown', dismiss);
        window.addEventListener('touchstart', dismiss);

        return () => {
            window.removeEventListener('mousedown', dismiss);
            window.removeEventListener('touchstart', dismiss);
        };
    }, []);

    return (
        <Portal>
            <Dialog
                header={header()}
                collapsible={false}
                className={cx('config')}
                dismissable
                ref={elm => {
                    refs.set('container', elm);
                    ref(elm);
                }}
                visible={props.visible}>
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
                            <input type='number' name='duration' min={0} />
                        </label>
                    </div>
                    <div className='form-group'>
                        <label>
                            {__('Animation Speed:')}
                            <input
                                min={0}
                                name='animationSpeed'
                                placeholder={__('0.5')}
                                step={0.25}
                                type='number'
                            />
                        </label>
                    </div>
                    <div className='form-group'>
                        <label>
                            {__('ID:')}
                            <input type='text' name='id' />
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
