import dotenv from 'dotenv';

const load_dotenv_service = () => {  
    const environment = process.env.NODE_ENV || 'development';
    const dotenvPath = '.env.' + environment;
    dotenv.config({path: dotenvPath, debug: true});
}

export default load_dotenv_service;