import React from 'react';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

const PublisherEditor = props => {
    const ElementDialog = useHookComponent('ElementDialog');
    return <ElementDialog {...props}>PUBLISHER</ElementDialog>;
};

export default PublisherEditor;
