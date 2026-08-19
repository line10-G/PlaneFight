import { _decorator, Animation, AudioClip, CCString, Collider2D, Component, Contact2DType, IPhysics2DContact, loadWasmModuleBullet, Node, Sprite } from 'cc';
import { Bullet } from './Bullet';
import { GameManager } from './GameManager';
import { EnemyManager } from './EnemyManager';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {

    @property
    speed:number = 300;

    @property(Animation)
    anim:Animation = null;

    @property
    hp:number = 1;

    @property
    animHit:string = "";

    @property
    animDown:string = "";

    collider:Collider2D = null;

    @property
    score:number = 100;

    @property(AudioClip)
    enemyDownAudio:AudioClip = null;

    start() {
        this.collider = this.getComponent(Collider2D);
        if(this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    update(deltaTime: number) {
        if(this.hp > 0){
            const p = this.node.position;
            this.node.setPosition(p.x, p.y - this.speed * deltaTime, p.z);
        }

        if(this.node.position.y<-580){
            this.node.destroy();
        }
    }

    onBeginContact(selfCollider:Collider2D,otherCollider:Collider2D,contact:IPhysics2DContact|null){
        
        if(otherCollider.getComponent(Bullet)){
            otherCollider.enabled = false;
            otherCollider.getComponent(Sprite).enabled = false;
        }
        
        this.hp-=1;
        if(this.hp>0){
            this.anim.play(this.animHit);
        }else{
            this.anim.play(this.animDown);
        }
        
        if(this.hp<=0){
            this.dead();
        }
    }

    protected onDestroy(): void {
        if(this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT,this.onBeginContact,this);
        }
        EnemyManager.getInstance().removeEnemy(this.node);
    }

    haveDead:boolean=false;

    dead(){
        if(this.haveDead)return;

        AudioMgr.inst.playOneShot(this.enemyDownAudio);

        GameManager.getInstance().addScore(this.score);
        if(this.collider) {
            this.collider.enabled = false;
        }
        this.scheduleOnce(()=>{
            this.node.destroy();
        },1);

        this.haveDead=true;
    }

    killNow(){
        if(this.hp<=0)return;
        this.hp=0;
        this.dead();
        this.anim.play(this.animDown);
    }
}


