// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
const NailTank = require('../widget/tank/base/NailTank');
const BaseBullet = require('../widget/tank/base/BaseBullet');
const BaseTank = require('../widget/tank/tank/BaseTank');
const Ring = require('../widget/joystick/ring');

cc.Class({
    extends: cc.Component,

    properties: {
        connectStatusTxt: {
            default: null,
            type: cc.Label,
            displayName: '链接状态',
        },
        uiCanvas: {
            default: null,
            type: cc.Canvas,
            displayName: 'UI Canvas',
        },
        gameBg: {
            default: null,
            type: cc.Node,
            displayName: '游戏场景父节点',
        },
        gameMap: {
            default: null,
            type: cc.Node,
            displayName: '游戏地图',
        },
        gameSmallMap: {
            default: null,
            type: cc.Node,
            displayName: '游戏小地图',
        },
        aimBoomAnim: {
            default: null,
            type: cc.Animation,
            displayName: '瞄准目标动画',
        },
        playerCamera: {
            default: null,
            type: cc.Node,
            displayName: '跟随玩家的摄像机',
        },
        joyStickMove: {
            default: null,
            type: Ring,
            displayName: '运动摇杆',
        },

        nailTankPrefab: {
            default: null,
            type: cc.Prefab,
            displayName: '预制缩略坦克',
        },
        bulletPrefab: {
            default: null,
            type: cc.Prefab,
            displayName: '预制子弹',
        },
        smallTankAPre: {
            default: null,
            type: cc.Prefab,
            displayName: 'smallTankAPre',
        },
        smallTankBPre: {
            default: null,
            type: cc.Prefab,
            displayName: 'smallTankBPre',
        },
        smallTankCPre: {
            default: null,
            type: cc.Prefab,
            displayName: 'smallTankCPre',
        },
        midTankAPre: {
            default: null,
            type: cc.Prefab,
            displayName: 'midTankAPre',
        },
        midTankBPre: {
            default: null,
            type: cc.Prefab,
            displayName: 'midTankBPre',
        },
        midTankCPre: {
            default: null,
            type: cc.Prefab,
            displayName: 'midTankCPre',
        },
        heavyTankAPre: {
            default: null,
            type: cc.Prefab,
            displayName: 'heavyTankAPre',
        },
        heavyTankBPre: {
            default: null,
            type: cc.Prefab,
            displayName: 'heavyTankBPre',
        },
        heavyTankCPre: {
            default: null,
            type: cc.Prefab,
            displayName: 'heavyTankCPre',
        },
        _aimTarget: {
            default: null,
        },
        _myTank: {
            default: null,
        },
        _bulletPool: {
            default: {},
        },
        _gameObjProps: [],
        activePlayerMap: [],
        activeBulletMap: [],
        _serverWorldTime: 0,
        _clientWorldTime: 0,

    },

    // LIFE-CYCLE CALLBACKS:
    start() {
        console.log("start");
    },

    onLoad() {
        let that = this;
        this._aimTarget = {
            aimTank: null,
            aimx: null,
            aimy: null,
            angle: null,
        }
        this._bulletPool = new cc.NodePool();
        for (let i = 0; i < 20; i++) {
            let bullet = cc.instantiate(this.bulletPrefab);
            this._bulletPool.put(bullet);
        }
        //
        var mySocket = window.mySocket;
        mySocket.on('connect', function () {
            that.connectStatusTxt.string = "";
            console.log("连接成功");
        });
        mySocket.on('disconnect', function () {
            that.connectStatusTxt.string = "Connecting";
            console.log("连接断开");
        });
        mySocket.on('gameUpdate', function (resp) {
            var data = resp.data;
            that._serverWorldTime = resp.time;
            that._clientWorldTime = resp.time;
            if (data.length > 0) {
                var propObj = {};
                propObj.data = data;
                propObj.cnt = 1;
                that._gameObjProps.push(propObj);
                let len = that._gameObjProps.length;
                if (len > 6) {
                    that._gameObjProps.shift();
                }
            }
        });
        mySocket.on('slowUpdate', function (data) {

        });
        mySocket.on('heart', function (data) {
            console.log(data);
        });
        cc.director.on('joystickPlayerClick', function (msg) {
            console.log(msg);
        });
        cc.director.on('aimTank', function (msg) {
            that._onTankTouchEnd(msg);
        });
        this.schedule(this._sendJoyStickMoveCallback, 0.1);
        this._initKeyEvent();
        this.gameMap.on(cc.Node.EventType.TOUCH_END, this._onMapTouchEnd, this);
    },
    onDestroy() {
        this.unscheduleAllCallbacks();
        this._deInitKeyEvent();
    },
    _initKeyEvent() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._keyDownEvent, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this._keyUpEvent, this);
    },
    _deInitKeyEvent() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this._keyDownEvent, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this._keyUpEvent, this);
    },
    _keyDownEvent(event) {
        if (event.keyCode == cc.macro.KEY.space) {}
    },
    _keyUpEvent(event) {
        if (event.keyCode == cc.macro.KEY.space) {
            this.buttonShootClick();
        }
    },
    _onMapTouchEnd(event) {
        this._aimTarget.aimTank = null;
        // pos.x-=(this.gameBg.width/2);
        // pos.y-=(this.gameBg.height/2);
        // pos=this.gameBg.convertToWorldSpace(pos);

        console.log("ori," + event.getLocation().x + "," + event.getLocation().y);
        var pos1 = event.getLocation();
        var pos2 = cc.v2(this.uiCanvas.node.width / 2, this.uiCanvas.node.height / 2);
        var pos3 = this.playerCamera.position;
        var pos4 = cc.v2(pos1.x - (pos2.x - pos3.x), pos1.y - (pos2.y - pos3.y));
        console.log("canvas," + this.uiCanvas.node.position + "," + this.uiCanvas.node.width + "," + this.uiCanvas.node.height);
        console.log("camera," + this.playerCamera.position);
        console.log(pos4);
        this._aimTarget.aimx = pos4.x;
        this._aimTarget.aimy = pos4.y;

    },
    _onTankTouchEnd(tankNode) {
        let tankScript = tankNode.getComponent(BaseTank);
        let aimUserName = tankScript.getUserName();
        let aimPos=tankScript.getPos();
        if(aimUserName!=null&&aimPos!=null){
            console.log(aimUserName + " " + aimPos);
            if (aimUserName == window.myUserName) {
                this._aimTarget.aimTank = null;
                this._aimTarget.aimx = null;
                this._aimTarget.aimy = null;
            } else {
                this._aimTarget.aimTank = tankScript;
            }
        }
    },
    update(dt) {
        let interTime = this._clientWorldTime - this._serverWorldTime;
        // console.log(this._clientWorldTime + " - " + this._serverWorldTime + " = " + interTime);
        this._clientWorldTime += dt;
        this._renderGameObj();
        if (this._myTank != null) {
            if (this._aimTarget.aimTank != null) {
                //瞄准一个坦克
                let posAim = this._aimTarget.aimTank.getPos();
                if(posAim!=null){
                    this._aimTarget.aimx = posAim.x;
                    this._aimTarget.aimy = posAim.y;
                }else{
                    this._aimTarget.aimTank = null;
                    this._aimTarget.aimx = null;
                    this._aimTarget.aimy = null;
                }
            }
            if (this._aimTarget.aimx != null && this._aimTarget.aimy != null) {
                this.aimBoomAnim.node.setPosition(this._aimTarget.aimx, this._aimTarget.aimy);
                let posMe = this._myTank.getPos();
                if(posMe!=null){
                    let dy = this._aimTarget.aimy - posMe.y;
                    let dx = this._aimTarget.aimx - posMe.x;
                    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    this._aimTarget.angle = 90 - angle;
                    this.aimBoomAnim.node.active = true;
                    let distance = dx * dx + dy * dy;
                    if (distance > 490000) {
                        this._aimTarget.aimTank = null;
                        this._aimTarget.aimx = null;
                        this._aimTarget.aimy = null;
                    }
                }else{
                    this._aimTarget.aimTank = null;
                    this._aimTarget.aimx = null;
                    this._aimTarget.aimy = null;
                }
            } else {
                //未瞄准
                // this._aimTarget.angle=this._myTank.getAngle();
                this._aimTarget.angle = null;
                this.aimBoomAnim.node.active = false;
                this.aimBoomAnim.node.setPosition(0, 0);
            }

            // if(this._aimTarget.angle!=null){
            //     this._myTank.setTowerAngle(this._aimTarget.angle);
            // }else{
            //     this._myTank.setTowerAngle(this._myTank.getAngle());
            // }
        }
    },
    buttonShootClick() {
        let shootInput = {
            userName: window.myUserName,
            button: 'shoot',
        };
        let mySocket = window.mySocket;
        mySocket.emit('userInput', shootInput);
        console.log("shoot");
    },
    buttonThunderClick() {
        let shootInput = {
            userName: window.myUserName,
            button: 'thunder',
        };
        let mySocket = window.mySocket;
        mySocket.emit('userInput', shootInput);
        console.log("thunder");
    },
    _sendJoyStickMoveCallback() {

        let mySocket = window.mySocket;
        let joyStickMoveData = this.joyStickMove.getInputData();
        this._userInput = {
            userName: window.myUserName,
            towerAngle: this._aimTarget.angle,
            addx: joyStickMoveData.addx,
            addy: joyStickMoveData.addy,
            bodyAngle: joyStickMoveData.bodyAngle,
        };
        mySocket.emit('userInput', this._userInput);
    },
    _renderGameObj() {
        if (this._gameObjProps != null) {
            let size = this._gameObjProps.length;
            if (size > 1) {
                let propObj = null;
                // propObj = this._gameObjProps.shift();
                if (size == 2) {
                    let prop1 = this._gameObjProps[0].data;
                    let prop2 = this._gameObjProps[1].data;
                    let lgcnt = this._gameObjProps[0].cnt;
                    let rate = 1 - Math.pow(lgcnt + 0.4, -2);
                    // rate=(lgcnt-1)*0.2+0.2;
                    let propLerp = this.lerpProps(prop1, prop2, rate);
                    // console.log("cnt:"+lgcnt+",log:"+rate);
                    this._gameObjProps[0].cnt += 1;
                    let propObjLerp = {};
                    propObjLerp.data = propLerp;
                    propObj = propObjLerp;
                } else {
                    this._gameObjProps.shift();
                    propObj = this._gameObjProps[0];
                }
                let props = propObj.data;
                let len = props.length;
                let tmpPlayerIds = [];
                let tmpBulletIds = [];
                //绘制
                for (let i = 0; i < len; i++) {
                    let nowprop = props[i];
                    if (nowprop.type == 't') {
                        tmpPlayerIds[nowprop.id] = 1;
                        this._renderPlayer(nowprop);
                    } else if (nowprop.type == 'b') {
                        tmpBulletIds[nowprop.id] = 1;
                        this._renderBullet(nowprop);
                    }
                }
                //移除已消失的坦克
                for (let playerId in this.activePlayerMap) {
                    let hasPlayerId = tmpPlayerIds[playerId];
                    if (hasPlayerId && hasPlayerId != null && hasPlayerId == 1) {} else {
                        let tankPlayer = this.activePlayerMap[playerId];
                        if (tankPlayer!=null) {
                            if(cc.isValid(tankPlayer.tankNode)){
                                tankPlayer.tankNode.removeFromParent(true);
                                tankPlayer.tankNode.destroy();
                            }
                            if(cc.isValid(tankPlayer.nailTankNode)){
                                tankPlayer.nailTankNode.removeFromParent(true);
                                tankPlayer.nailTankNode.destroy();
                            }
                            this.activePlayerMap[playerId] = null;
                        }
                    }
                }
                //移除已消失的子弹
                for (let bulletId in this.activeBulletMap) {
                    let hasBulletId = tmpBulletIds[bulletId];
                    if (hasBulletId && hasBulletId != null && hasBulletId == 1) {} else {
                        let bulletNode = this.activeBulletMap[bulletId];
                        if (cc.isValid(bulletNode)) {
                            let bulletScript = bulletNode.getComponent(BaseBullet);
                            bulletScript.hide();
                            this._bulletPool.put(bulletNode);
                            this.activeBulletMap[bulletId] = null;
                        }
                    }
                }
            }
        }
    },
    _renderBullet(nowprop) {
        var bulletNode = this.activeBulletMap[nowprop.id];
        let bulletScript = null;
        if (bulletNode == null) {
            bulletNode = this._bulletPool.get();
            if (bulletNode == null) {
                bulletNode = cc.instantiate(this.bulletPrefab);
            }
            bulletNode.parent = this.gameBg;
            this.activeBulletMap[nowprop.id] = bulletNode;
            bulletScript = bulletNode.getComponent(BaseBullet);
            bulletScript.setSkin(nowprop.skin);
        }else{
            bulletScript = bulletNode.getComponent(BaseBullet);
        }
        bulletScript.setBulletState(nowprop.state);
        bulletScript.setPos(nowprop.x, nowprop.y);
        bulletScript.setAngle(90 - nowprop.rad * 180 / Math.PI);
    },
    _renderPlayer(nowprop) {
        if (nowprop.userName == null) {
            return;
        }
        var tankPlayer = this.activePlayerMap[nowprop.id];
        let tankScript = null;
        let nailTankScript = null;
        if (tankPlayer == null) {
            tankPlayer={};
            var tankNode = this.createTankNode(nowprop.skin);

            var nailTankNode=cc.instantiate(this.nailTankPrefab);
            tankPlayer.tankNode=tankNode;
            tankPlayer.nailTankNode=nailTankNode;
            //
            tankScript = tankNode.getComponent(BaseTank);
            nailTankScript=nailTankNode.getComponent(NailTank);
            //
            tankNode.parent = this.gameBg;
            nailTankNode.parent=this.gameSmallMap;
            //
            this.activePlayerMap[nowprop.id] = tankPlayer;
            tankScript.setUserName(nowprop.userName);
            var colorCode = cc.Color.RED;
            colorCode.fromHEX(nowprop.color);
            tankScript.setBackColor(colorCode);
            if (window.myUserName != null && window.myUserName == nowprop.userName) {
                this._myTank = tankScript;
                console.log("set my tank");
                nailTankScript.setNailType("me");
            }else{
                nailTankScript.setNailType("enemy");
            }
        } else {
            tankScript = tankPlayer.tankNode.getComponent(BaseTank);
            nailTankScript = tankPlayer.nailTankNode.getComponent(NailTank);
        }
        tankScript.setPos(nowprop.x, nowprop.y);
        // console.log(nowprop.userName+":x"+nowprop.gx+",y"+nowprop.gy);
        tankScript.setGridInfo(nowprop.gx,nowprop.gy);
        nailTankScript.setPos(nowprop.x*0.05, nowprop.y*0.05);
        tankScript.setAngle(90 - nowprop.rad * 180 / Math.PI);
        nailTankScript.setAngle(90 - nowprop.rad * 180 / Math.PI);
        tankScript.setTowerAngle(90 - nowprop.trad * 180 / Math.PI);
        tankScript.setHp(nowprop.hp / nowprop.hpMax);
        if (window.myUserName != null && window.myUserName == nowprop.userName) {
            this.playerCamera.setPosition(nowprop.x, nowprop.y);
        }
        //TODO 
    },
    lateUpdate() {

    },
    createTankNode(skin){
        var tankNode = null;
        if(skin){
            if(skin=='sma'){
                tankNode=cc.instantiate(this.smallTankAPre);
            }else if(skin=='smb'){
                tankNode=cc.instantiate(this.smallTankBPre);
            }else if(skin=='smc'){
                tankNode=cc.instantiate(this.smallTankCPre);
            }else if(skin=='mda'){
                tankNode=cc.instantiate(this.midTankAPre);
            }else if(skin=='mdb'){
                tankNode=cc.instantiate(this.midTankBPre);
            }else if(skin=='mdc'){
                tankNode=cc.instantiate(this.midTankCPre);
            }else if(skin=='hva'){
                tankNode=cc.instantiate(this.heavyTankAPre);
            }else if(skin=='hvb'){
                tankNode=cc.instantiate(this.heavyTankBPre);
            }else if(skin=='hvc'){
                tankNode=cc.instantiate(this.heavyTankCPre);
            }else{
                tankNode=cc.instantiate(this.smallTankAPre);
            }
        }else{
            tankNode=cc.instantiate(this.midTankBPre);
        }
        return tankNode;
    },
    lerpProps(prop1, prop2, rate) {
        var propLerp = {};
        var len1 = prop1.length;
        var prop3 = [];
        for (let i = 0; i < len1; i++) {
            let nowProp = prop1[i];
            var oldProp = Object.assign({}, nowProp);
            propLerp[nowProp.id] = oldProp;
            prop3.push(oldProp);
        }
        var len2 = prop2.length;
        for (let i = 0; i < len2; i++) {
            let nowProp = prop2[i];
            var oldProp = propLerp[nowProp.id];
            if (oldProp) {
                oldProp.x = (nowProp.x - oldProp.x) * rate + oldProp.x;
                oldProp.y = (nowProp.y - oldProp.y) * rate + oldProp.y;
            }
        }
        return prop3;
    }

});