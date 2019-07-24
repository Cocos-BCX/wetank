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
        rootNode: {
            default: null,
            type: cc.Node,
            displayName: '根node',
        },
        tankNode: {
            default: null,
            type: cc.Node,
            displayName: '坦克节点',
        },
        tankHp: {
            default: null,
            type: cc.ProgressBar,
            displayName: '坦克生命值',
        },
        light: {
            default: null,
            type: cc.Sprite,
            displayName: '坦克底部光颜色',
        },
        userNameTxt: {
            default: null,
            type: cc.Label,
            displayName: '玩家名称',
        },
        gridInfoTxt: {
            default: null,
            type: cc.Label,
            displayName: 'gridInfo',
        },
        tower: {
            default: null,
            type: cc.Node,
            displayName: '炮塔',
        }
    },

    onLoad () {
        var that=this;
        that.light.node.on(cc.Node.EventType.TOUCH_START, that._touchStartEvent, that);
        that.light.node.on(cc.Node.EventType.TOUCH_END, that._touchEndEvent, that);
    },

    start () {

    },

    _touchStartEvent: function (event) {
        event.stopPropagation();
        return false;
    },

    _touchEndEvent(event){
        event.stopPropagation();
        cc.director.emit("aimTank",this);
    },

    setPos(x,y){
        if(this.rootNode){
            this.rootNode.setPosition(x,y);
        }
    },
    getPos(){
        if(this.rootNode){
            return this.rootNode.position;
        }
        return null;
    },
    setAngle(a){
        if(this.tankNode){
            this.tankNode.rotation=a;
        }
    },
    getAngle(){
        if(this.tankNode){
            return this.tankNode.rotation;
        }
        return null;
    },

    setTowerAngle(a){
        if(this.tower){
            this.tower.rotation=a;
        }
    },

    getTowerAngle(){
        if(this.tower){
            return this.tower.rotation;
        }
        return null;
    },

    setGridInfo(gx,gy){
        if(this.gridInfoTxt!=null&&gx!=null&&gy!=null){
            this.gridInfoTxt.string=gx+","+gy;
        }
    },

    setUserName(userName){
        if(this.userNameTxt){
            this.userNameTxt.node.active=true;
            this.userNameTxt.string=userName;
        }
    },
    getUserName(){
        return this.userNameTxt.string;
    },

    setHp(hp){
        if(this.tankHp){
            this.tankHp.progress=hp;
        }
    },

    setBackColor(color){
        if(this.light){
            this.light.node.color=color;
        }
    },
});
