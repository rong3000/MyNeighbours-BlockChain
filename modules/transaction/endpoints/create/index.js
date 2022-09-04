import createService from './service';
import createRoute from './route';

const createEndpoint = (context) => {
    const service = createService();
    createRoute(context, service);
};

export default createEndpoint;