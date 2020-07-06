import React from 'react';
import cn from 'classnames';
import op from 'object-path';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

export default props => {
    const {
        filename,
        meta = {},
        objectId,
        thumbnail,
        type,
        url,
        style = {},
        className = 'block',
        cx,
        onItemSelect,
        onItemUnselect,
        redirect = {},
        selected = false,
    } = props;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const thm = thumbnail
        ? Reactium.Media.url(thumbnail)
        : op.get(redirect, 'url', url);

    const cname = cn(className, cx('item'), String(type).toLowerCase(), {
        selected,
    });

    const title = op.get(meta, 'title', filename);

    const styles = {
        ...style,
        backgroundImage: `url('${thm}')`,
    };

    const onClick = selected ? onItemUnselect : onItemSelect;
    const color = selected ? 'danger' : 'primary';
    const ico = selected ? 'Feather.X' : 'Feather.Check';

    return (
        <div className={cname} onClick={() => onClick(objectId)} style={styles}>
            {title && <div className='title'>{title}</div>}
            <Button
                appearance='circle'
                className='check'
                color={color}
                readOnly>
                <Icon name={ico} />
            </Button>
        </div>
    );
};
