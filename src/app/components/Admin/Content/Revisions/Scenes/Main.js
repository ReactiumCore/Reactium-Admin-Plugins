import React from 'react';
import op from 'object-path';
import _ from 'underscore';
import { Dialog, Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __ } from 'reactium-core/sdk';
import SelectBranch from '../_helpers/SelectBranch';
import SelectCompare from '../_helpers/SelectCompare';

const MainScene = props => {
    const { handle } = props;
    const { cx, state } = handle;
    const currentBranch = op.get(state, 'working.branch');

    // Set editor to working branch, update front-end router state and close
    // Version Manager
    const setEditorBranch = async () => {
        const value = op.get(state, 'working.content', {});

        await handle.editor.dispatch('load', {
            value,
            ignoreChangeEvent: true,
        });

        handle.onClose();

        _.defer(() => {
            const type = op.get(handle, 'editor.type');
            const slug = op.get(value, 'slug');
            const branch = op.get(value, 'history.branch');

            if (branch === 'master') {
                Reactium.Routing.history.push(
                    `/admin/content/${type}/${slug}?debug=true`,
                );
            } else {
                Reactium.Routing.history.push(
                    `/admin/content/${type}/${slug}/branch/${branch}?debug=true`,
                );
            }
        });
    };

    return (
        <div className={cx('main')}>
            <Dialog
                collapsible={false}
                header={{ title: __('Manage Versions') }}
                className={cx('dialog')}>
                <div className={cx('option')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={handle.labels('SELECT_BRANCH').tooltip}>
                        {handle.labels('SELECT_BRANCH').label}
                    </h3>
                    <SelectBranch handle={handle} />
                </div>

                <div className={cx('option')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={handle.labels('COMPARE_BRANCH').tooltip}>
                        {handle.labels('COMPARE_BRANCH').label}
                    </h3>
                    <SelectCompare handle={handle} />
                </div>

                <div className={cx('option')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={handle.labels('SET_BRANCH').tooltip}>
                        {handle.labels('SET_BRANCH').tooltip}
                    </h3>
                    <Button
                        size={Button.ENUMS.SIZE.MD}
                        color={Button.ENUMS.COLOR.PRIMARY}
                        title={handle.labels('SET_BRANCH').tooltip}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={handle.labels('SET_BRANCH').tooltip}
                        data-dropdown-element
                        disabled={
                            op.get(handle, 'editor.value.history.branch') ===
                            currentBranch
                        }
                        onClick={setEditorBranch}>
                        {handle.labels('SET_BRANCH').label}
                    </Button>
                </div>

                <div className={cx('option')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={handle.labels('REVISIONS').tooltip}>
                        {handle.labels('REVISIONS').tooltip}
                    </h3>
                    <Button
                        size={Button.ENUMS.SIZE.MD}
                        color={Button.ENUMS.COLOR.PRIMARY}
                        outline
                        title={handle.labels('REVISIONS').tooltip}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={handle.labels('REVISIONS').tooltip}
                        onClick={() => {
                            handle.navTo('revisions');
                        }}>
                        {handle.labels('REVISIONS').label}
                    </Button>
                </div>

                <div className={cx('option')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={handle.labels('CLONE').tooltip}>
                        {handle.labels('CLONE').tooltip}
                    </h3>
                    <Button
                        size={Button.ENUMS.SIZE.MD}
                        outline
                        color={Button.ENUMS.COLOR.PRIMARY}
                        title={handle.labels('CLONE').tooltip}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={handle.labels('CLONE').tooltip}
                        onClick={() => {
                            handle.cloneBranch();
                            handle.navTo('settings');
                        }}>
                        {handle.labels('CLONE').label}
                    </Button>
                </div>
            </Dialog>
        </div>
    );
};

export default MainScene;
