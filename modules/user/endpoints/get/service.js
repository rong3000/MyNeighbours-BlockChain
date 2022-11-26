import ethers from 'ethers';
import { get_user_with_transaction_by_id } from '../../../../services/database-service';
import { get_available_balance } from '../../../../services/ethers-service';

const createService = () => async (context, request, response) => {
    const user = await get_user_with_transaction_by_id(context.knex, response.locals.user.sub);

    if (!user) {
        response.send(404, `User with id ${response.locals.user.sub} could not be found`);
    }
    else {
        let {chainBal, availBal} = await get_available_balance(context.db_pool, context.ethers_service, user);
        const responseBody = {
            id: user.key.user_id,
            address: user.key.address,
            balance: ethers.utils.formatEther(chainBal),
            availBal: ethers.utils.formatEther(availBal),
            transactions: user.value[0].transactionId ? user.value.map((result) => ({
                id: result.transactionId,
                hash: result.transactionHash,
                status: result.transactionStatus,
                amount: ethers.utils.formatEther(result.transactionAmount)
            }))
            : [],
        };
    
        response.send(JSON.stringify(responseBody));
    }
};

export default createService;