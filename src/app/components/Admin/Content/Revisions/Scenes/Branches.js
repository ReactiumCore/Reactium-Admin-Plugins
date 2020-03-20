import React from 'react';
import op from 'object-path';
import cn from 'classnames';
import _ from 'underscore';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __ } from 'reactium-core/sdk';
import { Scrollbars } from 'react-custom-scrollbars';
import SelectBranch from '../_helpers/SelectBranch';
import SelectCompare from '../_helpers/SelectCompare';

const slugify = name => {
    if (!name) return '';
    return require('slugify')(name, {
        replacement: '_', // replace spaces with replacement
        remove: /[^A-Za-z0-9_\s]/g, // regex to remove characters
        lower: true, // result in lower case
    });
};

const BranchesScene = props => {
    const { handle } = props;
    const { cx, state } = handle;
    const fromChanges = op.get(state, 'working.changes', {});
    const toChanges = op.get(state, 'compare.changes', {});
    const changes =
        Object.values(fromChanges).length + Object.values(toChanges).length;
    console.log({ changes });
    const from = { ...op.get(state, 'working.content', {}), ...fromChanges };
    const to = { ...op.get(state, 'compare.content', {}), ...toChanges };
    const fromBranch = op.get(from, 'history.branch', '');
    const fromBranchLabel = op.get(
        from,
        ['branches', fromBranch, 'label'],
        fromBranch,
    );
    const toBranch = op.get(to, 'history.branch', '');
    const toBranchLabel = op.get(to, ['branches', toBranch, 'label'], toBranch);

    const copyFieldLabel = (fieldName, fromLabel, toLabel) => {
        const label = __('Copy %fieldName from %fromLabel to %toLabel');

        return label
            .replace('%fieldName', fieldName)
            .replace('%fromLabel', fromLabel)
            .replace('%toLabel', toLabel);
    };

    const fieldData = () => {
        const contentType = _.findWhere(state.types, { type: state.type });
        const fieldsByRegion = _.groupBy(
            Object.values(contentType.fields),
            'region',
        );
        const fields = [
            {
                fieldId: 'title',
                fieldType: 'Text',
                fieldName: __('Title'),
            },
        ];
        _.sortBy(
            Object.values(contentType.regions).map(region => {
                let order;
                if (region.id === 'default') order = -1000;
                else if (region.id === 'sidebar') order = 1000;
                else order = op.get(region, 'order', 0);

                return { ...region, order };
            }),
            'order',
        ).forEach(({ id }) => {
            const regionFields = op.get(fieldsByRegion, id);
            regionFields
                .filter(({ fieldId }) => fieldId !== 'publisher')
                .forEach(field => fields.push(field));
        });

        return _.indexBy(
            fields.map(field => ({
                fieldSlug: slugify(field.fieldName),
                ...field,
            })),
            'fieldSlug',
        );
    };

    const missingFieldsInType = (content, fieldData) => {
        const missingKeys = Object.keys(content)
            .filter(fieldSlug => !(fieldSlug in fieldData))
            .filter(
                fieldSlug =>
                    ![
                        'objectId',
                        'uuid',
                        'slug',
                        'type',
                        'user',
                        'ACL',
                        'status',
                        'history',
                        'branches',
                        'meta',
                        'createdAt',
                        'updatedAt',
                    ].includes(fieldSlug),
            );
        return missingKeys;
    };

    const getRowsData = () => {
        const fields = fieldData();
        const missingFrom = missingFieldsInType(from, fields);
        const missingTo = missingFieldsInType(to, fields);
        const rows = [];
        const diffs = {};

        if (missingFrom.length || missingTo.length) {
            rows.push({
                fieldType: {
                    fieldId: 'missing',
                    fieldSlug: 'missing',
                    fieldType: 'Missing',
                    fieldName: __('Missing'),
                },
                from: missingFrom,
                to: missingTo,
            });
        }

        Object.values(fields).forEach(fieldType => {
            const slug = fieldType.fieldSlug;
            const fromFieldData = op.get(from, slug);
            const toFieldData = op.get(to, slug);
            const diff = !_.isEqual(fromFieldData, toFieldData);
            rows.push({
                fieldType,
                from: fromFieldData,
                to: toFieldData,
                diff,
            });

            diffs[slug] = diff;
        });

        return {
            rows,
            diffs,
        };
    };

    const renderRows = () => {
        const components = _.indexBy(Reactium.Content.Comparison.list, 'id');
        const { rows, diffs } = getRowsData();

        return rows.map(row => {
            const { fieldType, from, to, diff = false } = row;
            const fId = op.get(fieldType, 'fieldId', '');
            const ftId = op.get(fieldType, 'fieldType', '');
            const fieldName = op.get(fieldType, 'fieldName', '');
            const fieldSlug = op.get(fieldType, 'fieldSlug', '');

            const fromCopyLabel = copyFieldLabel(
                fieldName,
                fromBranchLabel,
                toBranchLabel,
            );
            const toCopyLabel = copyFieldLabel(
                fieldName,
                toBranchLabel,
                fromBranchLabel,
            );

            const Component = op.get(
                components,
                [ftId, 'component'],
                ({ value }) => (
                    <div>
                        <pre>{JSON.stringify(value, null, 2)}</pre>
                    </div>
                ),
            );

            const className = cn(
                'branch-compare-row',
                `branch-compare-row-${slugify(ftId)}`,
            );

            return (
                <li key={fId} className={className}>
                    <div className='branch-compare-from'>
                        <div className='branch-compare-copy'>
                            <Button
                                disabled={!diff}
                                data-tooltip={fromCopyLabel}
                                data-align='left'
                                data-vertical-align='middle'
                                size={Button.ENUMS.SIZE.XS}
                                color={Button.ENUMS.COLOR.CLEAR}
                                onClick={() => {
                                    handle.stageBranchChanges(
                                        {
                                            [fieldSlug]: from,
                                        },
                                        'compare',
                                    );
                                }}>
                                <span className='sr-only'>{fromCopyLabel}</span>
                                <Icon name='Feather.ArrowRight' />
                            </Button>
                        </div>
                        <div className='comparison-component'>
                            <Component value={from} field={fieldType} />
                        </div>
                    </div>

                    <div className='branch-compare-to'>
                        <div className='branch-compare-copy'>
                            <Button
                                disabled={!diff}
                                data-tooltip={toCopyLabel}
                                data-align='left'
                                data-vertical-align='middle'
                                size={Button.ENUMS.SIZE.XS}
                                color={Button.ENUMS.COLOR.CLEAR}
                                onClick={() => {
                                    handle.stageBranchChanges(
                                        {
                                            [fieldSlug]: to,
                                        },
                                        'working',
                                    );
                                }}>
                                <span className='sr-only'>{toCopyLabel}</span>
                                <Icon name='Feather.ArrowLeft' />
                            </Button>
                        </div>
                        <div className='comparison-component'>
                            <Component value={to} field={fieldType} />
                        </div>
                    </div>
                </li>
            );
        });
    };

    return (
        state.activeScene === 'branches' && (
            <div className={cx('branches')}>
                <div className={cx('branches-controls')}>
                    <div className={cx('branches-control')}>
                        <SelectBranch handle={handle} />
                    </div>
                    <div className={cx('branches-control')}>
                        <SelectCompare handle={handle} />
                    </div>
                </div>
                <Scrollbars
                    autoHeight={true}
                    autoHeightMin={'calc(100vh - 300px)'}>
                    <ul className={cn(cx('branches-diff'), 'branch-compare')}>
                        {renderRows()}
                    </ul>
                </Scrollbars>
                <div className={cx('branches-controls')}>
                    <div className={cx('branches-control')}>
                        <Button disabled={changes < 1}>
                            {__('Save Changes')}
                        </Button>
                    </div>
                </div>
            </div>
        )
    );
};

export default BranchesScene;
