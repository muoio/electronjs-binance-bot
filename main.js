const electron = require('electron');
const CryptoJS = require('crypto-js');
const WebSocket = require('ws');
const axios = require('axios');    
const client = require('./client.js');

const { Binance } = client;
var hostWss = "wss://stream.binancefuture.com";
let apiKey = 'd48075f8255c0031acc018dd6be75f8fe6fab02c2fc62502a7d87fac3f160433';
let apiSecret = '227a661ba00dda99e0fbf5ed2f124ae4e5cc9f5adeddc0fa65c6601f12770d9d';



const { app, BrowserWindow, ipcMain } = electron;
let mainWindow;
app.on('ready',()=>{
    console.log("app is now ready");
    mainWindow = new BrowserWindow({   
        webPreferences: {
            nodeIntegration: true,          
            contextIsolation: false,        
            enableRemoteModule: true,       
        },
    });
    mainWindow.loadFile("./renderer.html");
    var socket = new WebSocket(hostWss+'/ws/btcusdt@miniTicker');
    socket.onmessage = async (event) => {
        var data = JSON.parse(event.data);
        let current_price = parseFloat(data['c']);
        mainWindow.webContents.send("data:price", current_price);
    }
});

ipcMain.on("action:buy", async (event,symbo,amount) =>  {
    console.log("buy "+symbo+" with amount "+amount);
    let bot1 = new Binance(apiKey,apiSecret);
    await bot1.place_order(symbo,'BUY',"MARKET", amount);
});
