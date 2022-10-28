import { get_user_by_id } from '../../../../services/database-service';
import { get_available_balance } from '../../../../services/ethers-service';
import { contract_transfer } from '../../../../services/ethers-service';
import ethers from 'ethers';
var bigNumber = ethers.BigNumber;//chain specific

const createService = () => async (context, request, response) => {

    const sender = await get_user_by_id(context.db_pool, response.locals.user.sub);
    const receiver = await get_user_by_id(context.db_pool, response.locals.user.sub);

    if ((!!sender && sender.length > 0) && (!!receiver && receiver.length > 0)) {
        //both users exist
        //check sender balance
        let { chainBal, availBal } = await get_available_balance(context.ethers_service, sender);
        if (availBal.lt(bigNumber.from(request.body.amount))) {
            response.send(JSON.stringify({
                'sender': response.locals.user.sub,
                'balance': chainBal._hex,
                'available balance': availBal._hex,
                'attempted transfer amount': request.body.amount,
                'trans submitted': "fail",
                'if fail reason': "Insuficient available balance"
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