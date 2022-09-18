import { authorize } from '../../../../services/cognito-service';

const createRoute = (context, service) => {
    context.route.get('/users/:userId', [authorize(context.cognito_express)], async (request, response) => await service(context, request, response),);
};

export default createRoute;