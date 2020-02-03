var configdev = {
    app: {
        appName: 'Internet Banking',
        baseUrl: '', //add refix dạng '/projectname'
        staticUrl: '',
        port: 3000,
        secretKey: 'th@sBz$90k1sWVqP',
        refreshTokenSecret: 'IFw2Nv%XAKWKoF3H',
        proxy: ''
    },
    recaptcha: {
        sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
        secretkey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
    },
    db: {
        host: '127.0.0.1',
        port: '27017',
        name: 'internet_banking',
        username: '',
        password: ''
    },
    cors:{
        whitelist : ['https://localhost:3000']
    }
};

module.exports = configdev;