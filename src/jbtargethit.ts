import * as Phaser from 'phaser';
import { JBPoseDetection } from './jbposedetection';
import { MainScreen } from './Scenes/mainscreen';

class JBTargetHit extends Phaser.GameObjects.Sprite {
    timer : Phaser.Time.TimerEvent;
    tween : Phaser.Tweens.Tween;
    
    //mainScreen : MainScreen;

    duration : number;

    constructor( scene : Phaser.Scene, name? : string | 'targethit' ) {
        super( scene, -1000, -1000, name );

        //this.mainScreen = scene as MainScreen;

        //console.log(`this.target ${this.target}`);

    }

    hit : Phaser.GameObjects.Text;

    curve: Phaser.Curves.Spline;

    path: { t: number, vec: Phaser.Math.Vector2 };
    
    start( x: number, y : number, score : number ) {
        this.x = x;
        this.y = y;

        if ( score >= 0 ) {
            this.hit = this.scene.add.text(x, y, `+ ${score.toFixed()}`, { font: '48px Courier', color: '#ffff00', backgroundColor: '#00000000' } );
        } else {
            this.hit = this.scene.add.text(x, y, `${score.toFixed()}`, { font: '48px Courier', color: '#ff3030', backgroundColor: '#00000000' } );
        }

        // this.tween = this.scene.tweens.add( { 
        //     start : 0,
        //     targets: this.hit,
        //     scaleX: 0.1,
        //     scaleY: 0.1,
        //     yoyo: false,
        //     repeat: 0,
        //     duration: 1000,
        //     ease: 'Sine.easeInOut',
        //     onComplete: function () {
        //         console.log( `onComplete Hit: ${this}` );
        //         this.disableTarget();
        //         console.log( "Target Hit tween completed" );
        //     },
        //     onCompleteScope: this,
        // } );

        this.path = { t: 0, vec: new Phaser.Math.Vector2() };

        this.tween = this.scene.tweens.add( { 
            targets: this.path,
            t: 1,
            repeat: 0,
            duration: 1000,
            ease: 'Sine.easeInOut',
            onComplete: function () {
                console.log( `onComplete Hit: ${this}` );
                this.disableTarget();
                console.log( "Target Hit tween completed" );
            },
            onCompleteScope: this,
        } );

        let tar = { x: 10, y: 10 };
        this.curve = new Phaser.Curves.Spline([
            [ this.x, this.y ],
            [ this.x, (this.y - tar.y)/2],
            [(this.x - tar.x)/2, (this.y - tar.y)/2],
            [ tar.x, tar.y ]
        ]);
    
        //let r = this.scene.add.curve(this.x, this.y, this.curve);
        //r.setStrokeStyle(5, 0xffff00);
    
        // this.timer = this.scene.time.addEvent( {
        //     delay: this.duration, 
        //     callback: this., 
        //     args: [ ], 
        //     callbackScope: this,
        //     repeat: -1,
        // } );   
        this.setActive( true );
        this.setVisible( true );
    }

    disableTarget( score: number ) {
        this.setActive( false );
        this.setVisible( false );

        this.hit.destroy();  
        //this.curve.destroy();
        this.destroy(); 
    }

    update( time: number, delta : number ) {
        let pt = this.curve.getPoint(this.path.t, this.path.vec);
        console.log( `jbtargethit update ${pt.x}, ${pt.y}`);

        this.x = pt.x;
        this.y = pt.y;
        this.hit.x = this.x;
        this.hit.y = this.y;
    }

    // updateTarget( ) {
    //     console.log("Update target");
    //     let xt : number;
    //     let yt : number;
        
    //     for( var i = 0; i < 50; i++ ) {
    //         xt = Math.random() * this.scene.cameras.main.width;
    //         yt =  Math.random() * this.scene.cameras.main.height;

    //         let { tx, ty } = this.mainScreen.gameToPoseCoords( xt, yt );

    //         let ms = (this.scene as MainScreen);
            
    //         if ( ms.currentPoses != null ) {
    //             const { min, minIndex } = this.jbPoseDetection.calcMinDist( ms.currentPoses[0], tx, ty );
    //             let thresh = 1.0* Math.max( this.width, this.height );
    //             //console.log(`trying target ${i} with thresh ${thresh} distance ${min}`);
                            
    //             if ( min >= thresh ) {
    //                 console.log(`created target ${i} with thresh ${thresh} distance ${min} tx ${tx} ty ${ty}`);
    //                 break;
    //             }
    //         }
    //     }
        
    //     this.setPosition( xt, yt );
    //     //target.setPosition( 600, 400 ); 
        
    //     this.setActive( true );
    //     this.setVisible( true );
    //     this.tint = Phaser.Display.Color.GetColor(255, 255, 0);
    //     this.tween.restart();
    // }
}

console.log("registering gameobjectfactory");

Phaser.GameObjects.GameObjectFactory.register(
	'jbtargethit',
	function (this: Phaser.GameObjects.GameObjectFactory, jbPoseDetection : JBPoseDetection ) {
        console.log("gameobjectfactory called");
		const jbtargethit = new JBTargetHit( this.scene );

        this.displayList.add( jbtargethit );
        this.updateList.add( jbtargethit );

        return jbtargethit;
	}
)

export { JBTargetHit };
