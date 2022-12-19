import load_dotenv_service from './services/dotenv-service';
import load_cognito_service from './services/cognito-service';
import load_ethers_service from './services/ethers-service';
import load_logger_service from './services/logger-service';

import use_response_header_middleware from './middlewares/response-header-middleware';
import use_global_error_handler_middleware,  { loadProcessErrorProcessors } from './middlewares/global-error-handler-middleware';

import express from 'express';

import { resolve, join } from 'path';
import load_modules from './common/module-loader';
import load_database_service from './services/database-service';
import https from 'https';
import fs from 'fs';

load_dotenv_service();
const logger = load_logger_service();

loadProcessErrorProcessors(logger);

const cognito_express = load_cognito_service();
const ethers_service = load_ethers_service();
const knex = await load_database_service();

const app = express().set('port', process.env.PORT || 3000);
let route = express.Router();

use_response_header_middleware(app);
app.use(express.json());
app.use("/", route);
use_global_error_handler_middleware(app);

const context = {
  cognito_express,
  ethers_service,
  knex,
  route,
  logger
}

const ROOT_DIRECTORY = resolve('./');
await load_modules(join(ROOT_DIRECTORY, 'modules'), context);

route.get("/health-check", function (req, res, next) {
  res.send('Service is running');
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
})

if (process.env.NODE_ENV === 'development') {
  const options = {
    key: fs.readFileSync("./certs/localhost.key"),
    cert: fs.readFileSync("./certs/localhost.crt"),
  };

  https.createServer(options, app).listen(process.env.HTTPS_PORT || 3001, () => {
    console.log('HTTPS server started on port', process.env.HTTPS_PORT || 3001);
  });
}

