import React from 'react';
// import _ from 'underscore';
// import op from 'object-path';
// import { Scrollbars } from 'react-custom-scrollbars';
// import { LiveProvider, LiveEditor, LiveError } from 'react-live';
import { useDerivedState, useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: JsxComponent
 * -----------------------------------------------------------------------------
 */
const JsxComponent = ({ handle }) => {
    const { cx } = handle;
    const [state] = useDerivedState({
        code: '<Component>Component</Component>',
    });

    const CodeEditor = useHookComponent('CodeEditor');

    return (
        <div className={cx('jsx')}>
            <div className={cx('jsx-code')}>
                <CodeEditor value={state.code} />
            </div>
        </div>
    );
};

export default JsxComponent;
