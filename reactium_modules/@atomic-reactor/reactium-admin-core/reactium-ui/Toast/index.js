import { ToastContainer, toast } from 'react-toastify';
import Button from 'reactium-ui/Button';
import Icon from 'reactium-ui/Icon';
import ReactDOM from 'react-dom';
import op from 'object-path';

import React, {
    forwardRef,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
} from 'react';

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const CloseButton = () => (
    <Button
        className='Toastify__close-button'
        color={Button.ENUMS.COLOR.CLEAR}
        size={Button.ENUMS.SIZE.XS}>
        <Icon name='Feather.X' className='close' size={18} />
    </Button>
);

let Toast = (props, ref) => {
    if (typeof window === 'undefined') return null;

    const doc = op.get(props, 'iDocument', document) || document;
    return doc
        ? ReactDOM.createPortal(
              <div>
                  <ToastContainer
                      ref={ref}
                      {...props}
                      closeButton={<CloseButton />}
                  />
              </div>,
              doc.body,
          )
        : null;
};

Toast = forwardRef(Toast);

Toast[toast.TYPE.DEFAULT] = toast;

Toast.show = ({
    icon,
    message = null,
    position = Toast.POSITION.TOP_RIGHT,
    type = Toast.TYPE.DEFAULT,
    ...props
}) => {
    if (!message) {
        return;
    }

    icon =
        typeof icon === 'string' ? (
            <Icon name={icon} style={{ marginRight: 8 }} />
        ) : (
            icon
        );

    const Ico = icon ? () => icon : () => <span style={{ marginLeft: 4 }} />;

    message = (
        <>
            {Ico && <Ico />}
            {message}
        </>
    );

    type = Object.values(Toast.TYPE).includes(type) ? type : Toast.TYPE.DEFAULT;

    const config = { ...props, position };

    return Toast[type](message, config);
};

Object.keys(toast).forEach(key => (Toast[key] = toast[key]));

export { Toast, Toast as default };
