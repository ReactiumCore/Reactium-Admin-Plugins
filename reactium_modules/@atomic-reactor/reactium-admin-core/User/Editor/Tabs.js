import React from 'react';
import cn from 'classnames';
import op from 'object-path';
import Reactium, { Zone } from '@atomic-reactor/reactium-core/sdk';

export default ({ editor }) => {
    return (
        <>
            <div className={editor.cx('tabs')}>
                {Reactium.User.Content.list.map((item) => {
                    if (!item.tab) return null;

                    const { id, label } = op.get(item, 'tab');
                    if (!id || !label) return null;
                    const className = cn({
                        [editor.cx('tab')]: true,
                        active: editor.state.tab === id,
                    });

                    return (
                        <button
                            key={`user-tab-button-${id}`}
                            className={className}
                            onClick={(e) => editor.showTab(e, id)}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
            {Reactium.User.Content.list.map((item) =>
                op.has(item, 'tab.id') &&
                op.get(item, 'tab.id') === op.get(editor.state, 'tab') ? (
                    <Zone
                        key={`user-tab-${item.id}`}
                        editor={editor}
                        zone={item.id}
                    />
                ) : null,
            )}
        </>
    );
};
