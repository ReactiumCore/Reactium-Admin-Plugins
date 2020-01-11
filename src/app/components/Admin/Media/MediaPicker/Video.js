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

    const edgeURL = Reactium.Media.url(file);
    const thm = thumbnail && Reactium.Media.url(thumbnail);

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
            <video width='100%' height='100%' poster={thm}>
                <source src={edgeURL} type={`video/${ext}`} />
                {ENUMS.TEXT.VIDEO_UNSUPPORTED}
            </video>
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
