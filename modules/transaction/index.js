import load_endpoints from '../../common/endpoint-loader';

const createModule = async (moduleDirectory, context) => {
    await load_endpoints(moduleDirectory, context);
};

export default createModule;