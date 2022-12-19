import ethers from 'ethers';
import community_token_contract from './community-token-contract.json' assert {type: "json"};
import { tx_db, user_init_db } from './database-service';

import { update_ETH_TX_Status } from './database-service';
import { updateTXStatus } from './database-service';

const load_ethers_service = () => {

    const CONTRACT_ID = process.env.BLOCK_CHAIN_CONTRACT_ID; //to be changed after every contract deployed
   
    const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCK_CHAIN_SERVER_URL);
    provider.on("debug", console.log);

    let contract = new ethers.Contract(CONTRACT_ID, community_token_contract.abi, provider);

    return { CONTRACT_ID, provider, contract };
}

export const get_chainBal_by_address = async (ethers_service, address) => {
    const chainBal = await ethers_service.contract.balanceOf(address);
    return chainBal;
}

export async function get_available_balance(knex, ethers_service, user) {
    try {
        const chainBal = await ethers_service.contract.balanceOf(user.key.address);

        let pendingAmount = ethers.BigNumber.from('0x0');
        let availBal = ethers.BigNumber.from('0x0');

        for (var transaction of user.value) {
            if (transaction.transactionHash != null && transaction.transactionStatus != 0 && transaction.transactionStatus != 1) {
                let txReceipt = await ethers_service.provider.getTransactionReceipt(transaction.transactionHash);
                if (txReceipt == null) {
                    pendingAmount = pendingAmount.add(ethers.BigNumber.from(transaction.transactionAmount))
                } else if (txReceipt.status == 0 || txReceipt.status == 1) {
                    updateTXStatus(knex, txReceipt, transaction.transactionHash);
                }
            }
        }

        availBal = chainBal.sub(pendingAmount);
        return { chainBal, availBal };
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function get_eth(ethers_service, userAddress) {
    return await ethers_service.provider.getBalance(userAddress);
}

export async function send_eth(context, user_id, userAddress) {

    try {
        //get admin private
        const adminPrivate = process.env.ADMIN_PRIVATE;

        let signer = new ethers.Wallet(adminPrivate, context.ethers_service.provider);
        const tx = await signer.sendTransaction({
            to: userAddress,
            value: ethers.utils.parseEther("0.01")
        });
        console.log('tx is ', tx);
        ////write tx into table trans_init_eth
        await user_init_db(context.knex, tx.hash, user_id);

        try {
            const receipt = await tx.wait();
            console.log('receipt is ', receipt);
            //write tx confirmation into table trans_init_eth
            await update_ETH_TX_Status(context.knex, receipt, tx.hash);

            return true;
        }
        catch (e) {
            console.log(e);

            return false;
        }
    }
    catch (e) {
        console.log(e);

        return false;
    }
}


export async function contract_transfer(context, sender, receiver, amount) {

    //get sender private
    let signer = new ethers.Wallet(sender.private, context.ethers_service.provider);
    let contractWithSigner = new ethers.Contract(context.ethers_service.CONTRACT_ID, community_token_contract.abi, signer);

    //init tx
    try {
        const tx = await contractWithSigner.transfer(receiver.address, amount);
        await tx_db(context.knex, tx.hash, amount, sender.user_id);
        return tx;
    } catch (error) {
        console.log(error);
    }

    const receipt = await tx.wait();
    console.log('receipt is ', receipt);
    //write tx confirmation into table trans_init_eth
    updateTXStatus(context.knex, receipt, tx.hash);
}

export async function check_before_transfer(dbResInFunc, res, req, receiver) {
    try {
        let pendingAmount = ethers.BigNumber.from('0x0');;
        let availBal = ethers.BigNumber.from('0x0');

        let chainBal = await contract.balanceOf(dbResInFunc.rows[0].address);

        for (row in dbResInFunc.rows) {
            if (dbResInFunc.rows[row].trans_hash != null) {
                if (dbResInFunc.rows[row].trans_status != 0 && dbResInFunc.rows[row].trans_status != 1) {
                    console.log("dbResInFunc.rows[row] ", dbResInFunc.rows[row]);
                    let txReceipt = await provider.getTransactionReceipt(dbResInFunc.rows[row].trans_hash);
                    if (txReceipt == null) {
                        pendingAmount = pendingAmount.add(ethers.BigNumber.from(dbResInFunc.rows[row].trans_amount))
                    }
                    // else {
                    //   updateTXStatus(txReceipt, dbResInFunc.rows[row]);

                    // }
                    if (txReceipt.status == 0 || txReceipt.status == 1) {
                        console.log('mark');
                        updateTXStatus(txReceipt, dbResInFunc.rows[row].trans_hash);

                    }
                }
            }
        }



        availBal = chainBal.sub(pendingAmount);

        if (availBal.lt(ethers.BigNumber.from(req.body.amount))) {

            res.send(JSON.stringify({
                'sender': res.locals.user.username,
                'balance': chainBal._hex,
                'available balance': availBal._hex,
                'attempted transfer amount': req.body.amount,
                'trans submitted': "fail",
                'if fail reason': "Insuficient available balance"
            }));
        } else {
            let signer = new ethers.Wallet(dbResInFunc.rows[0].private, provider);
            contractTransfer(signer, res, req, dbResInFunc, receiver);
        }
    } catch (error) {
        res.send(JSON.stringify({
            'transSubmitted': "fail",
            'error reason': error.reason,
            'error code': error.code
        }));
    }
}

export default load_ethers_service;