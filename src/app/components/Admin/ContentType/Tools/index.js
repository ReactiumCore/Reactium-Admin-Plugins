import React, { useState } from 'react';
import Reactium, { __, useHandle } from 'reactium-core/sdk';
import { Icon, Button } from '@atomic-reactor/reactium-ui';
import op from 'object-path';
import Draggable from 'react-draggable';
import _ from 'underscore';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Tools
 * -----------------------------------------------------------------------------
 */
const ToolsPage = ({ page = 1, numPages, setPage }) => {
    return (
        <div className='tools-paging'>
            <Button
                className='tools-paging-left'
                disabled={page === 1}
                onClick={() => setPage(page - 1)}>
                <span className='sr-only'>{__('Previous Tools Page')}</span>
                <Icon name='Feather.ArrowLeft' />
            </Button>
            <Button
                className='tools-paging-right'
                disabled={page === numPages}
                onClick={() => setPage(page + 1)}>
                <span className='sr-only'>{__('Next Tools Page')}</span>
                <Icon name='Feather.ArrowRight' />
            </Button>
        </div>
    );
};

const PAGE_LENGTH = 9;
const Tools = () => {
    const position = Reactium.Prefs.get('types-tools-drag-handle.position', {
        x: 0,
        y: 0,
    });

    const tools = _.chain(Reactium.ContentType.FieldType.list)
        .sortBy('order')
        .chunk(PAGE_LENGTH)
        .value();
    const [page, _setPage] = useState(
        Reactium.Prefs.get('types-tools-drag-handle.page', 1),
    );
    const chunk = op.get(tools, page - 1, []);
    const setPage = (page = 1) => {
        page = Math.max(1, Math.min(chunk.length, page));
        Reactium.Prefs.set('types-tools-drag-handle.page', page);
        _setPage(page);
    };

    const onStop = (mouseEvent, { x, y }) => {
        Reactium.Prefs.set('types-tools-drag-handle.position', { x, y });
    };

    const { addField, addRegion } = useHandle('ContentTypeEditor');

    const renderTools = () => {
        return chunk.map(type => {
            const tooltip = op.get(
                type,
                'tooltip',
                __(
                    'Click to add %type field type to your content type.',
                ).replace(
                    '%type',
                    op.get(type, 'label', op.get(type, 'type').toLowerCase()),
                ),
            );

            const Icon = op.get(type, 'icon');
            return (
                <Button
                    color={Button.ENUMS.COLOR.CLEAR}
                    key={op.get(type, 'type')}
                    data-tooltip={tooltip}
                    data-align='left'
                    data-vertical-align='middle'
                    onClick={() => addField(op.get(type, 'type'))}>
                    <span className={'sr-only'}>{tooltip}</span>
                    <Icon />
                </Button>
            );
        });
    };

    const addRegionLabel = __('Add Region');
    return (
        <Draggable
            handle='.types-tools-drag-handle'
            onStop={onStop}
            defaultPosition={position}>
            <div className={'types-tools'}>
                {tools.length > 1 && (
                    <ToolsPage
                        page={page}
                        numPages={chunk.length}
                        setPage={setPage}
                    />
                )}
                <Button
                    color={Button.ENUMS.COLOR.CLEAR}
                    data-tooltip={addRegionLabel}
                    data-align='left'
                    data-vertical-align='middle'
                    onClick={() => addRegion()}>
                    <span className={'sr-only'}>{addRegionLabel}</span>
                    <div className='add-region-icon'></div>
                </Button>
                {renderTools()}
                <div className='types-tools-drag-handle'></div>
            </div>
        </Draggable>
    );
};

Tools.defaultProps = {};

export default Tools;
