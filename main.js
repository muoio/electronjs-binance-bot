const electron = require('electron');
const CryptoJS = require('crypto-js');

const axios = require('axios');    

var hostAPI = 'https://testnet.binancefuture.com'   
let apiKey = 'd48075f8255c0031acc018dd6be75f8fe6fab02c2fc62502a7d87fac3f160433';
let apiSecret = '227a661ba00dda99e0fbf5ed2f124ae4e5cc9f5adeddc0fa65c6601f12770d9d';
var instance = axios.create({
    baseURL: hostAPI,
    headers: {
    "Content-Type": "application/json",
    "X-MBX-APIKEY": apiKey
    }
});

function buy(){
        const query_string = "symbol=BTCUSDT&side=SELL&type=MARKET&quantity=0.5&timestamp="+Date.now().toString();
        let signature = CryptoJS.HmacSHA256(query_string, apiSecret).toString();
        instance.post("/fapi/v1/order?"+query_string+'&signature='+signature)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
}

const { app, BrowserWindow, ipcMain } = electron;
app.on('ready',()=>{
    console.log("app is now ready");
    const mainWindow = new BrowserWindow({   
        webPreferences: {
            nodeIntegration: true,          
            contextIsolation: false,        
            enableRemoteModule: true,       
        },
    });
    mainWindow.loadFile("./renderer.html");
});

ipcMain.on("action:buy", (event,symbo,amount)=>{
    console.log("buy "+symbo+" with amount "+amount);
    buy();
});
