const electron = require('electron');


const net = electron.remote.net;


/*
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
});*/
function test(){
    let apiKey = "d48075f8255c0031acc018dd6be75f8fe6fab02c2fc62502a7d87fac3f160433";
    let apiSecret = "227a661ba00dda99e0fbf5ed2f124ae4e5cc9f5adeddc0fa65c6601f12770d9d";
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
      if(this.readyState === 4) {
        console.log(this.responseText);
      }
    });

    xhr.open("POST", "%7B%7Burl%7D%7D/fapi/v1/order?symbol=&side=&type=&quantity=&price=&timestamp=%7B%7Btimestamp%7D%7D&signature=%7B%7Bsignature%7D%7D");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-MBX-APIKEY", apiKey);

    xhr.send();
}
/*
function buy(){
    let host = "https://testnet.binancefuture.com";
    let apiKey = "d48075f8255c0031acc018dd6be75f8fe6fab02c2fc62502a7d87fac3f160433";
    let apiSecret = "227a661ba00dda99e0fbf5ed2f124ae4e5cc9f5adeddc0fa65c6601f12770d9d";

    let timestamp = (new Date()).getTime().toString();
    let query = "/dapi/v1/order?symbol=&side=&type=MARKET&quantity=0.001&timestamp="+timestamp;
    let signature = CryptoJS.HmacSHA256(query, apiSecret).toString();
    var settings = {
        "url": host+query+"&signature="+signature,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json",
            "X-MBX-APIKEY": apiKey
        },
    };

    $.ajax(settings).done(function (response) {
    console.log(response);
    });
}*/
test();
/*
ipcMain.on("action:buy", (event,symbo,amount)=>{
    console.log("buy "+symbo+" with amount "+amount);
    buy();
});*/
