import Airplane from "./Airplane";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Scene extends cc.Component {
    @property(cc.Prefab)
    public AirplanePrefab : cc.Prefab;
    @property(cc.Node)
    public sky : cc.Node;
    @property(cc.Node)
    public bullet : cc.Node;

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
    start () {
        cc.director.getCollisionManager().enabled = true;
    }

    update (dt) {
        this.airAddTime += dt;
        if (this.airAddTime > this.airplaneAddSpeed) {
            let airplaneNode = cc.instantiate(this.AirplanePrefab);
            airplaneNode.setParent(this.sky);
            airplaneNode.setPosition(
                Math.random() * this.sky.width - this.sky.width/2,
                this.sky.height/2
            );
            this.airplaneList.push(airplaneNode.getComponent(Airplane));
            this.airAddTime = 0;
        }
        for (let index = 0; index < this.airplaneList.length; index++) {
            const element = this.airplaneList[index];
            element.node.y -= dt * this.airplaneMoveSpeed;
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
            }
        }
    };
    bigButtonClick () {        
        for (let index = 0; index < this.airplaneList.length; index++) {
            const element = this.airplaneList[index];
            if (element.focusing) {
                element.willDestroy = true;
            }
        }
    };
}
