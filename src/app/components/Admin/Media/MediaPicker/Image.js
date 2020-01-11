import React from 'react';
import cn from 'classnames';
import op from 'object-path';
import Reactium from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

export default props => {
    const {
        ext,
        file,
        filename,
        meta,
        objectId,
        thumbnail,
        type,
        url,
        style = {},
        cx,
        onItemSelect,
        onItemUnselect,
        selection,
    } = props;

    const selected = selection.includes(objectId);

    const thm = thumbnail
        ? Reactium.Media.url(thumbnail)
        : Reactium.Media.url(file);

    const cname = cn({
        [String(type).toLowerCase()]: true,
        [cx('item')]: true,
        selected,
    });

    const title = op.get(meta, 'title', filename);

    const styles = {
        ...style,
        backgroundImage: `url('${thm}')`,
    };

    const onClick = selected ? onItemUnselect : onItemSelect;

    return (
        <div className={cname} onClick={() => onClick(objectId)} style={styles}>
            <div className='title'>{title}</div>
            <Button
                appearance='circle'
                color='primary'
                className='check'
                readOnly>
                <Icon name='Feather.Check' />
            </Button>
        </div>
    );
};
