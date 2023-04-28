import _ from 'underscore';
import op from 'object-path';
import React, { useEffect, useState, useRef } from 'react';
import Reactium, { useHookComponent, __ } from 'reactium-core/sdk';

const ContentEditorControl = ({ editor }) => {
    const Modal = op.get(Reactium.State, 'Tools.Modal');
    const revisionManagerRef = useRef();
    const ElementDialog = useHookComponent('ElementDialog');
    const Revisions = useHookComponent('Revisions');
    const { Button, Toggle, Icon } = useHookComponent('ReactiumUI');
    const content = op.get(editor, 'value', {});
    const toggleLabels = {
        on: __('Turn off synchronization'),
        off: __('Turn on synchronization'),
    };

    const [syndicate, setSyndicate] = useState(
        op.get(content, 'meta.syndicate'),
    );

    const manual = op.get(syndicate, 'manual', false) === true;
    const toggleLabel = toggleLabels[manual === false ? 'on' : 'off'];

    const _onManualToggle = e => {
        const newMeta = {
            meta: {
                ...op.get(content, 'meta', {}),
                syndicate: {
                    ...syndicate,
                    manual: e.target.checked === false,
                },
            },
        };

        editor.save(newMeta);
    };

    const _clean = e => {
        setSyndicate(op.get(e.value, 'meta.syndicate'));
    };

    useEffect(() => {
        editor.addEventListener('clean', _clean);
        editor.addEventListener('save-success', _clean);

        return () => {
            editor.addEventListener('clean', _clean);
            editor.addEventListener('save-success', _clean);
        };
    }, [editor]);

    // not syndicated content
    if (syndicate === undefined) return null;

    const currentVersion = op.get(
        content,
        ['branches', op.get(content, 'history.branch'), 'history'],
        [],
    );
    const syndicatedVersion = op.get(content, 'branches.syndicate.history', []);

    const updated =
        op.get(currentVersion, 0) !== op.get(syndicatedVersion, 0) ||
        currentVersion.length !== syndicatedVersion.length ||
        _.difference(syndicatedVersion, currentVersion).length > 0;

    const showRevisionManager = async () => {
        Modal.show(
            <Revisions
                ref={revisionManagerRef}
                startingContent={editor.value}
                onClose={() => Modal.hide()}
                editor={editor}
            />,
        );

        const handle = await new Promise(resolve => {
            let int = setInterval(() => {
                if (revisionManagerRef.current) {
                    clearInterval(int);
                    resolve(revisionManagerRef.current);
                }
            }, 100);
        });

        handle.setBranch('syndicate', 'compare');
        handle.navTo('branches');
    };

    const renderCompare = () => {
        return (
            manual === true &&
            updated && (
                <Button
                    size='sm'
                    appearance='pill'
                    onClick={showRevisionManager}
                    type='button'>
                    <Icon name='Feather.GitBranch' className='mr-xs-8' />
                    {__('Merge Changes')}
                </Button>
            )
        );
    };

    return (
        <ElementDialog
            editor={editor}
            pref='admin.dialog.syndicate.editor'
            title={__('Syndication')}
            helpText={__(
                'Use to toggle manual synchronization on this content.',
            )}>
            <div className='p-xs-20'>
                <div className='form-group mb-xs-8'>
                    <label>
                        <span>{toggleLabel}</span>
                        <Toggle
                            value={true}
                            checked={manual === false}
                            onChange={_onManualToggle}
                        />
                    </label>
                </div>
                {renderCompare()}
            </div>
        </ElementDialog>
    );
};

export default ContentEditorControl;
