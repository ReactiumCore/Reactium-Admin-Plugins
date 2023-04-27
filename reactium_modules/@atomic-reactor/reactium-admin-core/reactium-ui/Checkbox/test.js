import React from 'react';
import Checkbox from './index';
import { shallow } from 'reactium-core/enzyme';

test('<Checkbox />', () => {
    const component = shallow(<Checkbox />);

    expect(component.html().length).toBeGreaterThan(0);
});
