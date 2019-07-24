// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
const io = require('./socket.io');
const bcxConfig = {
    default_ws_node: "ws://47.93.62.96:8049",
    ws_node_list: [{
            url: "ws://39.106.126.54:8049",
            name: "COCOS3.0节点2"
        },
        {
            url: "ws://47.93.62.96:8049",
            name: "COCOS3.0节点1"
        }
    ],
    networks: [{
        core_asset: "COCOS",
        chain_id: "7d89b84f22af0b150780a2b121aa6c715b19261c8b7fe0fda3a564574ed7d3e9"
    }],
    faucet_url: "http://47.93.62.96:8041",
    auto_reconnect: true,
    check_cached_nodes_data: false
};


cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.game.addPersistRootNode(this.node);

        
        const bcx = new BCX(bcxConfig);
        bcx.init().then(res=>{
            if (1 != res.code) {
                console.log("ERR, BCX connect failed:" + res.code);
            } else {
                console.log("SUC, BCX connected");
            }
        });

        // var mySocket = io.connect('http://localhost:10800');
        
        var mySocket = io.connect('http://sh.suishizhuan.com:10800');

        window.mySocket = mySocket;
        mySocket.on('connect', function () {
            cc.director.emit('socketConnect', "connect");
            console.log("连接成功");
        });
        mySocket.on('disconnect', function () {
            cc.director.emit('socketConnect', "disconnect");
            console.log("连接断开");
            mySocket.open();
        });


    },

    start() {

    },

    // update (dt) {},
});