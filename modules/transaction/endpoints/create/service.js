import { get_user_by_id, get_user_with_transaction_by_id } from '../../../../services/database-service';
import { get_available_balance } from '../../../../services/ethers-service';
import { contract_transfer } from '../../../../services/ethers-service';
import ethers from 'ethers';
var bigNumber = ethers.BigNumber;//chain specific

/**
 * body 
 * {
 *  receiver, // receiver's address
 *  amount,
 *  isFromAdmin
 * }
 */

const createService = () => async (context, request, response) => {

    const senderAddress = request.body.isFromAdmin ? process.env.ADMIN_ADDRESS : response.locals.user.sub;
    const receiverAddress = request.body.receiver;

    const sender = request.body.isFromAdmin ? 
    {
        key: {
            user_id: process.env.ADMIN_USER_ID,
            address: process.env.ADMIN_ADDRESS,
            private: process.env.ADMIN_PRIVATE
        },
        value: []
    }
    : await get_user_with_transaction_by_id(context.knex, senderAddress);
    const receiver = await get_user_by_id(context.knex, receiverAddress);

    if (sender && receiver) {
        let { chainBal, availBal } = await get_available_balance(context.knex, context.ethers_service, sender);
        const requestAmount = bigNumber.from(request.body.amount);
        if (availBal.lt(requestAmount)) {
            response.send(JSON.stringify({
                'sender': senderAddress,
                'balance': chainBal.toString(),
                'availableBalance': availBal.toString(),
                'attemptedTransferAmount': requestAmount.toString(),
                'transSubmitted': "fail",
                'failReason': "Insuficient available balance"
            }));
        } else {
            const tx = await contract_transfer(context, sender.key, receiver, request.body.amount);
            response.send(JSON.stringify({
                'transHash': tx.hash
            }));
            const receipt = await tx.wait();
            console.log('receipt is ', receipt);
        }
    } else {
        response.send(404, `one of the user or both users cannot be found, please check and try again`);
    }
};

export default createService;