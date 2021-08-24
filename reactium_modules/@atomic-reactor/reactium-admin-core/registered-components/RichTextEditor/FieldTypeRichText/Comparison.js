import React, { useEffect, useRef } from 'react';
import op from 'object-path';
import { Dialog, Checkbox, Slider } from '@atomic-reactor/reactium-ui';
import Reactium, {
    __,
    useFulfilledObject,
    useHookComponent,
} from 'reactium-core/sdk';

const Comparison = props => {
    const field = op.get(props, 'field', {});
    const value = op.get(props, 'value');
    const { fieldName: title } = field;
    const RichTextEditor = useHookComponent('RichTextEditor');
    const editorRef = useRef();

    const displayValue = !value ? null : (
        <RichTextEditor
            value={value}
            readOnly={true}
            contentEditable={false}
            ref={editorRef}
        />
    );

    useEffect(() => {
        if (value && editorRef.current) {
            editorRef.current.setValue(value);
        }
    }, [value, editorRef.current]);

    return (
        <Dialog header={{ title }} collapsible={false}>
            <div className='p-xs-20' style={{ minHeight: '60px' }}>
                {displayValue}
            </div>
        </Dialog>
    );
};

export default Comparison;
