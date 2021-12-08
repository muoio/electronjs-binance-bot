const axios = require('axios');   
const WebSocket = require('ws'); 
const CryptoJS = require('crypto-js');

var hostAPI = 'https://testnet.binancefuture.com';
var hostWss = "wss://stream.binancefuture.com";

class Binance{
  constructor(apiKey, apiSecret){
    this.apiSecret = apiSecret;
    this.request = axios.create({
      baseURL: hostAPI,
      headers: {
      "Content-Type": "application/json",
      "X-MBX-APIKEY": apiKey
      }
    });
    this.mainTrade;
    this.tailTrade;
  }
/*
  async account_stream(){
    function search_balance(event_data, asset='USDT'){
        let balances = event_data['a']['B'];
        for (let balance of balances)
            if(balance['a']==asset)
                return balance['wb'];
    }
    let new_listenKey = await this.get_new_listenKey();
    console.log(new_listenKey['listenKey']);
    let account_socket = new WebSocket(hostWss + '/ws/'+new_listenKey['listenKey']);
    account_socket.onmessage = async (event) => {
        var data = JSON.parse(event.data);
        console.log(data);
        if (data['e'] == 'listenKeyExpired')
          this.renew_listenKey();
        else if (data['e'] == 'ACCOUNT_UPDATE'){
            let balance_USDT = search_balance(data);
            this.guiBot.balance = balance_USDT;
        }
        else if(data['e'] == 'ORDER_TRADE_UPDATE'){
          //this.trailing_trade = this.get_order_info(this.trailing_trade);
          this.main_trade = this.get_order_info(this.main_trade);
          if (this.main_trade["status"] == "FILLED" && this.trailing_trade[""])
          //this.guiBot.trailing_trade = this.trailing_trade;
          this.guiBot.main_trade = this.main_trade;
        }
    }
  }*/

  async get_new_listenKey(){
    let new_listen_key = await this.request.post(hostAPI+'/fapi/v1/listenKey');
    return new_listen_key.json();
  }
  async renew_listenKey(){
    await this.request.put(hostAPI + '/fapi/v1/listenKey');
  }

  async place_order(sym, side, type, quantity){
        const query_string = "symbol="+sym+'&side='+side+'&type='+type+'&quantity='+quantity+"&timestamp="+Date.now().toString();
        let signature = CryptoJS.HmacSHA256(query_string, this.apiSecret).toString();
      try{
        let order = await this.request.post(hostAPI+"/fapi/v1/order?"+query_string+'&signature='+signature)
        console.log(order);
        return order.data;
      }
      catch(error){
        console.log(error);
      }
  }
  async buy(quantity){
    return this.place_order('BTCUSDT','BUY','MARKET', quantity);
  }
  async sell(quantity){
    return this.place_order('BTCUSDT', 'SELL', 'MARKET', quantity);
  }
  async close_position(position){
    let symbolT = position["symbol"];
    let op_side = position["side"] == 'SELL' ? 'BUY':'SELL';
    let typeT = position["type"];
    let quantityT = position["origQty"];
    return this.place_order(symbolT,op_side,typeT,quantityT);
  }
}

class Strategy{
  constructor(b1, b2){
    this.bot1 = b1;
    this.bot2 = b2;
  }
  async start(){
    this.bot1.mainTrade = await this.bot1.buy(0.001);
  }
  async stop(){
    await this.bot1.close_position(this.bot1.mainTrade);
  }
}

module.exports = { Binance, Strategy }