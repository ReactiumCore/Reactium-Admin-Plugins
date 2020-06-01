import React, { useState } from 'react';
import { Dialog, Button, Icon } from '@atomic-reactor/reactium-ui';
import op from 'object-path';
import uuid from 'uuid/v4';
import _ from 'underscore';
import { __ } from 'reactium-core/sdk';

const noop = () => {};

const defaultLink = {
    title: '',
    url: '',
};

const AddLinkControl = ({ onAddItems = noop }) => {
    const [link, setLink] = useState(defaultLink);

    const onChange = type => e => {
        const value = e.target.value;

        setLink({
            ...link,
            [type]: value,
        });
    };

    const clearLink = () => setLink(defaultLink);
    const title = op.get(link, 'title', '');
    const url = op.get(link, 'url', '');

    return (
        <div className='p-xs-16'>
            <div className='form-group'>
                <input
                    type='text'
                    onChange={onChange('title')}
                    placeholder={__('Link Title')}
                    value={title}
                />
            </div>

            <div className='form-group'>
                <input
                    type='text'
                    onChange={onChange('url')}
                    placeholder={__('Link URL')}
                    value={url}
                />
            </div>

            <Button
                className='mt-xs-16'
                disabled={!title || !title.length || !url.length}
                onClick={() => {
                    onAddItems(link);
                    clearLink();
                }}>
                {__('Add')}
            </Button>
        </div>
    );
};

const LinkControl = props => {
    const cx = op.get(props, 'cx');
    const onAddItems = op.get(props, 'onAddItems', noop);

    const addItems = item => {
        onAddItems({
            id: uuid(),
            type: 'Link',
            item,
            depth: 0,
        });
    };

    return (
        <div className={cx('control', 'control-link')}>
            <Dialog
                header={{
                    title: (
                        <div className='control-title'>
                            <Icon name={'Feather.Link'} />
                            <span>{__('Link')}</span>
                        </div>
                    ),
                }}
                pref={cx('control-link')}>
                <AddLinkControl onAddItems={addItems} />
            </Dialog>
        </div>
    );
};

export default LinkControl;
