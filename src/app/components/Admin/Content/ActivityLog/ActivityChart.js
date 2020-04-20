import _ from 'underscore';
import moment from 'moment';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import Reactium, {
    useDerivedState,
    useFulfilledObject,
    useHookComponent,
} from 'reactium-core/sdk';

const getData = log =>
    log.reduce((obj, item) => {
        const { createdAt } = item;
        const date = moment(createdAt).format('L');
        if (!op.has(obj, date)) op.set(obj, date, []);

        op.set(item, 'date', date);
        obj[date].push(item);

        return obj;
    }, {});

const ActivityChart = props => {
    let { className, log = [], namespace } = props;

    const containerRef = useRef();

    const { AreaChart } = useHookComponent('ReactiumUI');

    const [state, setNewState] = useDerivedState({
        data: undefined,
    });

    const [ready] = useFulfilledObject(state, ['data']);

    const cx = Reactium.Utils.cxFactory(namespace);

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    const unMounted = () => !containerRef.current;

    useEffect(() => {
        if (!state.data) setState({ data: getData(log) });
    }, [state.data]);

    return (
        <div className={cn(cx(), className)} ref={containerRef}>
            {ready && <div>HELLO</div>}
        </div>
    );
};

ActivityChart.defaultProps = {
    className: 'col-xs-12 col-md-8 col-lg-10',
    log: [],
    namespace: 'activity-chart',
};

export default ActivityChart;
