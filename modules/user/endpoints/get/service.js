import { get_user_by_id } from '../../../../services/database-service';
import { get_chainBal_by_address } from '../../../../services/ethers-service';

const createService = () => async (context, request, response) => {
    const results = await get_user_by_id(context.db_pool, response.locals.user.sub);

    if (!results || results.length === 0) {
        response.send(404, `User with id ${response.locals.user.sub} could not be found`);
    }
    else {
        const chainBal = await get_chainBal_by_address(context.ethers_service, results[0].address);
        const user = {
            id: results[0].user_id,
            address: results[0].address,
            balance: chainBal._hex,
            transactions: results[0].transactionId ? results.map((result) => ({
                id: result.transactionId,
                hash: result.transactionHash,
                status: result.transactionStatus,
                amount: result.transactionAmount
            })): [],
        };
    
        response.send(JSON.stringify(user));
    }
};

export default createService;