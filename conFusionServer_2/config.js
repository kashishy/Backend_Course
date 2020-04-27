//used to strore configuration information for our server
module.exports = {

    //secret for signing json web token
    'secretKey' : '12345-67890-09876-54321',
    //url for mongodb server
    'mongoUrl' : 'mongodb://localhost:27017/conFusion',
    //for facebook authenticayion
    'facebook': {
        clientId: 'Inter ID From Facebook App',
        clientSecret: 'Get from facebook app development'
    }
}
