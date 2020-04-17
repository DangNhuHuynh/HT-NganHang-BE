var config = {
    app: {
        appName: 'Internet Banking',
        baseUrl: '', //add refix dạng '/projectname'
        staticUrl: '',
        port: 80,
        secretKey: 'th@sBz$90k1sWVqP',
        refreshTokenSecret: 'IFw2Nv%XAKWKoF3H',
        proxy: '',
        clientUrl: 'http://localhost:9527'
    },
    recaptcha: {
        sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
        secretkey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
    },
    db: {
        host: 'cluster0-1kkrx.mongodb.net',
        port: '27017',
        name: 'internet_banking',
        username: 'admin',
        password: 'QZVANNf3WU42OPH8'
    },
    cors:{
        whitelist : ['https://localhost:3000', 'http://localhost:9527']
    }
};

module.exports = config;