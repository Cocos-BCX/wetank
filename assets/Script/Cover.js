// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        connectStatusTxt: {
            default: null,
            type: cc.Label,
            displayName: '链接状态',
        },
        testDes: {
            default: null,
            type: cc.Node,
            displayName: '测试删除',
        },
        userNameEdit: {
            default: null,
            type: cc.EditBox,
            displayName: '玩家名字',
        },
        userBalanceTxt: {
            default: null,
            type: cc.Label,
            displayName: '玩家余额',
        },

        _currentSkin: {
            default: null,
        },
        _skinList: {
            default: null,
        },
        _totalCheckTime: 0,
        _lastCheckTime: 0,

    },


    onTankChange(pageView, eventType) {
        var inx = pageView.getCurrentPageIndex();
        this._currentSkin = this._skinList[inx];
        console.log(this._currentSkin);
    },
    onClick() {
        var that = this;
        var userName = this.userNameEdit.string;
        if (userName.length > 0) {
            console.log(userName);
            var mySocket = window.mySocket;
            var gameUser = {
                userName: userName,
                roomName: 'free',
                skin: that._currentSkin,
            };
            var bcx = window.BcxWeb;
            mySocket.emit('preJoinRoom', gameUser, function (roomInfo) {
                console.log(roomInfo);
            });
        } else {
            console.log("username is null");
        }
    },
    onLoginClick() {
        // 
        // this.goFullScreen();
        var bcx = window.cocosbcx;
        bcx.passwordLogin({
            account: "liyunhan1111", //query.loginUserName,
            password: "Play12$$"
        }).then(res => {
            if (1 != res.code) {
                console.log("ERR, passwordLogin:" + res.code);
            } else {
                const data = res.data;
                console.log("SUC, passwordLogin");
                console.log(data.account_id + " " + data.account_name);
            }
        });
    },
    onTestClick() {
        // 
        // this.goFullScreen();
        var bcx = window.BcxWeb;
        // bcx.getAccountInfo().then(res=>{
        //     console.log(res);
        // });
        bcx.queryAccountOperations({
            account: 'liyunhan1111',
            limit: '100',
            startId: '1.11.385596',
            // endId:'',
        }).then(res => {
            console.log(res);
        });
    },

    onCocosPreJoin() {
        var that = this;
        var userName = this.userNameEdit.string;
        if (userName.length > 0) {
            console.log(userName);
            var mySocket = window.mySocket;
            var gameUser = {
                userName: userName,
                roomName: 'cocos',
                skin: that._currentSkin,
            };
            var bcx = window.BcxWeb;
            mySocket.emit('preJoinRoom', gameUser, function (roomInfo) {
                if (roomInfo && roomInfo.success == true) {
                    if (roomInfo.data.validate != 1) {
                        let gameContract = roomInfo.data.gameContract;
                        let tokenCode = roomInfo.data.tokenCode;
                        let tokenAmount = roomInfo.data.tokenAmount;
                        let memo = roomInfo.data.memo;
                        window.BcxWeb.transferAsset({
                            proposeAccount: userName,
                            toAccount: gameContract,
                            amount: tokenAmount,
                            assetId: tokenCode,
                            memo: memo,
                            feeAssetId: tokenCode,
                            isPropose: false,
                            onlyGetFee: false
                        }).then(res => {
                            if (1 != res.code) {
                                console.log("ERR, transferAsset:" + res.code);
                            } else {
                                const data = res.data;
                                console.log("SUC, transferAsset");
                            }
                        });
                    }
                }
                console.log(roomInfo);
            });
        } else {
            console.log("username is null");
        }
    },
    onEosPreJoin() {
        console.log('eos');
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._currentSkin = "sma";
        this._skinList = ['sma', 'smb', 'smc', 'mda', 'mdb', 'mdc', 'hva', 'hvb', 'hvc'];
        let that = this;
        that.connectStatusTxt.node.active = true;
        cc.director.on("socketConnect", function (state) {
            if (state == 'connect') {
                if (that.connectStatusTxt) {
                    that.connectStatusTxt.string = "";
                }
                var mySocket = window.mySocket;
                mySocket.on('allowJoin', function (roomInfo) {
                    console.log("allowJoin");
                    if (roomInfo && roomInfo.success) {
                        var gameUser = {
                            userName: roomInfo.data.userName,
                            roomName: roomInfo.data.roomName,
                            skin: roomInfo.data.tankSkin,
                        };
                        console.log(gameUser);
                        mySocket.emit('joinRoom', gameUser, function (retMsg) {
                            console.log(retMsg);
                            window.myUserName = gameUser.userName;
                            cc.director.loadScene('game');
                        });
                    }
                });
            }
            if (state == 'disconnect') {
                if (that.connectStatusTxt) {
                    that.connectStatusTxt.string = "Connecting";
                }
            }
        });
    },

    start() {

    },
    update(dt) {
        this._totalCheckTime += dt;
        if (this._totalCheckTime - this._lastCheckTime > 3) {
            this.loopGetBcx();
            this._lastCheckTime = this._totalCheckTime;
        }
    },
    loopGetBcx() {
        var that = this;
        var bcx = window.BcxWeb;
        if (bcx) {
            bcx.getAccountInfo().then(account => {
                if (account) {
                    let userName = account.account_name;
                    if (userName && userName != "") {
                        this.userNameEdit.string = userName;
                        bcx.queryAccountBalances({
                            assetId: 'COCOS',
                            account: userName,
                        }).then(balance => {
                            let amount = balance.data["COCOS"];
                            that.userBalanceTxt.string = amount + " COCOS";
                            // console.log(balance);
                        });

                    }
                }

            });
        }
    },
    goFullScreen() {
        let element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            // IE11
            element.msRequestFullscreen();
        }
    },

});