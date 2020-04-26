//used to strore configuration information for our server
module.exports = {

    //secret for signing json web token
    'secretKey' : '12345-67890-09876-54321',
    //url for mongodb server
    'mongoUrl' : 'mongodb://localhost:27017/conFusion',
    //for facebook authenticayion
    'facebook': {
        clientId: '3198344800228056',
        clientSecret: '988f2fa990652f5146e441c4e839ce7a'
    }
}