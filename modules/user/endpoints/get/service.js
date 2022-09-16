const createService = () => (request, response) => {
    response.send('hello get users');
};

export default createService;