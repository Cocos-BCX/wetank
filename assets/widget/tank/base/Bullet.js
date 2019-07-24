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
        bulletNode: {
            default: null,
            type: cc.Node,
            displayName: '子弹node',
        },
        tailNode: {
            default: null,
            type: cc.Node,
            displayName: '尾部粒子',
        },
    },

    start () {

    },
    setBulletState(state){
        if(this.bulletNode&&this.tailNode){
            if(state=='idle'){
                this.bulletNode.active=true;
                this.tailNode.active=false;
            }else if(state=='boom'){
                this.bulletNode.active=false;
                this.tailNode.active=true;
            }
        }
    },
    hide(){
        if(this.bulletNode&&this.tailNode){
            this.bulletNode.active=false;
            this.tailNode.active=false;
        }
    },
    onDestroy(){
        console.log("destroy");
    },

    // update (dt) {},
});
