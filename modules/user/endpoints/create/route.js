import { authorize } from '../../../../services/cognito-service';

const createRoute = (context, service) => {
    context.route.post('/create', [authorize(context.cognito_express)], service);
};

export default createRoute;