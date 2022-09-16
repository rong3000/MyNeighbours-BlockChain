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
    let queryText = `SELECT user.blockChainAccount as account, bce.id as expenseId, bce.hash as expenseHash, bce.status as expenseStatus, bce.amount as expenseAmount FROM user left join blockChainExpense as bce on (user.id = blockChainExpense.userId) WHERE user.id = '${user_id}';`;
    
    const results = await pool.query(queryText);
    return results;
}

export const create_user = async (pool, user_id) => {
    let queryText = `INSERT INTO userwallet5 (username, address, private, balance, availbalance) VALUES ($1::varchar, $2::varchar, $3::varchar, $4::varchar, $5::varchar);`;
    
    const results = await pool.query(queryText);
    return results;
}