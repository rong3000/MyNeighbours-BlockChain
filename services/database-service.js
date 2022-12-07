import groupBy from '../common/group-by';
import knex from 'knex';

const load_database_service = async () => {
    return knex({
        client: 'postgresql',
        connection: {
            connectionString: process.env.POSTGRES_CONNECTION_STRING,
            ssl: process.env.POSTGRES_CONNECTION_STRING.indexOf('localhost') 
                ? false 
                : { rejectUnauthorized: false },
        },
        pool: {
            min: 2,
            max: 10
        }
    });
};

export default load_database_service;

export const get_user_by_id = async (knex, ssoUserId) => {
    const result = await knex('userwallet').where('user_id', ssoUserId).first();
    return result;
}

export const get_user_with_transaction_by_id = async (knex, user_id) => {
    const results = await knex('userwallet as u')
        .leftJoin('trans as t', 'u.user_id', 't.user_id')
        .where('u.user_id', user_id)
        .select('u.user_id', 
                'u.address',
                'u.private', 
                't.id as transactionId',
                't.hash as transactionHash',
                't.status as transactionStatus',
                't.amount as transactionAmount');

    if (results.length > 0) {
        return groupBy(results, ['user_id', 'address', 'private'])[0];
    }
    else {
        return undefined;
    }
}

export const create_user = async (knex, address, privateKey, user_id) => {
    try {
        const results = await knex('userwallet')
        .insert({address: address, private: privateKey, user_id: user_id}, ['*']);

        return {
            error: 0,
            result: results
        };
    } catch (error) {
        console.log('error is ', error);

        return {
            error: 1,
            result: error
        };
    }
}

export const user_init_db = async (knex, hash, user_id) => {
    try {
        const results = await knex('trans_init_eth')
        .insert({hash: hash, status: '2', amount: '0x2386F26FC10000', user_id: user_id}, ['*']);

        return {
            error: 0,
            result: results
        };
    } catch (error) {
        console.log('error is ', error);

        return {
            error: 1,
            result: error
        };
    }
}

export const tx_db = async (knex, hash, amount, user_id) => {
    try {
        await knex('trans')
            .insert({hash, status: '2', amount, user_id}, ['*']);
    } catch (error) {
        console.log('error is ', error);
    }
}

export const update_ETH_TX_Status = async (knex, receipt, hash) => {
    try {
        const result = await knex('trans_init_eth')
            .where('hash', hash)
            .update({
                TRANS_STATUS: receipt ? receipt.status : '3'
            });

        return {
            error: 0,
            result: result
        };
    } catch (error) {
        console.log('error is ', error);

        return {
            error: 1,
            result: error
        };
    }
}

export const updateTXStatus = async (knex, receipt, hash) => {
    try {
        const result = await knex('trans')
            .where('TRANS_HASH', hash)
            .update({
                TRANS_STATUS: receipt ? receipt.status : '3'
            });

        return {
            error: 0,
            result: result
        };
    } catch (error) {
        console.log('error is ', error);

        return {
            error: 1,
            result: error
        };
    }
}