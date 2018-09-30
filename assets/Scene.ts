import Airplane from "./Airplane";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Scene extends cc.Component {
    @property(cc.Prefab)
    public AirplanePrefab : cc.Prefab = null;
    @property(cc.Node)
    public sky : cc.Node = null;
    @property(cc.Node)
    public bullet : cc.Node = null;

    private airplaneList : Array<Airplane> = [];
    private bulletDirection = 1;
    @property(Number)
    public bulletRotationSpeed = 45;
    @property(Number)
    public bulletRotationMax = 140;
    @property(Number)
    public airplaneMoveSpeed = 50;
    @property(Number)
    public airplaneAddSpeed = 2;
    private airAddTime:number = 0;
    @property(cc.Node)
    public gameOverPanel:cc.Node = null;
    private playing = false;
    private bulletCount = 0;
    private maxBulletCount = 10;
    @property(Number)
    public bulletRevertSpeed = 1;
    @property(cc.Label)
    public bulletCountLabel = null;
    @property(cc.ProgressBar)
    public bulletProgress:cc.ProgressBar = null;
    private score = 0;
    @property(cc.Label)
    public scoreLabel:cc.Label = null;
    @property(cc.Label)
    public scoreLabelInGameOver:cc.Label = null;
    @property(cc.Node)
    public help1Label:cc.Node = null;
    @property(cc.Node)
    public helpHitEmptyLabel:cc.Node = null;
    @property(cc.Node)
    public helpNoBulletLabel:cc.Node = null;
    start () {
        cc.director.getCollisionManager().enabled = true;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchScreen, this);
        this.gameOverPanel.width = this.node.width;
        this.gameOverPanel.height = this.node.height;
        this.initAndStartGame();
    }
    initAndStartGame () {
        this.gameOverPanel.x = 10000;
        for (let index = 0; index < this.airplaneList.length; index++) {
            const element = this.airplaneList[index];
            element.node.destroy();
        }
        this.airplaneList = [];
        this.playing = true;
        this.bulletCount = this.maxBulletCount;
        this.score = 0;
        this.scoreLabel.string = this.score + "分";
        this.help1Label.x = 0;
        this.helpHitEmptyLabel.x = 10000;
        this.helpNoBulletLabel.x = 10000;
    };
    gameOver() {
        this.gameOverPanel.x = 0;
        this.playing = false;
        this.scoreLabelInGameOver.string = this.score + "分";
        this.helpHitEmptyLabel.x = 10000;
        this.helpNoBulletLabel.x = 10000;
    };
    update (dt) {
        if (this.playing) {
            this.airAddTime += dt;
            if (this.airAddTime > this.airplaneAddSpeed) {
                let airplaneNode = cc.instantiate(this.AirplanePrefab);
                airplaneNode.setParent(this.sky);
                airplaneNode.setPosition(
                    Math.random() * (this.sky.width - airplaneNode.width) - (this.sky.width - airplaneNode.width)/2,
                    this.sky.height/2
                );
                this.airplaneList.push(airplaneNode.getComponent(Airplane));
                this.airAddTime = 0;
            }
            for (let index = 0; index < this.airplaneList.length; index++) {
                const element = this.airplaneList[index];
                element.node.y -= dt * this.airplaneMoveSpeed;
                if (element.node.y < - (this.sky.height - element.node.height)/2 ) {
                    this.gameOver();
                }
            }
            this.bullet.rotation += dt * this.bulletRotationSpeed * this.bulletDirection;
            if ((this.bulletDirection > 0 && this.bullet.rotation > this.bulletRotationMax/2)
                || 
                (this.bulletDirection < 0 && this.bullet.rotation < -this.bulletRotationMax/2)
                ) {
                this.bulletDirection = -this.bulletDirection;
            }
            // 移除一个
            for (let index = 0; index < this.airplaneList.length; index++) {
                const element = this.airplaneList[index];
                if (element.willDestroy) {
                    element.node.destroy();
                    this.airplaneList.splice(index, 1);
                    break;
                }
            }
            this.bulletCount = Math.min(this.maxBulletCount, this.bulletCount + dt * this.bulletRevertSpeed);
            this.bulletCountLabel.string = Math.floor(this.bulletCount);
            this.bulletProgress.progress = this.bulletCount / this.maxBulletCount;
            if (this.bulletCount >= 1) {
                this.bullet.color = cc.color(41, 255, 0);
                this.helpNoBulletLabel.x = 10000;
            } else {
                this.bullet.color = cc.color(150, 150, 150);
                this.helpNoBulletLabel.x = 0;
            }
        }
    };
    onTouchScreen () { 
        if (this.bulletCount >= 1) {
            let empty = true;
            for (let index = 0; index < this.airplaneList.length; index++) {
                const element = this.airplaneList[index];
                if (element.focusing) {
                    element.willDestroy = true;
                    empty = false;
                    this.score ++;
                    this.scoreLabel.string = this.score + "分";
                    this.help1Label.x = 10000;
                }
            }
            if (empty && this.bulletCount >= 2 && this.score > 0) {
                // 如果打空了，消耗2个子弹
                this.bulletCount -= 2;
                if (this.bulletCount >= 1) {
                    this.helpHitEmptyLabel.x = 0;
                }
            } else if (this.score > 0) {
                // 没打空，消耗一个子弹
                this.bulletCount -= 1;
                this.helpHitEmptyLabel.x = 10000;
            }
        }       
    };
}
