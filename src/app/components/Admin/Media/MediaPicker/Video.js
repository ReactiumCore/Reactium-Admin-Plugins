import React from 'react';
import cn from 'classnames';
import op from 'object-path';
import ENUMS from '../enums';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

export default props => {
    const {
        ext,
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

    const videoURL = op.get(redirect, 'url', url);
    const thm = thumbnail && Reactium.Media.url(thumbnail);

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
            {!thm && (
                <video width='100%' height='100%' poster={thm}>
                    <source src={videoURL} type={`video/${ext}`} />
                    {ENUMS.TEXT.VIDEO_UNSUPPORTED}
                </video>
            )}
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
