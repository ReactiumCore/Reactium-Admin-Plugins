import React, { useState } from 'react';

const SettingsScene = props => {
    const { handle } = props;

    const { cx } = handle;
    return <div className={cx('settings')}>Settings</div>;
};

export default SettingsScene;
