import _ from 'underscore';
import { Icon } from 'reactium-ui';
import React, { forwardRef } from 'react';
import Reactium, {
    __,
    useDispatcher,
    useEventEffect,
    useHookComponent,
    useRefs,
} from '@atomic-reactor/reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: TypeDelete
 * -----------------------------------------------------------------------------
 */
const DEBUG = true;

const Message = forwardRef(({ details, ...props }, ref) => (
    <div className='form-group'>
        <div>{__('enter content type')}</div>
        <input
            ref={ref}
            type='text'
            className='text-center'
            placeholder={details.machineName}
            {...props}
        />
        <small>{__('Deleting a content type cannot be undone')}</small>
    </div>
));

let TypeDelete = () => {
    const refs = useRefs();

    const dispatch = useDispatcher({ props: {} });

    const [types] = useHookComponent('useContentTypes')();

    const ConfirmBox = useHookComponent('ConfirmBox');

    const cancel = () => Reactium.State.Tools.Modal.hide();

    const confirm = async (item) => {
        const confirmed = refs.get('confirmed');
        if (confirmed.value !== item.machineName) {
            confirmed.focus();
            return;
        }

        const i = _.findIndex(types, { uuid: item.uuid });

        const newTypes = Array.from(types);
        newTypes.splice(i, 1);

        Reactium.Cache.set('content-types', newTypes);

        Reactium.State.Tools.Modal.dismiss();

        if (DEBUG !== true) await Reactium.ContentType.delete(item.uuid);

        dispatch('content-type-deleted', { details: item });
    };

    const onDelete = (e) => {
        const { Toast } = Reactium.State.Tools;

        const message = __('%name content type deleted').replace(
            /%name/gi,
            e.details.meta.label,
        );

        Toast.show({
            message,
            autoClose: 2500,
            type: Toast.TYPE.SUCCESS,
            icon: <Icon name='Feather.Check' />,
        });
    };

    const showModal = (e) =>
        Reactium.State.Tools.Modal.show(
            <ConfirmBox
                onCancel={cancel}
                onConfirm={() => confirm(e.details)}
                title={__('Delete Content Type')}
                message={
                    <Message
                        details={e.details}
                        ref={(elm) => refs.set('confirmed', elm)}
                    />
                }
            />,
        ).then(() => {
            const input = refs.get('confirmed');
            if (input) input.focus();
        });

    useEventEffect(Reactium.State, {
        'content-type-delete': showModal,
        'content-type-deleted': onDelete,
    });

    return null;
};

export default TypeDelete;
