const electron = require('electron');
const CryptoJS = require('crypto-js');
const WebSocket = require('ws');
const fs = require('fs');


const axios = require('axios');    

var hostWss = "wss://stream.binancefuture.com";
let apiKey = 'd48075f8255c0031acc018dd6be75f8fe6fab02c2fc62502a7d87fac3f160433';
let apiSecret = '227a661ba00dda99e0fbf5ed2f124ae4e5cc9f5adeddc0fa65c6601f12770d9d';



const { app, BrowserWindow, ipcMain, dialog } = electron;
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
    mainWindow.webContents.on('did-finish-load', run);
});

async function run(){
    const client = require('./client.js');
    const { Binance, Strategy } = client;

    var socket = new WebSocket(hostWss+'/ws/btcusdt@miniTicker');
    socket.onmessage = async (event) => {
        var data = JSON.parse(event.data);
        let current_price = parseFloat(data['c']);
        mainWindow.webContents.send("data:price", current_price);
    }

    let bot1;//  = new Binance(apiKey,apiSecret);
    let bot2;//  = new Binance(apiKey,apiSecret);
    let strategy;

    load_data('data.json');
   
    ipcMain.on("bot1Login", async (event, apiKey1, apiSecret1) => {
        bot1 = new Binance(apiKey1,apiSecret1);
        if (await bot1.checkKey()){
            console.log('bot1Logined');
            mainWindow.webContents.send("bot1Logined");

            var data=fs.readFileSync("data.json", 'utf8');
            data=JSON.parse(data);
            data["apiKey1"] = apiKey1;
            data["apiSecret1"] = apiSecret1;
            fs.writeFileSync("data.json", JSON.stringify(data));
        }
        else{
            dialog.showMessageBox({message:"Wrong key"});
        }
    });

    ipcMain.on("action:start", async (event, amount) =>  {
        strategy =  new Strategy(bot1,bot2);
        console.log("buy  with amount "+amount);
        strategy.start();
    });
    ipcMain.on("action:stop", async (event) =>{
        strategy.stop();
    });

    ipcMain.on("center_price_change", (event, center_price) =>{
        var data=fs.readFileSync("data.json", 'utf8');
        data=JSON.parse(data);
        data["center_price"] = center_price;
        fs.writeFileSync("data.json", JSON.stringify(data));
    });

    ipcMain.on("gap_first_trade_change", (event,gap_first_trade) => {
        var data=fs.readFileSync("data.json", 'utf8');
        data=JSON.parse(data);
        data["gap_first_trade"] = gap_first_trade;
        fs.writeFileSync("data.json", JSON.stringify(data));
    });

    ipcMain.on("trades_gap_change", (event, trades_gap)=>{
        var data=fs.readFileSync("data.json", 'utf8');
        data=JSON.parse(data);
        data["trades_gap"] = trades_gap;
        fs.writeFileSync("data.json", JSON.stringify(data));  
    });

    ipcMain.on("take_profit_radius_change", (event,take_profit_radius)=>{
        var data=fs.readFileSync("data.json", 'utf8');
        data=JSON.parse(data);
        data["take_profit_radius"] = take_profit_radius;
        fs.writeFileSync("data.json", JSON.stringify(data));  
    }); 

    ipcMain.on("quantity_change", (event, quantity)=>{
        var data=fs.readFileSync("data.json", 'utf8');
        data=JSON.parse(data);
        data["quantity"] = quantity;
        fs.writeFileSync("data.json", JSON.stringify(data));  
    });

    async function load_data(filepath){
        var data=fs.readFileSync(filepath, 'utf8');
        data=JSON.parse(data);
        console.log(data);
        if (data.hasOwnProperty('apiKey1') && data.hasOwnProperty('apiSecret1')){
            bot1 = new Binance(data['apiKey1'],data['apiSecret1']);
            if (await bot1.checkKey()){
                console.log('bot1Logined');
                mainWindow.webContents.send("bot1Logined");
            }
        }

        
        if(data.hasOwnProperty('center_price'))
            mainWindow.webContents.send('center_price', data['center_price']);
        if (data.hasOwnProperty('gap_first_trade', data['gap_first_trade']))
            mainWindow.webContents.send('gap_first_trade',data['gap_first_trade']);
        if (data.hasOwnProperty('trades_gap'))
            mainWindow.webContents.send('trades_gap', data['trades_gap']);
        if (data.hasOwnProperty('quantity'))
            mainWindow.webContents.send('quantity', data['quantity']);
        if (data.hasOwnProperty('take_profit_radius'))
            mainWindow.webContents.send('take_profit_radius', data['take_profit_radius']);
        /*if (data.hasOwnProperty('slippage'))
            mainWindow.webContents.send('slippage', data['slippage']);
        if (data.hasOwnProperty('futureMode'))
            mainWindow.webContents.send('futureMode', data['futureMode']);*/
    }
}



