import ethers from 'ethers';
import myToken from './MyToken.json' assert {type: "json"};

const load_ethers_service = () => {

    const CONTRACT_ID = process.env.BLOCK_CHAIN_CONTRACT_ID; //to be changed after every contract deployed
    const url = process.env.BLOCK_CHAIN_SERVER_URL;
    const provider = new ethers.providers.JsonRpcProvider(url);//chain specific
    let contract = new ethers.Contract(CONTRACT_ID, myToken.abi, provider);
    return contract;
}

export const get_chainBal_by_address = async (contract, address) => {
    const chainBal = await contract.balanceOf(address);
    return chainBal;
}

export async function check_availability(user, res) {
    try {
        let b = [];

        let pendingAmount = ethers.BigNumber.from('0x0');
        let avail = ethers.BigNumber.from('0x0');

        const chainBal = await contract.balanceOf(dbRes.rows[0].address);

        for (row in dbRes.rows) {
            let a =
            {
                'trans_hash': dbRes.rows[row].trans_hash,
                'trans_status': dbRes.rows[row].trans_status,
                'trans_amount': dbRes.rows[row].trans_amount
            }
            b.push(a);
            // console.log(dbRes.rows[row].trans_hash);
            // console.log(dbRes.rows[row].trans_status);
            if (dbRes.rows[row].trans_hash != null) {
                if (dbRes.rows[row].trans_status != 0 && dbRes.rows[row].trans_status != 1) {

                let txReceipt = await provider.getTransactionReceipt(dbRes.rows[row].trans_hash);
                if (txReceipt == null) {
                    pendingAmount = pendingAmount.add(ethers.BigNumber.from(dbRes.rows[row].trans_amount))
                }
                if (txReceipt.status == 0 || txReceipt.status == 1) {
                    console.log('mark');
                    updateTXStatus(txReceipt, dbRes.rows[row].trans_hash);
                    
                }
                }
            }
        }

        avail = chainBal.sub(pendingAmount);

        res.send(JSON.stringify({
            'username': dbRes.rows[0].username,
            'address': dbRes.rows[0].address,
            'balance': chainBal._hex,
            'available balance': avail._hex,
            'trans': b
        }));

        return true;

    } catch (error) {
        console.log(error);
        res.send(JSON.stringify({
            'transSubmitted': "fail",
            'error reason': error.reason,
            'error code': error.code
        }));

        return false;
    }
}

export async function initialise_user(dbRes, adminPrivate, userAddress) {
    let signer = new ethers.Wallet(adminPrivate, provider);
    const tx = await signer.sendTransaction({
        to: userAddress,
        value: ethers.utils.parseEther("0.01")
    });

    //write tx information into table TRANS_TEST
    pool.connect((err, client, done) => {
        if (err) {
        console.log('err is ', err);
        }

        client.query("INSERT INTO TRANS_TEST (TRANS_HASH, TRANS_STATUS, TRANS_AMOUNT, USER_ID) VALUES ($1::varchar, $2::int, $3::varchar, $4::int);",
        [tx.hash,
            2,
            "0x2386F26FC10000",
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
    });

    const receipt = await tx.wait();
    //write tx confirmation into table TRANS_TEST
    updateTXStatus(receipt, tx.hash);
}

export async function check_before_transfer(dbResInFunc, res, req, receiver) {
    try {
        let pendingAmount = ethers.BigNumber.from('0x0');;
        let avail = ethers.BigNumber.from('0x0');

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



        avail = chainBal.sub(pendingAmount);

        if (avail.lt(ethers.BigNumber.from(req.body.amount))) {

        res.send(JSON.stringify({
            'sender': res.locals.user.username,
            'balance': chainBal._hex,
            'available balance': avail._hex,
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

export default load_ethers_service;