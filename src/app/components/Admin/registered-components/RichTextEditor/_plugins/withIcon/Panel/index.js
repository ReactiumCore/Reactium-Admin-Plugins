import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import isHotkey from 'is-hotkey';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Editor, Transforms } from 'slate';
import Reactium, { __ } from 'reactium-core/sdk';
import { ReactEditor, useEditor } from 'slate-react';
import { Button, Dialog, Icon } from '@atomic-reactor/reactium-ui';

const CloseButton = props => (
    <Button
        size={Button.ENUMS.SIZE.XS}
        color={Button.ENUMS.COLOR.CLEAR}
        className='ar-dialog-header-btn dismiss'
        {...props}>
        <Icon name='Feather.X' />
    </Button>
);

const Panel = ({ title, ...props }) => {
    const editor = useEditor();

    const hide = () => {
        editor.panel.hide(false).setID('rte-panel');
        ReactEditor.focus(editor);
    };

    const cx = cls =>
        _.chain([op.get(props, 'className', op.get(props, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const render = () => {
        const header = {
            elements: [<CloseButton onClick={hide} />],
            title,
        };

        return (
            <Dialog collapsible={false} dismissable={false} header={header}>
                <div className={cx()}>
                    <div className='p-xs-20'>ICONS</div>
                </div>
            </Dialog>
        );
    };

    return render();
};

Panel.propTypes = {
    namespace: PropTypes.string,
    title: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'rte-icons',
    title: __('Icons'),
};

export { Panel as default };
