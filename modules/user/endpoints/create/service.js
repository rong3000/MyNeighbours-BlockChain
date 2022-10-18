const createService = () => (request, response) => {
    response.send(JSON.stringify({
        'trial': request.body.trial + 1
      }));
    
};

export default createService;