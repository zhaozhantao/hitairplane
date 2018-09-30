
const {ccclass, property} = cc._decorator;

@ccclass
export default class Airplane extends cc.Component {
    public focusing = false;
    public willDestroy = false;
    onCollisionEnter () {
        this.node.color = cc.color(244,0,0,255);
        this.focusing = true;
    };
    onCollisionExit () {
        this.node.color = cc.color(255,255,255,255);
        this.focusing = false;
    };
}
