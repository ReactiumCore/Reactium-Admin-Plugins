import { useHandle } from 'reactium-core/sdk';
import ENUMS from 'components/Admin/Media/enums';
import { Button } from '@atomic-reactor/reactium-ui';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useRef,
    useState,
} from 'react';

const DeletePanel = forwardRef((props, ref) => {
    const List = useHandle('MediaDirectories');

    const stateRef = useRef({
        deleteFiles: false,
        status: ENUMS.STATUS.READY,
        ...props,
    });

    const [, forceRender] = useState({ updated: Date.now(), keys: [] });

    const setState = newState => {
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        forceRender({ updated: Date.now(), keys: Object.keys(newState) });
    };

    const cancel = () => List.navTo('list', null, 'right');

    const submit = () => {
        const { deleteFiles: content, directory, status } = stateRef.current;

        if (status === ENUMS.STATUS.PROCESSING) return;

        setState({ status: ENUMS.STATUS.PROCESSING });

        List.deleteDirectory({ directory, content });

        setTimeout(() => List.navTo('list', null, 'right'), 1);
    };

    const render = () => {
        const { directory } = stateRef.current;
        const buttonProps = {
            size: 'sm',
            style: { margin: '0 8px' },
        };

        return (
            <div
                className='text-center flex center middle'
                style={{ height: '100%' }}>
                <div className='mt-xs--16 px-xs-24'>
                    {ENUMS.TEXT.FOLDER_EDITOR.DELETE_ASK[0]}{' '}
                    <kbd>{directory}</kbd>{' '}
                    {ENUMS.TEXT.FOLDER_EDITOR.DELETE_ASK[1]}
                    <div className='my-xs-32' />
                    <span>
                        <Button
                            {...buttonProps}
                            color='danger'
                            onClick={() => cancel()}>
                            {ENUMS.TEXT.FOLDER_EDITOR.CANCEL}
                        </Button>
                        <Button
                            {...buttonProps}
                            color='primary'
                            onClick={() => submit()}>
                            {ENUMS.TEXT.FOLDER_EDITOR.DELETE}
                        </Button>
                    </span>
                </div>
            </div>
        );
    };

    useImperativeHandle(ref, () => ({
        state: stateRef.current,
        setState,
    }));

    return render();
});

export default DeletePanel;
