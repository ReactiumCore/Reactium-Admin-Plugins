import Reactium from 'reactium-core/sdk';
import DraggableList from './index';
import MenuList from './MenuBuilder/MenuList';
import MenuItemDragHandle from './MenuBuilder/DragHandle';

Reactium.Component.register('DraggableList', DraggableList);
Reactium.Component.register('MenuList', MenuList);
Reactium.Component.register('MenuItemDragHandle', MenuItemDragHandle);
