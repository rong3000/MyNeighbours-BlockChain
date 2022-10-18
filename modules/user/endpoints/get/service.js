import { get_user_by_id } from '../../../../services/database-service';

const createService = () => async (context, request, response) => {
    const results = await get_user_by_id(context.db_pool, request.params.userId);

    if (!results || results.length === 0) {
        response.send(404, `User with id ${request.params.userId} could not be found`);
    }
    else {
        const user = {
            id: results[0].user_id,
            address: results[0].address,
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