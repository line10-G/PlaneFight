import { _decorator, AudioClip, Component, director, game, Node, System } from 'cc';
import { BombUI } from './UI/BombUI';
import { ScoreUI } from './UI/ScoreUI';
import { Player } from './Player';
import { GameOverUI } from './UI/GameOverUI';
import { AudioMgr } from './AudioMgr';
import { EnemyManager } from './EnemyManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    private static instance:GameManager;

    public static getInstance():GameManager{
        return this.instance;
    }
    @property
    private bombNumber:number=0;

    @property(BombUI)
    bombUI:BombUI=null;

    @property
    private score:number=0;

    @property(ScoreUI)
    scoreUI:ScoreUI=null;

    @property(Player)
    player:Player = null;

    @property(Node)
    pauseBottonNode:Node=null;

    @property(Node)
    resumeBottonNode:Node=null;

    @property(GameOverUI)
    gameOverUI:GameOverUI=null;

    @property(AudioClip)
    gameMusic:AudioClip=null;

    @property(AudioClip)
    buttonAudio:AudioClip=null;
    
    @property(AudioClip)
    gameOverAudio:AudioClip=null;


    protected onLoad() {
        GameManager.instance = this;
    }

    protected start(){
        AudioMgr.inst.play(this.gameMusic,0.1);
    }

    update(deltaTime: number) {
        
    }

    public addBomb(){
        this.bombNumber+=1;
        this.bombUI.updateUI(this.bombNumber);
    }

    public getBombNumber():number{
        return this.bombNumber;
    }

    public addScore(s:number){
        this.score +=s ;
        this.scoreUI.updateUI(this.score);
    }

    onPauseBottonClick(){
        AudioMgr.inst.playOneShot(this.buttonAudio,1);
        AudioMgr.inst.pause();
        EnemyManager.getInstance().enemy2Audio.pause();
        director.pause();
        this.player.disableControl();
        this.pauseBottonNode.active=false;
        this.resumeBottonNode.active=true;
    }

    onResumeBottonClick(){
        AudioMgr.inst.playOneShot(this.buttonAudio,1);
        AudioMgr.inst.resume();
        EnemyManager.getInstance().enemy2Audio.play();
        director.resume();
        this.player.enableControl();
        this.resumeBottonNode.active=false;
        this.pauseBottonNode.active=true;
    }

    gameOver(){
        AudioMgr.inst.playOneShot(this.gameOverAudio,1);
        this.onPauseBottonClick();

        let hScore =localStorage.getItem("HighestScore");
        let hScoreInt = 0;

        if(hScore!=null){
            hScoreInt=parseInt(hScore,10);
        }

        if(this.score>hScoreInt){
            localStorage.setItem("HighestScore",this.score.toString());
            hScoreInt=this.score;
        }

        this.gameOverUI.showGameOverUI(hScoreInt,this.score);
    }

    onRestartBottonClick(){
        AudioMgr.inst.playOneShot(this.buttonAudio,1);
        this.onResumeBottonClick();
        director.loadScene(director.getScene().name);
    }

    isHaveBomb():boolean{
        return this.bombNumber>0;
    }

    useBomb(){
        this.bombNumber-=1;
        this.bombUI.updateUI(this.bombNumber);
    }
}


