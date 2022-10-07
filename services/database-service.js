import pg from 'pg';

const load_database_service = async () => {
    const pool = new pg.Pool({
          connectionString: process.env.POSTGRES_CONNECTION_STRING,
          ssl: {
            rejectUnauthorized: false
          },
          max: 10
        });

    return await pool.connect();
};

export default load_database_service;

export const get_user_by_id = async (pool, user_id) => {
    let queryText = `SELECT u.user_id, u.address, t.id as transactionId, t.hash as transactionHash, t.status as transactionStatus, t.amount as transactionAmount FROM userwallet u LEFT JOIN trans t ON (u.user_id = t.user_id) WHERE u.user_id = ${user_id};`;
    
    const result = await pool.query(queryText);
    return result.rows;
}

export const create_user = async (pool, user_id) => {
    let queryText = `INSERT INTO userwallet (username, address, private, balance, availbalance) VALUES ($1::varchar, $2::varchar, $3::varchar, $4::varchar, $5::varchar);`;
    
    const result = await pool.query(queryText);
    return result.rows;
}