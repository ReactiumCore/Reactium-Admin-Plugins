import React from 'react';
import Toggle from './index';
import { shallow } from 'reactium-core/enzyme';

test('<Toggle />', () => {
    const component = shallow(<Toggle />);

    expect(component.html().length).toBeGreaterThan(0);
});
