import Reactium from 'reactium-core/sdk';
import * as EventForm from './index';
import * as ReactiumUI from '@atomic-reactor/reactium-ui';

const priority = Reactium.Enums.priority.lowest + 10;

Reactium.Plugin.register('ReactiumUIEventForm', priority).then(() => {
    const RUI = Reactium.Component.get('ReactiumUI') || ReactiumUI;
    Reactium.Component.register(
        'ReactiumUI',
        { ...RUI, ...EventForm },
        priority,
    );
});
