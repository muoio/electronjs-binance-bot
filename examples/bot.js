const CryptoJS = require('crypto-js')
const axios = require('axios');            


var hostAPI = 'https://testnet.binancefuture.com'   
let apiKey = '';
let apiSecret = '';

function buy(){

    var instance = axios.create({
      baseURL: hostAPI,
      timeout: 1000,
      headers: {
        "Content-Type": "application/json",
        "X-MBX-APIKEY": apiKey
      }
    });

        const query_string = "symbol=BTCUSDT&side=BUY&type=MARKET&quantity=0.1&timestamp="+Date.now().toString();

        //const query_string = 'symbol='+symbolT+'&side='+sideT+'&type=MARKET'+'&quantity='+quantityT+'&timeInForce=GTC'+'&timestamp='+Date.now().toString();
        let signature = CryptoJS.HmacSHA256(query_string, apiSecret).toString();
        instance.post("/fapi/v1/order?"+query_string+'&signature='+signature)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
}
buy();
