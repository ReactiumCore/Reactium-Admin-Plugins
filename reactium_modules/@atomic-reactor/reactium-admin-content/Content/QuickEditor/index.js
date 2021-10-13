import _ from 'underscore';
import moment from 'moment';
import op from 'object-path';
import ENUMS from '../enums';
import React, { useEffect } from 'react';

import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

export default props => {
    return (
        <div className='row flex-middle'>
            <div className='col-xs-12 col-sm-6 col-md-9 col-lg-10 pr-sm-8'>
                <RecentActivity {...props} />
            </div>
            <div className='col-xs-12 col-sm-6 col-md-3 col-lg-2 pl-sm-8'>
                <StatusButton {...props} />
            </div>
        </div>
    );
};

const RecentActivity = ({ item, list, row }) => {
    const refs = useRefs();

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    const [state, update] = useDerivedState({
        message: null,
    });

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    const cacheKey = () => `contentLogReq${item.objectId}`;

    const fetch = () => {
        const { collection } = list.state.contentType;

        const cacheReq =
            Reactium.Cache.get(cacheKey()) ||
            Reactium.Content.changelog(item.objectId, {
                collection,
                limit: 10,
            }).then(response => {
                const { results } = response;
                Reactium.Cache.del(cacheKey());
                return results;
            });

        Reactium.Cache.set(cacheKey(), cacheReq, 5000);

        return cacheReq;
    };

    const refresh = async () => {
        if (isStatus(ENUMS.STATUS.BUSY)) return;
        setStatus(ENUMS.STATUS.BUSY, true);

        let results = await fetch();

        const record = _.first(results);

        const timestamp = record
            ? moment(new Date(record.createdAt)).format('LLL')
            : moment(new Date(item.createdAt)).format('LLL');

        const message = record
            ? `${op.get(record, 'changeType')} ${timestamp}`
            : `CREATED ${timestamp}`;

        setStatus(ENUMS.STATUS.COMPLETE);
        setState({ message });
    };

    const unMounted = () => !refs.get('container');

    useEffect(() => {
        row.addEventListener('expand', refresh);
        row.addEventListener('change', refresh);
        return () => {
            row.removeEventListener('expand', refresh);
            row.removeEventListener('change', refresh);
        };
    }, []);

    return (
        <small className='italic' ref={elm => refs.set('container', elm)}>
            <div
                className='flex flex-xs-middle flex-xs-center flex-sm-left'
                style={{ minHeight: 30 }}>
                {!isStatus(ENUMS.STATUS.COMPLETE) ? (
                    <>{__('Recent activity') + '...'}</>
                ) : (
                    <>
                        {state.message}
                        <Button
                            onClick={refresh}
                            size={Button.ENUMS.SIZE.XS}
                            color={Button.ENUMS.COLOR.CLEAR}
                            style={{
                                width: 30,
                                height: 30,
                                padding: 0,
                                marginLeft: 8,
                            }}>
                            <Icon name='Feather.RefreshCcw' size={12} />
                        </Button>
                    </>
                )}
            </div>
        </small>
    );
};

const StatusButton = ({ item, list, row }) => {
    const [, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    const [state, setState] = useDerivedState({
        status: item.status,
        objectId: item.objectId,
        type: list.state.contentType,
    });

    const { Button } = useHookComponent('ReactiumUI');

    const _onClick = async () => {
        if (isStatus(ENUMS.STATUS.BUSY)) return;

        const { objectId, type } = state;

        // update the button ui
        setStatus(ENUMS.STATUS.BUSY);
        setState({
            status: state.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
        });

        row.collapse();

        // execute operation
        const updated =
            state.status === 'PUBLISHED'
                ? await Reactium.Content.publish({ type, objectId })
                : await Reactium.Content.unpublish({ type, objectId });

        setStatus(ENUMS.STATUS.PENDING);

        // Update list content item.
        const content = JSON.parse(JSON.stringify(list.state.content));
        if (!list.filter) {
            op.set(content, [objectId, 'status'], updated.status);
        } else {
            if (updated.status !== list.state.filter) op.del(content, objectId);
        }

        Reactium.Cache.del(`contentList.${type}`);
        list.setState({ content });
        row.dispatchEvent(new Event('chagne'));
    };

    const buttonProps = () => ({
        appearance: Button.ENUMS.APPEARANCE.PILL,
        children:
            state.status !== 'PUBLISHED' ? __('Publish') : __('Unpublish'),
        color:
            state.status !== 'PUBLISHED'
                ? Button.ENUMS.COLOR.PRIMARY
                : Button.ENUMS.COLOR.TERTIARY,
        disabled: isStatus(ENUMS.STATUS.BUSY),
        outline: state.status === 'PUBLISHED',
        size: Button.ENUMS.SIZE.XS,
        style: { minWidth: 94 },
    });

    return (
        <div className='flex flex-xs-center flex-sm-right pt-xs-16 pt-sm-0'>
            <Button {...buttonProps()} onClick={_onClick} />
        </div>
    );
};
