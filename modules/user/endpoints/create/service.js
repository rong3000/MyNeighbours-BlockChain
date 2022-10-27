import { get_user_by_id } from '../../../../services/database-service';
import { create_user } from '../../../../services/database-service';
import ethers from 'ethers';
import { user_init_chain } from '../../../../services/ethers-service';

// import { get_available_balance } from '../../../../services/ethers-service';

const createService = () => async (context, request, response) => {
  const results = await get_user_by_id(context.db_pool, response.locals.user.sub);

  if (!results || results.length === 0) {
    console.log(`User with id ${response.locals.user.sub} to be created`);

    //create new user wallet address
    let randomWallet = ethers.Wallet.createRandom();

    const results = await create_user(context.db_pool, randomWallet.address, randomWallet.privateKey, response.locals.user.sub);

    
    if (results.error) {
      response.send(404, 
        JSON.stringify({
        errorCode: results.result.code,
        errorMessage: results.result.message,
        errorDetail: results.result.detail
      }));
    } else if (results.result.rowCount > 0) {
      //return new user basic info back to frontend first with create suscessful infor
      response.send(200, 
        JSON.stringify({
        userCreated: results.result.rowCount,
        id: response.locals.user.sub,
        address: randomWallet.address,
        balance: '0x0',
        availbalance: '0x0'
      }));

      //initialize user account by sending them some eth
      user_init_chain(context, response.locals.user.sub, randomWallet.address);
      
    }
    //ref
    /*
    pool.connect((err, client, done) => {
      if (err) throw err

      client.query("INSERT INTO userwallet5 (username, address, private, balance, availbalance) VALUES ($1::varchar, $2::varchar, $3::varchar, $4::varchar, $5::varchar);",
        [res.locals.user.username,
        randomWallet.address,
        randomWallet.privateKey,
          '0x0',
          '0x0'
        ], (err, res) => {
          done()
          if (err) {
            console.log(err.stack);
          } else {
            console.log('inserted without error', res.command, ' ', res.rowCount);
          }
        })
    })
    */





  }
  else {
    //     let {chainBal, availBal} = await get_available_balance(context.ethers_service, results);
    //     const user = {
    //         id: results[0].user_id,
    //         address: results[0].address,
    //         balance: chainBal._hex,
    //         availBal: availBal._hex,
    //         transactions: results[0].transactionId ? results.map((result) => ({
    //             id: result.transactionId,
    //             hash: result.transactionHash,
    //             status: result.transactionStatus,
    //             amount: result.transactionAmount
    //         })): [],
    //     };

    //     response.send(JSON.stringify(user));
    response.send(404, `User with id ${response.locals.user.sub} already exists`);
  }
};

export default createService;