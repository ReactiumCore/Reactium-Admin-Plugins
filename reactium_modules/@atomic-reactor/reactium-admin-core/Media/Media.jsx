import { useSyncState } from '@atomic-reactor/reactium-core/sdk';
import React from 'react';

/**
 * -----------------------------------------------------------------------------
 * Component: Media
 * -----------------------------------------------------------------------------
 */
export const Media = ({ className }) => {
    const state = useSyncState({ content: 'Media' });
    
    return <div className={className}>{state.get('content')}</div>;
};

Media.defaultProps = {
    className: 'media'
}; 

export default Media;
