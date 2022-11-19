import { get_user_by_id } from '../../../../services/database-service';
import { get_available_balance } from '../../../../services/ethers-service';
import { contract_transfer } from '../../../../services/ethers-service';
import ethers from 'ethers';
var bigNumber = ethers.BigNumber;//chain specific

/**
 * body 
 * {
 *  receiver,
 *  amount
 * }
 */

const createService = () => async (context, request, response) => {

    const sender = await get_user_by_id(context.db_pool, response.locals.user.sub);
    const receiver = await get_user_by_id(context.db_pool, response.body.receiver);

    if ((!!sender && sender.length > 0) && (!!receiver && receiver.length > 0)) {
        //both users exist
        //check sender balance
        let { chainBal, availBal } = await get_available_balance(context.ethers_service, sender);
        const requestAmount = bigNumber.from(request.body.amount);
        if (availBal.lt(requestAmount)) {
            response.send(JSON.stringify({
                'sender': response.locals.user.sub,
                'balance': chainBal.toString(),
                'availableBalance': availBal.toString(),
                'attemptedTransferAmount': requestAmount.toString(),
                'transSubmitted': "fail",
                'failReason': "Insuficient available balance"
            }));
        } else {
            const tx = await contract_transfer(context, sender, receiver, request.body.amount);
            response.send(JSON.stringify({
                'transHash': tx.hash
            }));
            const receipt = await tx.wait();
            console.log('receipt is ', receipt);
        }
    } else {
        response.send(404, `one of the user or both users cannot be found, please check and try again`);
    }

    // response.send(200,
    //     JSON.stringify({
    //         from: response.locals.user.sub,
    //         to: request.body.to,
    //         amount: request.body.amount
    //     }));
};

export default createService;