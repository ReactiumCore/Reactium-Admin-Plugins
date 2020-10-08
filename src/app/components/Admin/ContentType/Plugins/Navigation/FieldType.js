import React from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

const Help = () => {
    const { Alert, Icon } = useHookComponent('ReactiumUI');

    return (
        <div className='help'>
            <Alert
                className='mb-xs-20'
                color={Alert.ENUMS.COLOR.INFO}
                dismissable={false}
                icon={<Icon name='Feather.Info' />}>
                {__(
                    'This field type adds a navigation selector to your content.',
                )}
            </Alert>
        </div>
    );
};

// -----------------------------------------------------------------------------
// <FieldType />
// -----------------------------------------------------------------------------
export const FieldType = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    const render = () => {
        return (
            <FieldTypeDialog {...props} showHelpText={false}>
                <input type='hidden' name='query' />
                <input type='hidden' name='collection' />
                <input type='hidden' name='targetClass' />
                <div className='field-type-collection'>
                    <Help />
                </div>
            </FieldTypeDialog>
        );
    };

    return render();
};
