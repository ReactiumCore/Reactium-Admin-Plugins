import React, { useState } from 'react';
import Reactium, {
    __,
    useHandle,
    useHookComponent,
    useAsyncEffect,
} from 'reactium-core/sdk';
import op from 'object-path';
import copy from 'copy-to-clipboard';

const useModal = () => {
    const tools = useHandle('AdminTools');
    return op.get(tools, 'Modal');
};

const useToast = () => {
    const tools = useHandle('AdminTools');
    return op.get(tools, 'Toast');
};

const noop = () => {};
const NewClient = ({ onSave = noop, onCancel = noop }) => {
    const { Dialog, Button } = useHookComponent('ReactiumUI');
    const [name, setName] = useState('');
    const clientNameLabel = __('Client Name');

    return (
        <Dialog header={{ title: __('New Client') }}>
            <div className='syndicate-new'>
                <div className={'syndicate-new-name form-group'}>
                    <label>
                        <span>{clientNameLabel}</span>
                        <input
                            type='text'
                            onChange={e => setName(e.target.value)}
                            placeholder={clientNameLabel}
                        />
                    </label>
                </div>

                <div className='syndicate-new-controls'>
                    <Button
                        size='sm'
                        type='button'
                        color={'danger'}
                        onClick={onCancel}>
                        {__('Cancel')}
                    </Button>
                    <Button
                        size='sm'
                        type='button'
                        color={'primary'}
                        onClick={() => onSave(name)}
                        disabled={!name || !name.length}>
                        {__('Save')}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

const Clients = () => {
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState({});
    const { Spinner, Button, Icon, DataTable } = useHookComponent('ReactiumUI');
    const ConfirmBox = useHookComponent('ConfirmBox');
    const Modal = useModal();
    const Toast = useToast();

    useAsyncEffect(async isMounted => {
        const result = await Reactium.Syndicate.Client.list();
        if (isMounted) {
            setClients(op.get(result, 'results', {}));
            setLoading(false);
        }
    }, []);

    const newClient = async name => {
        const client = await Reactium.Syndicate.Client.create({ client: name });
        const newClients = { [client.objectId]: client, ...clients };
        setClients(newClients);
        Toast.show({
            icon: 'Feather.Check',
            message: __('Client Created'),
            type: Toast.TYPE.INFO,
        });
        Modal.hide();
    };

    const confirmDelete = client => async () => {
        await Reactium.Syndicate.Client.delete(client);
        const newClients = { ...clients };
        op.del(newClients, client.objectId);
        setClients(newClients);

        Toast.show({
            icon: 'Feather.Check',
            message: __('Deleted Client'),
            type: Toast.TYPE.INFO,
        });
        Modal.hide();
    };

    const showNew = () => {
        Modal.show(
            <NewClient onCancel={() => Modal.hide()} onSave={newClient} />,
        );
    };

    const showDelete = client => () => {
        Modal.show(
            <ConfirmBox
                message={__('Are you sure?')}
                onCancel={() => Modal.hide()}
                onConfirm={confirmDelete(client)}
                title={__('Delete %client').replace(
                    '%client',
                    op.get(client, 'client', ''),
                )}
            />,
        );
    };

    const copyToken = token => () => {
        copy(token);
        Toast.show({
            icon: 'Feather.Check',
            message: __('Token Copied'),
            type: Toast.TYPE.INFO,
        });
    };

    const getColumns = () => ({
        client: {
            label: __('Client'),
            verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
            width: 100,
        },
        token: {
            label: __('Token'),
            verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
        },
        delete: {
            label: null,
            verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
            textAlign: DataTable.ENUMS.TEXT_ALIGN.RIGHT,
            width: 90,
        },
    });

    const mapActions = client => {
        const copyText = __('Copy Token');
        const deleteText = __('Delete');

        return {
            ...client,
            token: (
                <div
                    className='token-column'
                    data-tooltip={copyText}
                    data-align='left'
                    data-vertical-align='top'
                    onClick={copyToken(client.token)}>
                    <Icon name='Feather.Copy' size={18} />
                    <span className='ml-xs-8'>{client.token}</span>
                </div>
            ),
            copy: (
                <Button
                    color={Button.ENUMS.COLOR.CLEAR}
                    size={Button.ENUMS.SIZE.XS}
                    data-tooltip={copyText}
                    data-align='center'
                    data-vertical-align='top'
                    onClick={copyToken(client.token)}>
                    <Icon name='Feather.Copy' size={18} />
                    <span className='sr-only'>{copyText}</span>
                </Button>
            ),
            delete: (
                <Button
                    color={Button.ENUMS.COLOR.DANGER}
                    size={Button.ENUMS.SIZE.XS}
                    data-tooltip={deleteText}
                    data-align='center'
                    data-vertical-align='top'
                    onClick={showDelete(client)}>
                    <Icon name='Feather.X' size={18} />
                    <span className='sr-only'>{deleteText}</span>
                </Button>
            ),
        };
    };

    const renderClients = () => {
        if (loading)
            return (
                <div className='syndicate-loading'>
                    <Spinner />
                </div>
            );

        return (
            <DataTable
                scrollable={true}
                columns={getColumns()}
                data={Object.values(clients).map(mapActions)}
            />
        );
    };

    return (
        <div className='syndicate-clients'>
            <div className='syndicate-clients-header'>
                <h2 className='h3'>{__('Syndication Clients')}</h2>
                <Button
                    appearance={Button.ENUMS.APPEARANCE.PILL}
                    className='mr-xs-24'
                    color={Button.ENUMS.COLOR.PRIMARY}
                    outline
                    size={Button.ENUMS.SIZE.XS}
                    onClick={showNew}>
                    <Icon name='Feather.Plus' size={18} />
                    <span>{__('New Client')}</span>
                </Button>
            </div>
            {renderClients()}
        </div>
    );
};

export default Clients;
