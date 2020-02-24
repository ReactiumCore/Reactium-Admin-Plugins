import React, { forwardRef } from 'react';

import { Dialog } from '@atomic-reactor/reactium-ui';

let EditorDialog = ({ childen, ...props }, ref) => {
    const { header, footer } = props;

    return <Dialog>{children}</Dialog>;
};

EditorDialog = forwardRef(EditorDialog);
