
    var hostAPI = 'https://testnet.binancefuture.com';//'https://fapi.binance.com';//
    var hostWss = 'wss://fstream.binance.com';//"wss://stream.binancefuture.com";

    center_price_element = document.getElementById("center_price");
    first_trade_gap = document.getElementById("first_trade_gap");
    take_profit_radius = document.getElementById("take_profit_radius");
    quantity = document.getElementById("quantity");

    trades_gap_element = document.getElementById("trades_gap");
    class GUI{
        get trade_gap(){
            return parseFloat(trades_gap_element.value);
        }
        get center_price(){
            return parseFloat(center_price_element.value);
        }
        get first_trade_gap(){
            return parseFloat(first_trade_gap.value)
        }
        set center_price(valueT){
            center_price_element.value = valueT;
        }
        get quantity(){
            return parseFloat(quantity.value);
        }
        get take_profit_radius(){
            return parseFloat(take_profit_radius.value);
        }
        get current_price(){
            return parseFloat(btcPrice.innerText);
        }
        set current_price(value){
            btcPrice.innerText = value;
        }
        get onBot(){
            if (stop_bot.style.display != 'none')
                return true;
            else return false;
        }
        get symbol(){
            return 'BTCUSDT';
        }
    }

    class Client{
        constructor(apiKey, apiSecret, guiBot){
            this.apiKey = apiKey;
            this.apiSecret = apiSecret;
            this.guiBot = guiBot;
            this.open_position = [];
            this.state = 0;
            //this.trailing_trade;
            this.main_trade;
            console.log(this.apiKey);
            this.myHeaders = new Headers();
            this.myHeaders.append( "Content-Type", "application/json");
            this.myHeaders.append("X-MBX-APIKEY", this.apiKey);
        }
        async place_order(symbolT, sideT, quantityT, priceT, typeT){
            var requestOptions = {
                method: 'POST',
                headers: this.myHeaders,
                redirect: 'follow'
            };
            const query_string = 'symbol='+symbolT+'&price='+priceT+'&side='+sideT+'&type='+typeT+'&quantity='+quantityT+'&timeInForce=GTC'+'&timestamp='+Date.now().toString();
            let signature = CryptoJS.HmacSHA256(query_string, this.apiSecret).toString();
            try{
                var order_info =  await fetch(hostAPI + "/fapi/v1/order?"+query_string+'&signature='+signature, requestOptions);
                let order_info_json = await position_closer.json();
                return order_info_json;
            }catch{
                alert("Cannot place order");
            }
        }
        async place_position(symbolT, sideT, quantityT){
            var requestOptions = {
                method: 'POST',
                headers: this.myHeaders,
                redirect: 'follow'
            };
            const query_string = "symbol=BTCUSDT&side=BUY&type=MARKET&quantity=0.1&timestamp="+Date.now().toString();

            //const query_string = 'symbol='+symbolT+'&side='+sideT+'&type=MARKET'+'&quantity='+quantityT+'&timeInForce=GTC'+'&timestamp='+Date.now().toString();
            let signature = CryptoJS.HmacSHA256(query_string, this.apiSecret).toString();
            /*try{
                var order_info =  await fetch(hostAPI + "/fapi/v1/order?"+query_string+'&signature='+signature, requestOptions);
                let order_info_json = await order_info.json();
                return order_info_json;
            }catch{
                alert("Cannot place order");
            }*/
            var settings = {
                "url": hostAPI + "/fapi/v1/order?"+query_string+'&signature='+signature,
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json",
                    "X-MBX-APIKEY": "d48075f8255c0031acc018dd6be75f8fe6fab02c2fc62502a7d87fac3f160433"
                  },
              };
            console.log("Place position");  
            console.log(this.apiSecret);
            $.ajax(settings).done(function (response) {
                console.log("HEHEE"+response);
              });
        }

        async account_stream(){
            function search_balance(event_data, asset='USDT'){
                let balances = event_data['a']['B'];
                for (let balance of balances)
                    if(balance['a']==asset)
                        return balance['wb'];
            }
            this.guiBot.balance = await this.get_balance();
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
        }
        async get_balances(){
            const query_string =  'timestamp=' + Date.now().toString()
            let signature = CryptoJS.HmacSHA256(query_string, this.apiSecret).toString();
            var requestOptions = {
              method: 'GET',
              headers: this.myHeaders,
              redirect: 'follow'
            };
            var balances = await fetch(hostAPI+"/fapi/v2/account?"+query_string+'&signature='+signature, requestOptions);
            return balances.json();
        }
        async get_balance(asset_symbol='USDT'){
            let balances = await this.get_balances();
            console.log(balances);
            for (let asset of balances.assets)
                if (asset.asset == asset_symbol)
                    return asset.walletBalance;
            return 0;
        }
        async get_order_info(orderT){
            var requestOptions = {
                method: 'GET',
                headers: this.myHeaders,
                redirect: 'follow'
            };
            try{
                const query_string = 'symbol='+orderT["symbol"]+'&orderId='+orderT["orderId"]+'&timeInForce=GTC'+'&timestamp='+Date.now().toString();
                let signature = CryptoJS.HmacSHA256(query_string, this.apiSecret).toString();
                var order_info =  await fetch(hostAPI + "/fapi/v1/order?"+query_string+'&signature='+signature, requestOptions);
                let order_info_json = await order_info.json();
                return order_info_json;
            }catch{
                alert("Cannot get info of position");
            }
        }
        async update_trailing_trade(sideT){
            this.trailing_trade = await get_order_info(this.trailing_trade);
            if (sideT == 'SELL'&& this.trailing_trade_price > gui.current_price + gui.trade_gap){
                this.close_trade(this.trailing_trade);
                this.trailing_trade = this.place_order(gui.symbol,sideT,gui.quantityT,gui.current_price-gui.trade_gap,'LIMIT');
            }
            else if(sideT=='BUY'&&this.trailing_trade < gui.current_price - gui.trade_gap){
                this.close_trade(this.trailing_trade);
                this.trailing_trade = this.place_order(gui.symbol,sideT,gui.quantityT,gui.current_price+gui.trade_gap,'LIMIT');
            }
        }
        async close_position(position){
            var requestOptions = {
                method: 'POST',
                headers: this.myHeaders,
                redirect: 'follow'
            };
            let symbolT = position["symbol"];
            let op_side = position["side"] == 'SELL' ? 'BUY':'SELL';
            let typeT = position["type"];
            let quantityT = position["origQty"];
            const query_string = 'symbol='+symbolT+'&side='+op_side+'&type='+typeT+'&quantity='+quantityT+'&timeInForce=GTC'+'&timestamp='+Date.now().toString();
            let signature = CryptoJS.HmacSHA256(query_string, this.apiSecret).toString();
            try{
                var position_closer =  await fetch(hostAPI + "/fapi/v1/order?"+query_string+'&signature='+signature, requestOptions);
                let position_closer_json = await position_closer.json();
                return position_closer_json;
            }catch{
                alert("Cannot close position");
            }
        }

        async cancel_order(order){
            var requestOptions = {
                method: 'DELETE',
                headers: this.myHeaders,
                redirect: 'follow'
            };
            const query_string = 'symbol='+order["symbol"]+'&orderId='+order["orderId"]+'&timeInForce=GTC'+'&timestamp='+Date.now().toString();
            let signature = CryptoJS.HmacSHA256(query_string, this.apiSecret).toString();
            try{
                var cancel_order_info =  await fetch(hostAPI + "/fapi/v1/order?"+query_string+'&signature='+signature, requestOptions);
                let cancel_order_info_json = await position_closer.json();
                return cancel_order_info_json;
            }catch{
                alert("Cannot cancel order");
            }
        }

        async close_trade(trade){
            let trade_info = await get_order_info(trade);
            if (trade_info["status"] == "FILLED")
                await this.close_position(trade_info);
            else this.cancel_order(trade);
        }
        async close_all_trades(){
            //await close_trade(this.trailing_trade);
            await close_trade(this.main_trade);
        }
        get main_trade_price(){
            return parseFloat(this.main_trade["price"]);
        }
        get trailing_trade_price(){
            return parseFloat(this.trailing_trade["price"]);
        }
        async get_new_listenKey(){
            var requestOptions = {
              method: 'POST',
              headers: this.myHeaders,
              redirect: 'follow'
            }
            let new_listen_key = await fetch(hostAPI+'/fapi/v1/listenKey', requestOptions);
            return new_listen_key.json();
        }
        async renew_listenKey(){
            var requestOptions = {
              method: 'PUT',
              headers: this.myHeaders,
              redirect: 'follow'
            }
            fetch(hostAPI + '/fapi/v1/listenKey', requestOptions);
        } 
    }
    class GUI_bot{
        constructor(balance_element,status_element,main_trade_element, trailing_trade_element){
            this.balance_element = balance_element;
            this.status_element = status_element;
            this.main_trade_element = main_trade_element;
            this.trailing_trade_element = trailing_trade_element;
        }
        set state(stateT){
            this.status_element.innerText = stateT;
        }
        set balance(balanceT){
            console.log("set came here")
            this.balance_element.innerText = balanceT;
        }
        set trailing_trade(trailing_trade){
            this.trailing_trade_element.innerText = trailing_trade["symbol"] + trailing_trade["side"]+ trailing_trade["quantity"];
        }
        set main_trade(main_trade){
            this.main_trade_element.innerText = main_trade["symbol"] + main_trade["side"] +main_trade["quantity"];
        }
    }