import React from 'react';
import uuid from 'uuid/v4';
import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../enums';
import Reactium, {
    __,
    useHookComponent,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

const { STATUS } = ENUMS;

const ToastMessage = ({ icon = 'Feather.DownloadCloud', children }) => {
    const { Icon } = useHookComponent('ReactiumUI');
    return (
        <div className='flex'>
            <span className='blue mr-xs-4 mt-xs-2'>
                <Icon name={icon} size={22} />
            </span>
            {children}
        </div>
    );
};

export default ({ picker }) => {
    const refs = useRefs();
    const [, setStatus, isStatus] = useStatus(STATUS.READY);
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const { cx, data, select, setData, setState, state } = picker;
    let { uploads = {} } = state;

    const _onEnter = e => {
        if (e.keyCode !== 13) return;
        e.preventDefault();
        _onSubmit();
    };

    const _onSubmit = async () => {
        if (isStatus(STATUS.IMPORTING)) return;

        setStatus(STATUS.IMPORTING, true);

        const input = refs.get('url');
        if (!input) return;

        const url = String(input.value);
        if (url.length < 1) return;
        input.value = '';

        const filename = String(url)
            .split('/')
            .pop();

        const { Toast } = Reactium.Handle.get('AdminTools').current;

        // 1.0 - Create the toast notification of the async action
        const toastId = uuid();
        Toast.info(
            <ToastMessage>
                <div>
                    {__('Importing')}...
                    <div className='small'>{filename}</div>
                </div>
            </ToastMessage>,
            {
                toastId,
                autoClose: false,
                closeButton: false,
                closeOnClick: false,
                position: 'bottom-right',
            },
        );

        // 2.0 - Create a placeholder item in the data
        op.set(uploads, toastId, { url, type: 'IMPORT', uuid: toastId });
        setState({ uploads });

        // 3.0 - Import the file using Reactium.Media.createFromURL()
        const { result: obj } = await Reactium.Media.createFromURL({ url });

        // 3.1 - Handle error
        if (op.get(obj, 'error')) {
            // 3.1.1 - Update the status
            setStatus(STATUS.ERROR, true);

            // 3.1.2 - Update the toast
            Toast.update(toastId, {
                autoClose: 3000,
                type: Toast.TYPE.SUCCESS,
                render: () => (
                    <ToastMessage icon='Feather.AlertOctagon'>
                        <div>
                            {__('Error: unable to import')}
                            <div className='small'>{filename}</div>
                        </div>
                    </ToastMessage>
                ),
            });

            // 3.1.3 - Exit the import routine
            return;
        }

        // 3.2 - Update UI
        // 3.2.1 - Update the toast
        Toast.update(toastId, {
            autoClose: 3000,
            type: Toast.TYPE.SUCCESS,
            render: () => (
                <ToastMessage icon='Feather.CheckCircle'>
                    <div>
                        {__('Imported')}
                        <div className='small'>{filename}</div>
                    </div>
                </ToastMessage>
            ),
        });

        // 3.2.2 - Update the status
        setStatus(STATUS.READY);

        // 4.0 - Remove the placeholder item
        op.del(uploads, toastId);
        setState({ uploads }, true);

        // 5.0 - Insert the new obj
        const { objectId } = obj;
        let newData = JSON.parse(JSON.stringify(data));
        op.set(newData, ['data', objectId], obj);
        setData(newData, true);

        // 6.0 - Set the selection
        select(objectId);
    };

    return (
        <div className={cx('import-input')}>
            <input
                type='input'
                onKeyDown={_onEnter}
                placeholder={__('From URL')}
                ref={elm => refs.set('url', elm)}
                disabled={isStatus(STATUS.IMPORTING)}
            />
            <span className='sib'>
                <Icon name='Feather.DownloadCloud' className='ico' />
                <Button
                    className='submit'
                    onMouseDown={_onSubmit}
                    appearance={Button.ENUMS.APPEARANCE.CIRCLE}>
                    <Icon name='Feather.Check' />
                </Button>
            </span>
        </div>
    );
};
