import { _decorator, Component, Label} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BombUI')
export class BombUI extends Component {

    @property(Label)
    numberLabel:Label=null;
    
    start() {
        
    }

    update(deltaTime: number) {
        
    }

    updateUI(count:number){
        this.numberLabel.string = count.toString();
    }
}


