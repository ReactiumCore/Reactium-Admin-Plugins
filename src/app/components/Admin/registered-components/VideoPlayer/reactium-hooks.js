import ReactPlayer from 'react-player';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('VideoPlayer').then(() => {
    Reactium.Component.register('VideoPlayer', ReactPlayer);
});
