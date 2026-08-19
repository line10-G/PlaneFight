import { _decorator, Animation, AudioClip, CCString, Collider2D, Component, Contact2DType, EventTouch, input, Input, instantiate, IPhysics2DContact, Node, NodeEventType, Prefab, Sprite, Vec3 } from 'cc';
import { Reward, RewardType } from './Reward';
import { GameManager } from './GameManager';
import { LifeCountUI } from './UI/LifeCountUI';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

enum ShootType{
    None,
    OneShoot,
    TwoShoot
}

@ccclass('Player')
export class Player extends Component {

    @property
    shootRate:number = 0.5;
    @property(Node)
    bulletParent:Node = null;
    @property(Prefab)
    bullet1Prefab:Prefab = null;
    @property(Node)
    position1:Node = null;

    @property(Prefab)
    bullet2Prefab:Prefab = null;
    @property(Node)
    position2:Node = null;
    @property(Node)
    position3:Node = null;

    @property
    shootType:ShootType = ShootType.OneShoot;

    @property
    lifeCount:number = 3;

    @property(Animation)
    anim:Animation = null;

    @property
    animHit:string = "";
    @property
    animDown:string = "";

    @property
    invincibleTime:number=1;

    @property
    twoShootTime:number = 5;

    @property(LifeCountUI)
    lifeCountUI:LifeCountUI = null;

    twoShootTimer:number = 0;
    isInvincible:boolean = false;
    invincibleTimer:number = 0;
    shootTimer:number = 0;
    collider:Collider2D = null;
    private canControl:boolean=true;

    @property(AudioClip)
    bulletAudio:AudioClip=null;

    @property(AudioClip)
    getBombAudio:AudioClip=null;

    @property(AudioClip)
    getDoubleAudio:AudioClip=null;

    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_MOVE,this.onTouchMove,this);

        this.collider = this.getComponent(Collider2D);
        if(this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    protected start(){
        this.lifeCountUI.updateUI(this.lifeCount);
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE,this.onTouchMove,this);
        if(this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT,this.onBeginContact,this);
        }
    }

    onBeginContact(selfCollider:Collider2D,otherCollider:Collider2D,contact:IPhysics2DContact|null){
        
        const reward = otherCollider.getComponent(Reward);
        if(reward){
            this.onContactToReward(reward);
        }else{
            this.onContactToEnemy();
        }
        
    }

    transitionToTwoshoot(){
        this.shootType = ShootType.TwoShoot;
        this.twoShootTimer = 0;
    }

    transitionToOneshoot(){
        this.shootType = ShootType.OneShoot;
    }

    lastReward:Reward = null;

    onContactToReward(reward:Reward){
        if(reward == this.lastReward){
            return;
        }
        this.lastReward = reward;
        switch(reward.rewardType){
            case RewardType.Twoshoot:
                AudioMgr.inst.playOneShot(this.getDoubleAudio);
                this.transitionToTwoshoot();
                break;
            case RewardType.Bomb:
                AudioMgr.inst.playOneShot(this.getBombAudio);
                GameManager.getInstance().addBomb();
                break;
        }

        reward.getComponent(Collider2D).enabled = false;
        reward.getComponent(Sprite).enabled = false;
    }

    onContactToEnemy(){
        if(this.isInvincible)return;

        this.isInvincible = true;
        this.invincibleTimer = 0;

        this.changeLifeCount(-1);
        if(this.lifeCount>0){
            this.anim.play(this.animHit);
        }else{
            this.anim.play(this.animDown);
        }
        
        if(this.lifeCount<=0){
            
            if(this.collider) {
                this.collider.enabled = false;
            }
            this.shootType = ShootType.None;
            this.scheduleOnce(()=>{
                GameManager.getInstance().gameOver();
            },0.4);
        }
    }

    changeLifeCount(count:number){
        this.lifeCount+=count;
        this.lifeCountUI.updateUI(this.lifeCount);
    }

    onTouchMove(event: EventTouch){

        if(!this.canControl)return;

        if(this.lifeCount<1)return;

        const p = this.node.getPosition();

        let  targetPosition = new Vec3(p.x + event.getDeltaX(), p.y + event.getDeltaY(), p.z);

        if(targetPosition.x < -230){
            targetPosition.x = -230;
        }
        if(targetPosition.x > 230){
            targetPosition.x = 230;
        }
        if(targetPosition.y > 380){
            targetPosition.y = 380;
        }
        if(targetPosition.y < -380){
            targetPosition.y = -380;
        }

        this.node.setPosition(targetPosition);

    }

    protected update(deltaTime: number) {
        switch(this.shootType){
            case ShootType.OneShoot:
                this.oneShoot(deltaTime);
                break;
            case ShootType.TwoShoot:
                this.twoShoot(deltaTime);
                break;
        }

        if(this.isInvincible){
            this.invincibleTimer+=deltaTime;
            if(this.invincibleTimer>this.invincibleTime){
                this.isInvincible = false;
            }
        }
        
    }

    oneShoot(deltaTime:number){
        this.shootTimer += deltaTime;
        if(this.shootTimer >= this.shootRate){
            AudioMgr.inst.playOneShot(this.bulletAudio,0.2);
            this.shootTimer = 0;
            const bullet1 = instantiate(this.bullet1Prefab);
            this.bulletParent.addChild(bullet1);
            bullet1.setWorldPosition(this.position1.worldPosition);
        }
    }

    twoShoot(deltaTime:number){
        this.twoShootTimer+=deltaTime;
        if(this.twoShootTimer>this.twoShootTime){
            this.transitionToOneshoot();
        }

        this.shootTimer += deltaTime;
        if(this.shootTimer >= this.shootRate){
            AudioMgr.inst.playOneShot(this.bulletAudio,0.2);
            this.shootTimer = 0;
            const bullet2 = instantiate(this.bullet2Prefab);
            const bullet3 = instantiate(this.bullet2Prefab);
            this.bulletParent.addChild(bullet2);
            this.bulletParent.addChild(bullet3);
            bullet2.setWorldPosition(this.position2.worldPosition);
            bullet3.setWorldPosition(this.position3.worldPosition);
        }
    }

    disableControl(){
        this.canControl = false;
    }

    enableControl(){
        this.canControl = true;
    }
}


