import React, { useEffect, useRef, useState } from 'react';
import _ from 'underscore';
import op from 'object-path';
import domain from './domain';
import ActivityChart from './ActivityChart';
import ActivityUpdates from './ActivityUpdates';

import {
    __,
    useDerivedState,
    useEventHandle,
    useHandle,
    useHookComponent,
} from 'reactium-core/sdk';

import { useReduxState } from '@atomic-reactor/use-select';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Activity
 * -----------------------------------------------------------------------------
 */
const Activity = () => {
    const chartRef = useRef();
    const containerRef = useRef();
    const updatesRef = useRef();

    const [activity] = useReduxState(domain.name);

    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');

    const log = _.sortBy(
        Object.values(op.get(activity, 'log', {})),
        'updatedAt',
    );

    const [state, update] = useDerivedState({
        expanded: true,
        filter: 'recent',
        log,
    });

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    const unMounted = () => !containerRef.current;

    const reset = () =>
        setState({
            filter: 'recent',
            log: data,
        });

    const filter = ({ filter, date = new Date() }) => {
        const formats = {
            year: 'YYYY',
            month: 'MM/YY',
            week: 'w',
        };

        const format = op.get(formats, filter, 'recent');

        const newLog = log.filter(({ updatedAt }) =>
            format === 'recent'
                ? true
                : moment(updatedAt).format(format) ===
                  moment(date).format(format),
        );

        setState({
            filter,
            log: newLog,
        });

        return newLog;
    };

    const _handle = () => ({
        Chart: chartRef,
        Container: containerRef,
        Updates: updatesRef,
        close: () => Modal.hide(),
        filter,
        reset,
        setState,
        state,
    });

    const [handle] = useEventHandle(_handle());

    const showExpand = () => setState({ expanded: false });

    const hideExpand = () => setState({ expanded: true });

    useEffect(() => {
        if (!chartRef.current) return;
        chartRef.current.addEventListener('show', hideExpand);
        chartRef.current.addEventListener('hide', showExpand);

        return () => {
            chartRef.current.removeEventListener('show', hideExpand);
            chartRef.current.removeEventListener('hide', showExpand);
        };
    }, [chartRef.current]);

    return (
        <div className='activity-log' ref={containerRef}>
            <ActivityChart
                log={state.log}
                filter={state.filter}
                ActivityLog={handle}
                ref={chartRef}
            />
            <ActivityUpdates
                className={null}
                log={state.log}
                ActivityLog={handle}
                ref={updatesRef}
                header={<Header handle={handle} />}
            />
        </div>
    );
};

const Header = ({ handle }) => {
    let { Chart, state } = handle;
    Chart = Chart.current || undefined;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [toggleIcon, setToggleIcon] = useState('Feather.ArrowRight');

    useEffect(() => {
        if (Chart) {
            setToggleIcon(
                Chart.state.direction === 'horizontal'
                    ? 'Feather.ArrowRight'
                    : 'Feather.ArrowDown',
            );
        }
    }, [Chart, op.get(Chart, 'state.direction')]);

    return !Chart ? (
        __('Updates')
    ) : (
        <>
            {!state.expanded && Chart.state.direction === 'horizontal' && (
                <Button
                    color={Button.ENUMS.COLOR.CLEAR}
                    size={Button.ENUMS.SIZE.XS}
                    style={{
                        padding: 0,
                        width: 40,
                        height: 20,
                        marginLeft: -16,
                        marginTop: -5,
                    }}
                    onClick={() => Chart.setState({ visible: true })}>
                    <Icon name={toggleIcon} size={18} />
                </Button>
            )}
            {!state.expanded && Chart.state.direction === 'vertical' && (
                <Button
                    color={Button.ENUMS.COLOR.CLEAR}
                    size={Button.ENUMS.SIZE.XS}
                    style={{
                        padding: 0,
                        width: 40,
                        height: 20,
                        marginLeft: -16,
                        marginTop: -5,
                    }}
                    onClick={() => handle.close()}>
                    <Icon name='Feather.X' size={17} />
                </Button>
            )}
            <span className='flex-grow'>{__('Updates')}</span>
            {!state.expanded && Chart.state.direction === 'horizontal' && (
                <Button
                    color={Button.ENUMS.COLOR.CLEAR}
                    size={Button.ENUMS.SIZE.XS}
                    style={{
                        padding: 0,
                        width: 40,
                        height: 20,
                        marginTop: -5,
                        marginRight: -8,
                    }}
                    onClick={() => handle.close()}>
                    <Icon name='Feather.X' size={17} />
                </Button>
            )}
            {!state.expanded && Chart.state.direction === 'vertical' && (
                <Button
                    color={Button.ENUMS.COLOR.CLEAR}
                    size={Button.ENUMS.SIZE.XS}
                    style={{
                        padding: 0,
                        width: 40,
                        height: 20,
                        marginTop: -5,
                        marginRight: -8,
                    }}
                    onClick={() => Chart.setState({ visible: true })}>
                    <Icon name={toggleIcon} size={18} />
                </Button>
            )}
        </>
    );
};

export default Activity;
