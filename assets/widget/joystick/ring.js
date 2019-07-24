cc.Class({
    extends: cc.Component,

    properties: {
        dot: {
            default: null,
            type: cc.Node,
            displayName: '摇杆节点',
        },
        notifyClickName: {
            default: "joystickPlayerClick",
            displayName: '通知点击名称',
        },
        _angle: {
            default: null,
            displayName: '当前触摸的角度',
        },

        _radian: {
            default: null,
            displayName: '弧度',
        },


        _speed: 0, //实际速度
        _speed1: 2, //一段速度
        _speed2: 4, //二段速度
        _silence:0,
        //wasd
        _wasdState:[],
        _wasdSpeed:[],
        _joystickInput:null,
    },


    onLoad: function () {
        this._radius=this.node.width/3;
        this._silence=0;
        this._speed1=1;
        this._speed2=1;
        this._initTouchEvent();
        this._initKeyEvent();
        this._wasdState=[0,0,0,0];
        this._wasdSpeed=[0,0,0,0];
        this._joystickInput={
            addx: 0,
            addy: 0,
            bodyAngle:0,
        };
        console.log("ring");
    },
    onDestroy(){
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this._keyDownEvent, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this._keyUpEvent, this);
    },

    //对圆圈的触摸监听
    _initTouchEvent: function () {
        var self = this;
        self.node.on(cc.Node.EventType.TOUCH_START, this._touchStartEvent, self);
        self.node.on(cc.Node.EventType.TOUCH_MOVE, this._touchMoveEvent, self);
        // 触摸在圆圈内离开或在圆圈外离开后，摇杆归位，player速度为0
        self.node.on(cc.Node.EventType.TOUCH_END, this._touchEndEvent, self);
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, this._touchEndEvent, self);
    },

    _initKeyEvent(){
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._keyDownEvent, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this._keyUpEvent, this);
    },

    //更新移动目标
    update: function (dt) {
        // this._wasdCheck();
        this._allDirectionsMove(dt);
    },
    lateUpdate: function (dt) {
        // console.log(dt);
    },
    //全方向移动
    _allDirectionsMove: function (dt) {
        if (this._speed != 0) {
            this._joystickInput.addx=Math.cos(this._angle * (Math.PI / 180)) * this._speed;
            this._joystickInput.addy=Math.sin(this._angle * (Math.PI / 180)) * this._speed;
            this._joystickInput.bodyAngle=this._angle;
        }else{
            this._joystickInput.addx=0;
            this._joystickInput.addy=0;
        }
    },

    getInputData(){
        return this._joystickInput;
    },

    //计算两点间的距离并返回
    _getDistance: function (pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2));
    },

    /*角度/弧度转换
    角度 = 弧度 * 180 / Math.PI
    弧度 = 角度 * Math.PI / 180*/
    //计算弧度并返回
    _getRadian: function (point) {
        this._radian = Math.PI / 180 * this._getAngle(point);
        return this._radian;
    },

    //计算角度并返回
    _getAngle: function (point) {
        var pos = this.node.getPosition();
        this._angle = Math.atan2(point.y - pos.y, point.x - pos.x) * (180 / Math.PI);
        return this._angle;
    },

    //设置实际速度
    _setSpeed: function (point) {
        //触摸点和遥控杆中心的距离
        var distance = this._getDistance(point, this.node.getPosition());

        //如果半径
        if (distance < this._radius) {
            this._speed = this._speed1;
        } else {
            this._speed = this._speed2;
        }
    },

    _keyDownEvent(event){
        if(event.keyCode==cc.macro.KEY.w){
            console.log('Down w key');
            this._wasdState[0]=1;
        }
        if(event.keyCode==cc.macro.KEY.a){
            console.log('Down a key');
            this._wasdState[1]=1;
        }
        if(event.keyCode==cc.macro.KEY.s){
            console.log('Down s key');
            this._wasdState[2]=1;
        }
        if(event.keyCode==cc.macro.KEY.d){
            console.log('Down d key');
            this._wasdState[3]=1;
        }
    },

    _keyUpEvent(event){
        if(event.keyCode==cc.macro.KEY.w){
            console.log('Up w key');
            this._wasdState[0]=0;
        }
        if(event.keyCode==cc.macro.KEY.a){
            console.log('Up a key');
            this._wasdState[1]=0;
        }
        if(event.keyCode==cc.macro.KEY.s){
            console.log('Up s key');
            this._wasdState[2]=0;
        }
        if(event.keyCode==cc.macro.KEY.d){
            console.log('Up d key');
            this._wasdState[3]=0;
        }
    },
    _wasdCheck(){
        for(let i=0;i<4;i++){
            let state=this._wasdState[i];
            let speed=this._wasdSpeed[i];
            if(state==1){
                speed+=0.2;
            }else{
                speed-=0.1;
            }
            if(speed>1){
                speed=1;
            }
            if(speed<0){
                speed=0;
            }
            this._wasdSpeed[i]=speed;
        }
        let x=this._wasdSpeed[3]-this._wasdSpeed[1];
        let y=this._wasdSpeed[0]-this._wasdSpeed[2];
        if(x==0&&y==0){
            this._speed=0;
        }else{
            let angle = Math.atan2(y,x) * (180 / Math.PI);
            this._speed=this._speed2;
            this._angle=angle;
        }
    },
    _touchStartEvent: function (event) {
        // 获取触摸位置的世界坐标转换成圆圈的相对坐标（以圆圈的锚点为基准）
        var touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        //触摸点与圆圈中心的距离
        var distance = this._getDistance(touchPos, cc.v2(0, 0));
        //圆圈半径
        var radius = this.node.width / 2;
        // 记录摇杆位置，给touch move使用
        this._stickPos = touchPos;
        var posX = this.node.getPosition().x + touchPos.x;
        var posY = this.node.getPosition().y + touchPos.y;
        //手指在圆圈内触摸,控杆跟随触摸点
        if (radius > distance) {
            this.dot.setPosition(cc.v2(posX, posY));
            return true;
        }
        return false;
    },

    _touchMoveEvent: function (event) {
        var touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        var distance = this._getDistance(touchPos, cc.v2(0, 0));
        var radius = this.node.width / 2;
        // 由于摇杆的postion是以父节点为锚点，所以定位要加上ring和dot当前的位置(stickX,stickY)
        var posX = this.node.getPosition().x + touchPos.x;
        var posY = this.node.getPosition().y + touchPos.y;
        if (radius > distance) {
            this.dot.setPosition(cc.v2(posX, posY));
        } else {
            //控杆永远保持在圈内，并在圈内跟随触摸更新角度
            var x = this.node.getPosition().x + Math.cos(this._getRadian(cc.v2(posX, posY))) * radius;
            var y = this.node.getPosition().y + Math.sin(this._getRadian(cc.v2(posX, posY))) * radius;
            this.dot.setPosition(cc.v2(x, y));
        }
        //更新角度
        this._getAngle(cc.v2(posX, posY));
        //设置实际速度
        this._setSpeed(cc.v2(posX, posY));

    },

    _touchEndEvent: function () {
        this.dot.setPosition(this.node.getPosition());
        this._speed = 0;
        cc.director.emit(this.notifyClickName,"click");
    },
});