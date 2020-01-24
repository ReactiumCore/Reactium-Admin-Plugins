// route.js file

// Import your component
import Component from './index';

export default {
    // Make this higher number to have route evaluated later (default 0)
    order: 0,

    // Route patterns: more specific routes should be entered first
    path: ['/editor'],

    // Should the Route be exact?
    exact: true,

    // the component to load for this route
    component: Component,
};
