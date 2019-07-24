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
        enemy: {
            default: null,
            type: cc.Sprite,
            displayName: 'enemy图片',
        },
        me: {
            default: null,
            type: cc.Sprite,
            displayName: 'me图片',
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    setNailType(type){
        if(type=="me"){
            this.enemy.node.active=false;
            this.me.node.active=true;
        }else if(type=="enemy"){
            this.enemy.node.active=true;
            this.me.node.active=false;
        }
    },
    setPos(x,y){
        this.rootNode.setPosition(x,y);
    },
    getPos(){
        return this.rootNode.position;
    },
    setAngle(a){
        this.rootNode.rotation=a;
    },
    getAngle(){
        return this.rootNode.rotation;
    },
    // update (dt) {},
});
