import _ from 'underscore';
import cn from 'classnames';
import PropTypes from 'prop-types';
import Button from 'reactium-ui/Button';
import Dropdown from 'reactium-ui/Dropdown';
import { Feather } from 'reactium-ui/Icon';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const DEBUG = true;
const noop = () => {};

let Pagination = (
    { onChange, onClick, onNextClick, onPrevClick, update, ...props },
    ref,
) => {
    const containerRef = useRef();
    const stateRef = useRef({
        ...props,
    });

    const [state, setNewState] = useState({ ...stateRef.current });

    const setState = (newState, silent) => {
        if (!containerRef.current) return;
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        if (!silent) setNewState(stateRef.current);
    };

    const next = () => {
        const { page, pages } = stateRef.current;
        let p = page + 1;
        return p > pages || p < 2 ? null : p;
    };

    const prev = () => {
        const { page, pages } = stateRef.current;
        let p = page - 1;
        return p > pages || p < 1 ? null : p;
    };

    const _onChange = (e, p) => {
        const { pages } = stateRef.current;
        if (p > pages || p < 1) return;
        setState({ page: p }, true);
        setState({ next: next(), prev: prev() }, true);
        return p;
    };

    const _onClick = (e, p) => {
        if (!_onChange(e, p)) return;
        const h = handle();
        onChange(e, p, h);
        onClick(e, p, h);
        setState({ page: p });
        return p;
    };

    const _onNextClick = e => {
        const p = next();
        if (!p) return;
        if (!_onClick(e, p)) return;
        onNextClick(e, p, handle());
    };

    const _onPrevClick = e => {
        const p = prev();
        if (!p) return;
        if (!_onClick(e, p)) return;
        onPrevClick(e, p, handle());
    };

    const handle = () => ({
        setState,
        state: stateRef.current,
    });

    useEffect(() => {
        setState(props);
    }, Object.values(props));

    useImperativeHandle(ref, () => handle());

    const renderNumbers = () => {
        const {
            color,
            namespace,
            numbers,
            page,
            pages,
            size,
        } = stateRef.current;

        let pgs = _.range(1, pages + 1);
        let idx = pgs.indexOf(page) - Math.floor(numbers / 2);
        idx = Math.max(0, idx);

        let sel = Array.from(pgs).splice(idx, numbers);

        if (sel.length < numbers) {
            const diff = numbers - sel.length;
            idx -= diff;
            idx = Math.max(0, idx);

            sel = Array.from(pgs).splice(idx, numbers);
        }

        return sel.map(n => (
            <Button
                key={`${namespace}-button-${n}`}
                onClick={e => _onClick(e, n)}
                color={color}
                size={size}
                type='button'
                readOnly={Boolean(page === n)}
                className={cn({
                    'px-xs-8': true,
                    active: page === n,
                })}>
                {n}
            </Button>
        ));
    };

    const renderCurrent = () => {
        const { arrows, color, dropdown, page, pages, size } = stateRef.current;

        const style = { minWidth: 50 };

        if (arrows) {
            style.paddingLeft = 2;
            style.paddingRight = 2;
        }

        const dropdownSelector =
            dropdown === true
                ? { 'data-dropdown-element': true, type: 'button' }
                : { readOnly: true };

        return (
            <Button
                size={size}
                style={style}
                color={color}
                type='button'
                {...dropdownSelector}>
                {page}
                <span className='lowercase mx-xs-8'>of</span>
                {pages}
            </Button>
        );
    };

    const Drop = ({ children }) => {
        const {
            align,
            color,
            page,
            pages,
            size,
            verticalAlign,
        } = stateRef.current;

        const data =
            pages < 1
                ? []
                : _.times(pages, i => {
                      const n = i + 1;
                      return { value: n, label: n };
                  });

        return pages < 1 ? (
            children
        ) : (
            <Dropdown
                align={align}
                checkbox={false}
                color={color}
                data={data}
                onItemSelect={e => _onClick(e, e.item.value)}
                selection={[page]}
                size={size}
                verticalAlign={verticalAlign}>
                {children}
            </Dropdown>
        );
    };

    const render = () => {
        const {
            arrows,
            className,
            color,
            dropdown,
            namespace,
            numbers,
            page,
            pages,
            size,
        } = stateRef.current;

        const display = pages > 1 ? null : 'none';

        const pagination = () => (
            <div className='btn-group' ref={containerRef}>
                {arrows && (
                    <Button
                        color={color}
                        size={size}
                        type='button'
                        readOnly={Boolean(page <= 1)}
                        onClick={e => _onPrevClick(e)}
                        className='px-xs-4'>
                        <Feather.ChevronLeft width={14} height={14} />
                    </Button>
                )}
                {numbers < 2 && renderCurrent()}
                {numbers > 1 && renderNumbers()}
                {arrows && (
                    <Button
                        color={color}
                        size={size}
                        type='button'
                        readOnly={Boolean(page >= pages)}
                        onClick={e => _onNextClick(e)}
                        className='px-xs-4'>
                        <Feather.ChevronRight width={14} height={14} />
                    </Button>
                )}
            </div>
        );

        return (
            <div
                ref={ref}
                style={{ display }}
                className={cn({
                    [namespace]: !!namespace,
                    [className]: !!className,
                })}>
                {dropdown ? <Drop>{pagination()}</Drop> : pagination()}
            </div>
        );
    };

    return render();
};

Pagination = forwardRef(Pagination);

Pagination.COLOR = Button.ENUMS.COLOR;

Pagination.propTypes = {
    align: PropTypes.oneOf(Object.values(Dropdown.ENUMS.ALIGN)),
    arrows: PropTypes.bool,
    className: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    color: PropTypes.oneOf(Object.values(Button.ENUMS.COLOR)),
    dropdown: PropTypes.bool,
    namespace: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    numbers: PropTypes.number,
    onChange: PropTypes.func,
    onClick: PropTypes.func,
    onNextClick: PropTypes.func,
    onPrevClick: PropTypes.func,
    page: PropTypes.number,
    pages: PropTypes.number,
    verticalAlign: PropTypes.oneOf(Object.values(Dropdown.ENUMS.VALIGN)),
};

Pagination.defaultProps = {
    align: Dropdown.ENUMS.ALIGN.CENTER,
    arrows: true,
    className: null,
    color: Button.ENUMS.COLOR.CLEAR,
    dropdown: false,
    namespace: 'ar-pagination',
    numbers: 0,
    onChange: noop,
    onClick: noop,
    onNextClick: noop,
    onPrevClick: noop,
    page: 0,
    size: Button.ENUMS.SIZE.XS,
    verticalAlign: Dropdown.ENUMS.VALIGN.BOTTOM,
};

export { Pagination, Pagination as default };
