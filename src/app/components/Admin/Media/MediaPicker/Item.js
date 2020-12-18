import React from 'react';
import File from './File';
import Audio from './Audio';
import Image from './Image';
import Video from './Video';
import op from 'object-path';

export default ({ handle, ...item }) => {
    const type = String(op.get(item, 'type', 'FILE')).toUpperCase();

    switch (type) {
        case 'AUDIO':
            return <Audio {...handle} {...item} />;

        case 'IMAGE':
            return <Image {...handle} {...item} />;

        case 'VIDEO':
            return <Video {...handle} {...item} />;

        case 'FILE':
            return <File {...handle} {...item} />;

        default:
            return null;
    }
};
