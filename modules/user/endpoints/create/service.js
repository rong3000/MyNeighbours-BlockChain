import { get_user_by_id } from '../../../../services/database-service';
import { create_user } from '../../../../services/database-service';
import ethers from 'ethers';
import {user_init_chain} from '../../../../services/ethers-service';

const createService = () => async (context, request, response) => {
  const ssoUserId = response.locals.user.sub;

  if (!ssoUserId) {
    response.send(404, 
      JSON.stringify({
      errorCode: 0,
      errorMessage: "SSO user id is not provided",
      errorDetail: "SSO user id is not provided"
    }));
    return;
  }

  const results = await get_user_by_id(context.knex, ssoUserId);

  if (!results || results.length === 0) {
    console.log(`User with id ${ssoUserId} to be created`);

    //create new user wallet address
    let randomWallet = ethers.Wallet.createRandom();

    const results = await create_user(context.knex, randomWallet.address, randomWallet.privateKey, ssoUserId);

    if (results.error) {
      response.send(404, 
        JSON.stringify({
        errorCode: results.result.code,
        errorMessage: results.result.message,
        errorDetail: results.result.detail
      }));
    } 
    else if (results.result.length > 0) {
      user_init_chain(context, ssoUserId, randomWallet.address);

      //return new user basic info back to frontend first with create suscessful infor
      response.send(200, 
        JSON.stringify({
        userCreated: results.result.rowCount,
        id: ssoUserId,
        address: randomWallet.address,
        balance: '0',
        availBalance: '0'
      }));
    }
  }
  else {
    response.send(404, `User with id ${response.locals.user.sub} already exists`);
  }
};

export default createService;