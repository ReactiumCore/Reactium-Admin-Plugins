import React, { Component } from 'react';
import cn from 'classnames';

/**
 * -----------------------------------------------------------------------------
 * React Component: Slide
 * -----------------------------------------------------------------------------
 */
export default class Slide extends Component {
    static defaultProps = {
        namespace: 'ar-carousel-slide',
        defaultStyle: {
            flexShrink: 0,
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            style: props.style || {},
        };

        this.slide = React.createRef();
    }

    componentDidMount() {
        const element = this.slide.current;
        this.setState({ element });
    }

    render() {
        let { style } = this.state;

        const {
            active,
            children,
            className,
            index,
            defaultStyle,
            namespace,
            next,
        } = this.props;

        const display = active === index || next === index;

        const newStyle = {
            ...defaultStyle,
            ...style,
            display: display ? '' : 'none',
        };

        const cname = cn({
            [`${namespace}-${index}`]: !!namespace,
            [namespace]: !!namespace,
            [className]: !!className,
            active: active === index || next === index,
        });
        return (
            <div className={cname} style={newStyle} ref={this.slide}>
                {children}
            </div>
        );
    }
}
