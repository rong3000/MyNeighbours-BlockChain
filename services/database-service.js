import pg from 'pg';
import groupBy from '../common/group_by';

const load_database_service = async () => {
    const pool = new pg.Pool({
        connectionString: process.env.POSTGRES_CONNECTION_STRING,
        ssl: {
            rejectUnauthorized: false
        },
        max: 10,
        ssl: process.env.POSTGRES_CONNECTION_STRING.indexOf('localhost') ? false : true
    });

    return await pool.connect();
};

export default load_database_service;

export const get_user_by_id = async (pool, user_id) => {
    let queryText = `
    SELECT 
        u.user_id, 
        u.address, 
        u.private, 
        t.id as \"transactionId\", 
        t.hash as \"transactionHash\", 
        t.status as \"transactionStatus\", 
        t.amount as \"transactionAmount\" 
    FROM userwallet u LEFT JOIN trans t ON (u.user_id = t.user_id) 
    WHERE u.user_id = \'${user_id}\';`;

    const result = await pool.query(queryText);
    if (result.rowCount > 0) {
        return groupBy(result.rows, ['user_id', 'address', 'private'])[0];
    }
    else {
        return undefined;
    }
}

export const create_user = async (pool, address, privateKey, user_id) => {
    let queryText = `INSERT INTO userwallet (address, private, user_id) VALUES (\'${address}\', \'${privateKey}\', \'${user_id}\');`;
    try {
        const result = await pool.query(queryText);

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

export const user_init_db = async (pool, hash, user_id) => {
    //write tx information into table TRANS_TEST
    /*
    pool.connect((err, client, done) => {
        if (err) {
            console.log('err is ', err);
        }

        client.query("INSERT INTO TRANS_TEST (TRANS_HASH, TRANS_STATUS, TRANS_AMOUNT, USER_ID) VALUES ($1::varchar, $2::int, $3::varchar, $4::int);",
            [tx.hash,
                2,
                "0x2386F26FC10000",
            dbRes.rows[0].id
            ], (err, res) => {
                done()
                if (err) {
                    console.log(err.stack)
                } else {
                    // console.log('data inserted into trans db are ', tx.hash,
                    //   2,
                    //   req.body.amount,
                    //   dbRes.rows[0].id);
                    console.log('inserted into Trans db without error', res.command, ' ', res.rowCount);
                }
            })
    });
    */

    let queryText = `INSERT INTO trans_init_eth (hash, status, amount, user_id) VALUES (\'${hash}\', \'2\', \'0x2386F26FC10000\', \'${user_id}\');`;
    try {
        const result = await pool.query(queryText);

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

export const tx_db = async (pool, hash, amount, user_id) => {
    //write tx information into table TRANS_TEST
    /*
    pool.connect((err, client, done) => {
        if (err) {
            console.log('err is ', err);
        }

        client.query("INSERT INTO TRANS_TEST (TRANS_HASH, TRANS_STATUS, TRANS_AMOUNT, USER_ID) VALUES ($1::varchar, $2::int, $3::varchar, $4::int);",
            [tx.hash,
                2,
                "0x2386F26FC10000",
            dbRes.rows[0].id
            ], (err, res) => {
                done()
                if (err) {
                    console.log(err.stack)
                } else {
                    // console.log('data inserted into trans db are ', tx.hash,
                    //   2,
                    //   req.body.amount,
                    //   dbRes.rows[0].id);
                    console.log('inserted into Trans db without error', res.command, ' ', res.rowCount);
                }
            })
    });
    */

    let queryText = `INSERT INTO trans (hash, status, amount, user_id) VALUES (\'${hash}\', \'2\', \'${amount}\', \'${user_id}\');`;
    try {
        const result = await pool.query(queryText);

        // return {
        //     error: 0,
        //     result: result
        // };
    } catch (error) {
        console.log('error is ', error);

        // return {
        //     error: 1,
        //     result: error
        // };
    }
}

export const update_ETH_TX_Status = async (pool, receipt, hash) => {

    let queryText;
    if (!receipt) {
        queryText = "UPDATE trans_init_eth SET TRANS_STATUS = " + "\'" + '3' + "\'" + " WHERE TRANS_HASH = " + "\'" + hash + "\'" + ";";

    } else {
        queryText = "UPDATE trans_init_eth SET TRANS_STATUS = " + "\'" + receipt.status + "\'" + " WHERE TRANS_HASH = " + "\'" + hash + "\'" + ";";
    }
    console.log('q ', queryText);
    try {
        const result = await pool.query(queryText);

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

export const updateTXStatus = async (pool, receipt, hash) => {

    let queryText;
    if (!receipt) {
        queryText = "UPDATE trans SET TRANS_STATUS = " + "\'" + '3' + "\'" + " WHERE TRANS_HASH = " + "\'" + hash + "\'" + ";";

    } else {
        queryText = "UPDATE trans SET TRANS_STATUS = " + "\'" + receipt.status + "\'" + " WHERE TRANS_HASH = " + "\'" + hash + "\'" + ";";
    }
    console.log('q ', queryText);
    try {
        const result = await pool.query(queryText);

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