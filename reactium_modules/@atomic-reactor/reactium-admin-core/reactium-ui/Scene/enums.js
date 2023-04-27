const ENUMS = {
    ANIMATION: {
        COVER: 'cover',
        FADE: 'fade',
        FLIP: 'flip',
        SLIDE: 'slide',
        REVEAL: 'reveal',
    },
    DEBUG: false,
    DIRECTION: {
        UP: 'up',
        DOWN: 'down',
        LEFT: 'left',
        RIGHT: 'right',
        IN: 'in',
        OUT: 'out',
    },
    DURATION: 0.25,
    EVENT: {
        BEFORE_CHANGE: 'beforeChange',
        CHANGE: 'change',
    },
    OPPOSITE: {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
        in: 'out',
        out: 'in',
        cover: 'reveal',
        reveal: 'cover',
        fade: 'fade',
        flip: 'flip',
        slide: 'slide',
    },
    SIZE: {
        HEIGHT: '100vh',
        WIDTH: '100vw',
    },
};

export default ENUMS;
