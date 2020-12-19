import op from 'object-path';
import ToastMessage from './ToastMessage';
import React, { forwardRef, useEffect } from 'react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

let Uploader = ({ picker, ...props }, ref) => {
    const { select, setData, setState, state } = picker;

    const { Dropzone } = useHookComponent('ReactiumUI');

    const _onComplete = async e => {
        const { ID, status, objectId, result } = e.params;
        if (status !== 'complete') return;

        let { uploads = {} } = state;

        // 1.0 - Remove the placeholder item
        op.del(uploads, ID);
        setState({ uploads }, true);

        // 2.0 - Insert the new obj
        let newData = JSON.parse(JSON.stringify(picker.data));
        op.set(newData, ['data', objectId], result);
        setData(newData, true);

        // 3.0 - Set the selection
        select(objectId);
    };

    const _onFileAdded = e => {
        const { added, type: action } = e;

        if (action !== 'add') return;

        const { Toast } = Reactium.Handle.get('AdminTools').current;

        let { directory = 'uploads', uploads = {} } = state;
        directory = directory === 'all' ? 'uploads' : directory;

        // 1.0 - Add to uploads
        Object.values(added).forEach(file => {
            const { ID, dataURL, name } = file;

            const fileType = Reactium.Media.fileType(name);

            const uploadObj = { url: name, type: 'UPLOAD', uuid: ID };

            if (fileType === 'IMAGE') op.set(uploadObj, 'image', dataURL);

            // 1.1 - Add to the uploads object
            op.set(uploads, ID, uploadObj);

            // 1.2 - Create the Toast notification
            Toast.info(
                <ToastMessage icon='Feather.UploadCloud'>
                    {__('Uploading')}
                    <div className='small'>
                        {directory}/{name}
                    </div>
                </ToastMessage>,
                {
                    toastId: ID,
                    progress: 0,
                    autoClose: false,
                    closeButton: false,
                    closeOnClick: false,
                    hideProgressBar: false,
                    position: 'bottom-right',
                },
            );
        });

        // 2.0 - Queue the uploads
        Reactium.Media.upload(added, directory, { UPLOADER: picker.ID });

        // 3.0 - Update the picker state
        setState({ uploads });
    };

    useEffect(() => {
        const hooks = [
            Reactium.Hook.registerSync('media-complete', _onComplete),
        ];
        return () => {
            hooks.forEach(hook => Reactium.Hook.unregister(hook));
        };
    }, []);

    return (
        <Dropzone {...props} onFileAdded={_onFileAdded} ref={ref} files={{}} />
    );
};

Uploader = forwardRef(Uploader);

// Remove the toast items if we close the uploader when the files finish uploading
Uploader.watch = e => {
    const { params = {}, type } = e;
    if (type !== 'status') return;

    const Toast = op.get(Reactium.Handle.get('AdminTools'), 'current.Toast');
    if (!Toast) return;

    const { ID, progress, status } = params;
    if (!Toast.isActive(ID)) return;

    if (status === 'complete') {
        Toast.update(ID, {
            progress,
            autoClose: 3000,
            type: Toast.TYPE.SUCCESS,
            render: () => (
                <ToastMessage icon='Feather.CheckCircle' color='green'>
                    <div>{__('Uploaded')}</div>
                    <a className='small' href={params.url} target='_blank'>
                        {params.url}
                    </a>
                </ToastMessage>
            ),
        });
    } else if (status === 'uploading') {
        Toast.update(ID, { progress });
    }
};

export { Uploader, Uploader as default };
