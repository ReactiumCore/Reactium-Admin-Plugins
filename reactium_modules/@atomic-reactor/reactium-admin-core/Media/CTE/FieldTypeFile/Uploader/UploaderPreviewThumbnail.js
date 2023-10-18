import _ from 'underscore';
import React from 'react';
import { fileExtensions } from '../fileExtensions';
import { useHookComponent } from '@atomic-reactor/reactium-core/sdk';

export const UploaderPreviewThumbnail = ({ className, file }) => {
    const { Icon } = useHookComponent('ReactiumUI');
    const ext = String(file.name).toLowerCase().split('.').pop();
    let { type } = _.findWhere(fileExtensions, { value: ext });

    switch (type) {
        case 'image':
            return (
                <div
                    className={className}
                    style={{ backgroundImage: `url(${file.dataURL})` }}
                />
            );

        case 'archive':
            return (
                <div
                    className={className}
                    children={<Icon name='Linear.Cube' />}
                />
            );

        case 'audio':
            return (
                <div
                    className={className}
                    children={<Icon name='Linear.Mic' />}
                />
            );

        case 'video':
            return (
                <div
                    className={className}
                    children={<Icon name='Linear.ClapboardPlay' />}
                />
            );

        default:
            return (
                <div
                    className={className}
                    children={<Icon name='Linear.Document2' />}
                />
            );
    }
};

UploaderPreviewThumbnail.defaultProps = {
    className: 'media-list-thumb',
};

export default UploaderPreviewThumbnail;
