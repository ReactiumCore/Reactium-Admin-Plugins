import React, { useEffect } from 'react';
import _ from 'underscore';
import op from 'object-path';
import { useEventHandle, useHookComponent, useRefs } from 'reactium-core/sdk';
// import Empty from './Scene/Empty';
// import Display from './Scene/Display';
// import Action from './Scene/Action';

export const Editor = props => {
    const refs = useRefs();
    const { editor, fieldName } = props;
    const value = op.get(editor.value, fieldName, []);
    const ElementDialog = useHookComponent('ElementDialog');
    const { Dropzone, Scene } = useHookComponent('ReactiumUI');

    const _handle = () => ({
        refs,
        props,
    });

    const [handle] = useEventHandle(_handle());

    const buttonClick = () => {
        console.log(refs);
        console.log(refs.get('dropzone'));
    };

    return (
        <ElementDialog {...props}>
            <Dropzone ref={elm => refs.set('dropzone', elm)}>
                <Scene
                    active={value.length > 0 ? 'display' : 'empty'}
                    width='100%'
                    height={280}
                    ref={elm => refs.set('scene', elm)}>
                    <div id='display'>Media</div>
                    <div id='empty'>
                        <button type='button' onClick={() => buttonClick()}>
                            Test
                        </button>
                    </div>
                    <div id='upload'>Upload</div>
                </Scene>
            </Dropzone>
        </ElementDialog>
    );
};
