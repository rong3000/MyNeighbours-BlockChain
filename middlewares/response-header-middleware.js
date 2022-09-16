const use_response_header_middleware = (app) => {
    app.all('*', function (_req, res, next) {
        res.header('Access-Control-Allow-Origin', '*'); //当允许携带cookies此处的白名单不能写��
        res.header('Access-Control-Allow-Headers', 'content-type,Content-Length, Authorization,Origin,Accept,X-Requested-With'); //允许的请求头
        res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT'); //允许的请求方�
        // res.header('Access-Control-Allow-Credentials',true);  //允许携带cookies
        next();
    });
}

export default use_response_header_middleware;