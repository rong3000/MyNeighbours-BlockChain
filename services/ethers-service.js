import ethers from 'ethers';
import myToken from './MyToken.json' assert {type: "json"};
import { user_init_db } from './database-service';
import { tx_db } from './database-service';

import { update_ETH_TX_Status } from './database-service';
import { updateTXStatus } from './database-service';

const load_ethers_service = () => {

    const CONTRACT_ID = process.env.BLOCK_CHAIN_CONTRACT_ID; //to be changed after every contract deployed
    const url = process.env.BLOCK_CHAIN_SERVER_URL;
    const provider = new ethers.providers.JsonRpcProvider(url);//chain specific
    let contract = new ethers.Contract(CONTRACT_ID, myToken.abi, provider);
    return { CONTRACT_ID, provider, contract };
}

export const get_chainBal_by_address = async (ethers_service, address) => {
    const chainBal = await ethers_service.contract.balanceOf(address);
    return chainBal;
}

export async function get_available_balance(ethers_service, results) {
    try {
        const chainBal = await ethers_service.contract.balanceOf(results[0].address);
        let b = [];

        let pendingAmount = ethers.BigNumber.from('0x0');
        let availBal = ethers.BigNumber.from('0x0');

        for (var result of results) {
            let a =
            {
                'trans_hash': result.transactionHash,
                'trans_status': result.transactionStatus,
                'trans_amount': result.transactionAmount
            }
            b.push(a);
            // console.log(result.transactionHash);
            // console.log(result.transactionStatus);
            if (result.transactionHash != null) {
                if (result.transactionStatus != 0 && result.transactionStatus != 1) {

                    let txReceipt = await ethers_service.provider.getTransactionReceipt(result.transactionHash);
                    if (txReceipt == null) {
                        pendingAmount = pendingAmount.add(ethers.BigNumber.from(result.transactionAmount))
                    } else if (txReceipt.status == 0 || txReceipt.status == 1) {
                        console.log('mark');
                        updateTXStatus(txReceipt, result.transactionHash);
                    }
                }
            }
        }

        availBal = chainBal.sub(pendingAmount);
        return { chainBal, availBal };
    } catch (error) {
        console.log(error);
        //TODO update error handling

        // res.send(JSON.stringify({
        //     'transSubmitted': "fail",
        //     'error reason': error.reason,
        //     'error code': error.code
        // }));

        return false;
    }
}

export async function user_init_chain(context, user_id, userAddress) {

    //get admin private
    const adminPrivate = process.env.ADMIN_PRIVATE;

    let signer = new ethers.Wallet(adminPrivate, context.ethers_service.provider);
    const tx = await signer.sendTransaction({
        to: userAddress,
        value: ethers.utils.parseEther("0.01")
    });
    console.log('tx is ', tx);
    ////write tx into table trans_init_eth
    user_init_db(context.db_pool, tx.hash, user_id);


    const receipt = await tx.wait();
    console.log('receipt is ', receipt);
    //write tx confirmation into table trans_init_eth
    update_ETH_TX_Status(context.db_pool, receipt, tx.hash);
}


export async function contract_transfer(context, sender, receiver, amount) {

    //get sender private
    let signer = new ethers.Wallet(sender[0].private, context.ethers_service.provider);
    let contractWithSigner = new ethers.Contract(context.ethers_service.CONTRACT_ID, myToken.abi, signer);

    //init tx
    try {
        const tx = await contractWithSigner.transfer(receiver[0].address, amount);
        ////write tx into table trans
        tx_db(context.db_pool, tx.hash, amount, sender[0].user_id);
        return tx;
    } catch (error) {
        console.log(error);
    }

    const receipt = await tx.wait();
    console.log('receipt is ', receipt);
    //write tx confirmation into table trans_init_eth
    updateTXStatus(context.db_pool, receipt, tx.hash);
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

/*
export async function contract_transfer(signer, res, req, dbRes, receiver) {
    let contractWithSigner = new ethers.Contract(CONTRACT_ID, Contract.abi, signer);
    try {
        const tx = await contractWithSigner.transfer(receiver, req.body.amount);
        let availableBalance = (ethers.BigNumber.from(dbRes.rows[0].availbalance).sub(ethers.BigNumber.from(req.body.amount)))._hex;
        res.send(JSON.stringify({
        'transSubmitted': "success",
        'transHash': tx.hash,
        }));

        //write tx information into table TRANS_TEST
        pool.connect((err, client, done) => {
        if (err) {
            console.log('err is ', err);
        }

        client.query("INSERT INTO TRANS_TEST (TRANS_HASH, TRANS_STATUS, TRANS_AMOUNT, USER_ID) VALUES ($1::varchar, $2::int, $3::varchar, $4::int);",
            [tx.hash,
            2,
            req.body.amount,
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
        })

        const receipt = await tx.wait();
        // console.log('receipt is ', receipt);

        //write tx confirmation into table TRANS_TEST
        updateTXStatus(receipt, tx.hash);

    } catch (error) {
        console.log(error);
        res.send(JSON.stringify({
        'transSubmitted': "fail",
        'error reason': error.reason,
        'error code': error.code
        }));
    }
}
*/
export default load_ethers_service;