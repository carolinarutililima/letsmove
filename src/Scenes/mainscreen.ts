import * as Phaser from 'phaser';
import * as poseDetection from '@tensorflow-models/pose-detection';

import { JBCamera, JBCameraParam } from "../jbcamera";
import { JBPoseDetection } from "../jbposedetection";
import { JBTarget } from '../jbtarget';
import { isMobile } from '../utils';
import { JBBomb } from '../jbbomb';
import { JBStar } from '../jbstar';

enum MainScreenPhase {
    WAITING_FOR_TRIAL_START,
    TRIAL_RUNNING,
    TRIAL_DONE,
};

class MainScreen extends Phaser.Scene
{
    camera : JBCamera = null;
    jbPoseDetection : JBPoseDetection = null;

    canvas : Phaser.Textures.CanvasTexture = null;
    
    constructor ( )
    {
        super('main_screen');
    }

    backgrounds = Array<string>();

    preload() {        
        this.load.image("star", 'assets/images/star.png');
        this.load.image("bomb", 'assets/images/bomb.png');

        this.backgrounds.push("bg1");
        
        this.backgrounds.push("bg2");
        
        this.backgrounds.push("bg3");

        this.load.audio( "bomb", 'assets/audio/bomb.wav' );
        this.load.audio( "levelUp", 'assets/audio/levelup.wav' );
    }

    scorePoints: number;
    currentLevel : number;

    scoreText : Phaser.GameObjects.Text = null;

    targets : Array<JBTarget> = new Array<JBTarget>();

    gameToPoseMatrix : Phaser.Math.Matrix3 = new Phaser.Math.Matrix3();

    bgSound : Phaser.Sound.BaseSound;

    timeText : Phaser.GameObjects.Text = null;

    scaleX : number;
    scaleY : number;

    jbPoseDetectionPromise : Promise<JBPoseDetection>;
    cameraPromise: Promise<JBCamera>;

    logText : Phaser.GameObjects.Text = null;
    announceText : Phaser.GameObjects.Text = null;

    currentTime : number;
    trialStartTime : number;
    scoreStartTime : number;

    create() {
        this.sound.add( "beep" );
        this.sound.add( "bomb" );

        console.log( `bg sounds: ${this.backgrounds}`);

        let rnd = ( Math.random() * ( this.backgrounds.length - 1 ) ).toFixed();
        console.log( `bg sounds: ${this.backgrounds} rnd ${rnd}`);
        let snd = this.backgrounds[rnd]

        const sndConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        };

        console.log( `snd ${snd}, sndConfig ${sndConfig}` );
        
        this.bgSound = this.sound.add( snd, sndConfig );

        let width = this.cameras.main.width;
        let height = this.cameras.main.height;
        //console.log( `create: ${width} ${height}`);
    
        const params = { 'targetFPS': 60, 'sizeOption': { width: 320, height: 320 } };

        let vw = window.innerWidth;
        let vh = window.innerHeight;

        this.announceText = this.make.text( {
            x : 0.5 * vw, 
            y : 0.5 * vh,
            text: `Announcement: Loading ...
            `,
            style: {
                color: 'white',
                font: '32px monospace',
            } 
        });

        this.announceText.setOrigin( 0.5, 0.5 );
        this.announceText.setDepth(10);

        this.currentPhase = MainScreenPhase.WAITING_FOR_TRIAL_START;
        this.nextPhase = MainScreenPhase.WAITING_FOR_TRIAL_START;

        Promise.all( [ JBCamera.factory("video", params), JBPoseDetection.factory("video") ] ).then( values => {
            this.camera = values[0];
            this.jbPoseDetection = values[1];

            this.canvas = this.textures.createCanvas( 'webcam', this.camera.video.width, this.camera.video.height );
        
            const ctx = this.canvas.context;

            // ctx.translate(0, this.canvas.width);
            //ctx.scale(-1,1);
    
            this.scaleX = this.game.canvas.width / this.camera.video.videoWidth;;
            this.scaleY = this.game.canvas.height / this.camera.video.videoHeight;;
    
            this.gameToPoseMatrix.translate( new Phaser.Math.Vector2( this.camera.video.videoWidth, 0  ) ).scale( new Phaser.Math.Vector2( - 1/this.scaleX, 1/this.scaleY ) );
            console.log( "gameToPoseMatrix" );
            console.dir( this.gameToPoseMatrix );
            
            //target.updateTarget();
            
            //console.log(`scaleX ${this.scaleX} scaleY ${this.scaleY}`);
    
            this.add.image( width/2, height/2, 'webcam').setFlipX( true ).setScale( this.scaleX, this.scaleY );
    
            this.scorePoints = 0;
            this.currentLevel = 0;

            this.scoreText = this.make.text({
                x: 10,
                y: 10,
                text: `User: ${this.registry.get('userName')}, Level: ${(1+this.currentLevel).toFixed()} Score: ${this.scorePoints.toFixed()}`,
                style: {
                    color: '#e0e030',
                    font: '32px monospace',
                }
            });
            this.scoreText.setOrigin(0, 0);
            this.trialStartTime = this.time.now;
            this.currentTime = ( ( this.time.now - this.trialStartTime ) ); //.toFixed();

            this.timeText = this.make.text({
                x: this.game.canvas.width,
                y: 10, 
                text: `Time: ${this.currentTime.toFixed()}`,
                style: {
                    color: '#e0e030',
                    font: '32px monospace',
                }
            });
            this.timeText.setOrigin(1, 0);
    
            this.sound.play( snd, sndConfig );
    
            //this.createTargets(3);
            
            this.logText = this.make.text( {
                x : 0,
                y : 0,
                text: 'Log:',
                style: {
                    color: 'black',
                    font: '14px monospace',
                }
            });

            this.logText.setActive( false );
            this.logText.setVisible( false );
            let logKey = this.input.keyboard.addKey('L');
            logKey.on( 'down', (event) => { if (this.logText.visible ) { this.logText.setVisible(false) } else { this.logText.setVisible( true ) } } );
        });
    }

    randomRGBA() {
        let o = Math.round, r = Math.random, s = 255;
        return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
    }

    currentPoses : poseDetection.Pose = null;

    prevPhase : MainScreenPhase;
    currentPhase : MainScreenPhase;
    nextPhase: MainScreenPhase;

    perc : number;
    levelUp : string;

    update( time : number, delta : number ) {
        this.currentPhase = this.nextPhase;

        console.log(`mainScreen.update ${time} ${delta} ${this.prevPhase} -> ${this.currentPhase} `);

        if ( this.prevPhase !== this.currentPhase ) {
            if ( this.currentPhase === MainScreenPhase.WAITING_FOR_TRIAL_START ) {
                this.announceText.text = `
1.) Step 3 m - 5 m  away from the camera.
2.) Make sure that the camera can detect your arms and legs.
3.) Touch the stars and avoid the bombs

Loading ...`;
                this.announceText.setVisible( true );
                this.announceText.setActive( true ); 
            } else if ( this.currentPhase === MainScreenPhase.TRIAL_RUNNING ) {
                this.announceText.text = 'Running Trial';
                this.announceText.setVisible( false );
                this.announceText.setActive( false ); 

                this.scorePoints = 0;
                this.trialMaxScore = 0;
                this.scoreText.text = `User: ${this.registry.get('userName')}, Level: ${(1+this.currentLevel).toFixed()} Score: ${this.scorePoints.toFixed()}`;
                                    
                this.trialStartTime = this.time.now;

                setTimeout( () => {
                    this.nextPhase = MainScreenPhase.TRIAL_DONE;
                }, 30*1000 );
            } else if ( this.currentPhase === MainScreenPhase.TRIAL_DONE ) {
                this.announceText.setVisible( true );
                this.announceText.setActive( true );
    
                this.perc = this.scorePoints > 0 ? ( this.scorePoints / this.trialMaxScore ) : 0;
                this.levelUp = `Reach ${Math.floor(0.75 * this.trialMaxScore)} points to level up `;
    
                if ( this.perc > 0.75 ) {
                    this.currentLevel = this.currentLevel + 1;
                    this.levelUp = `Level Up: ${(1+this.currentLevel).toFixed()}`;
                    this.sound.play("levelup");
                }
    
                this.scoreStartTime = this.time.now;
                setTimeout( () => {
                    this.nextPhase = MainScreenPhase.WAITING_FOR_TRIAL_START;
                }, 10*1000 );
            }
        }

        if ( this.currentPhase == MainScreenPhase.WAITING_FOR_TRIAL_START  ) {
            if ( ( this.camera != null ) && ( this.jbPoseDetection != null ) && ( this.canvas != null ) ) {
                this.nextPhase = MainScreenPhase.TRIAL_RUNNING;
            }
        } else if ( this.currentPhase == MainScreenPhase.TRIAL_RUNNING ) {            
            if ( ( this.camera != null ) && ( this.jbPoseDetection != null ) && ( this.canvas != null ) ) {

                this.logText.text = `
                    isMobile: ${isMobile() } camera: ${this.camera.video.width}x${this.camera.video.height}
                `;

                let ctx : CanvasRenderingContext2D = this.canvas.context;
                let cam = this.camera;
                
                //ctx.fillStyle = this.randomRGBA();
                //ctx.fillRect(0,0,this.canvas.width, this.canvas.height );

                //console.log(`draw context ${cam} ${this.canvas.width}x${this.canvas.height} ${this}, ${this.canvas}, ${this.canvas.context}`);

                //cam.clearContext( ctx, 0, 0, this.canvas.width, this.canvas.height, randomRGBA() );

                // ctx.fillStyle = this.randomRGBA();
                // ctx.fillRect(0,0,this.canvas.width, this.canvas.height );
                cam.drawContext( ctx, 0, 0, this.canvas.width, this.canvas.height );

                let dt = this.time.now - this.trialStartTime;
                this.timeText.text = `Time: ${(dt/1000).toFixed() }`;

                if ( this.jbPoseDetection != null ) {
                    const jb = this.jbPoseDetection;
                    jb.getPoses().then( poses => {
                        this.currentPoses = poses;

                        this.jbPoseDetection.drawResults( poses, ctx );

                        let width = this.cameras.main.width;
                        let height = this.cameras.main.height;

                        let radius = Math.min(width, height) / 10;

                        for (let target of this.targets ) {
                            if ( target.active ) {
                                let {tx, ty } = this.gameToPoseCoords( target.x, target.y );
        
                                const { min, minIndex } = this.jbPoseDetection.calcMinDist( this.currentPoses[0], tx, ty );
                                //console.log( `tx ${tx} ty ${ty} min ${min} ${minIndex}`);
        
                                let thresh = target.oScale / Math.max( this.scaleX, this.scaleY) * Math.min( target.width, target.height );
                                if ( ( min >= 0 ) && ( min <  thresh ) ) {
                                    let snd = ( target.getPoints() >= 0  ) ? "beep" : "bomb";
                                    this.sound.play( snd );
                                    
                                    console.log(`Hit min ${min} minIndex ${minIndex} thresh ${thresh} target.scale ${this.targets[0].scale} target.width ${this.targets[0].width}`);
                                    target.tint = Phaser.Display.Color.GetColor(255, 140, 160);

                                    console.log( `pt ${target.getPoints()} oScale: ${target.oScale} scale: ${target.scale}`);

                                    this.scorePoints = this.scorePoints + target.getPoints();
                                    console.log( `scorePoints: ${this.scorePoints} scale ${target.scale}` );
                                    this.scoreText.text = `User: ${this.registry.get('userName')}, Level: ${(1+this.currentLevel).toFixed()} Score: ${this.scorePoints.toFixed()}`;
                                    target.disableTarget( );
                                }
                            }
                        }
                        console.log("pose detection closure");
                        console.dir(this);

                        for( let t of this.targets ) {
                            t.update( time, delta );
                        }
                        this.canvas.refresh();
                        let cnt = this.cleanUpTargets( );
                        //this.targets = this.targets.filter( (target : JBTarget, index : number, array: JBTarget[] ) => { return target.active } );
                        if ( cnt === 0 ) {
                            let nTargets = Math.floor(this.currentLevel / 10);
                            let nBombs = Math.floor(this.currentLevel / 50);

                            this.createTargets( 1 + nTargets, nBombs );
                            this.trialMaxScore = 5 * 30/(2.5 - (this.currentLevel % 10)*0.15);
                            // for( let t of this.targets ) {
                            //     if ( t.points >  0 ) {
                            //         this.trialMaxScore = this.trialMaxScore + t.points;
                            //     }
                            // }
                            this.startTargets();
                        }
                    });
                }
            }    
        } else if ( this.currentPhase === MainScreenPhase.TRIAL_DONE ) {
            this.announceText.text = `Trial Finished: 
Points: ${ Math.round(this.scorePoints) }  

${this.levelUp}

Continuing in ${ (10 - ( this.time.now - this.scoreStartTime ) / 1000 ).toFixed() }
`;
        }
        this.prevPhase = this.currentPhase;
    }

    cleanUpTargets( ) {
        let cnt = 0;
        for( let t of this.targets ) {
            if ( t.active ) {
                cnt = cnt + 1;
            } else {
                t.destroy();
            }
        }
        return cnt;
    }

    trialMaxScore : number;

    createTargets( numStars : number, numBombs : number ) {
        this.targets = new Array<JBTarget>();
        let fnd = false;

        for( let i = 0; i < numStars; i++ ) {
            let t : JBTarget = null;
            fnd = false;
            for( let j = 0; j < 50; j++ ) {
                t = new JBStar( this, this.jbPoseDetection );
                t.setRandomPosition();
                const { min, minIndex } = this.jbPoseDetection.calcMinDist( this.currentPoses[0], t.x, t.y );
                
                let thresh = t.oScale * Math.max( t.width, t.height );
                if ( ( min >= 0 ) && ( min >  1.0 * thresh ) ) {
                    fnd = true;
                    break;
                }   
            }            
            if ( ! fnd ) {
                console.log("giving up to find target away from pose detection");
            }
            this.targets.push( t );
        }

        for( let i = 0; i < numBombs; i++ ) {
            let t : JBTarget = null;
            fnd = false;
            for( let j = 0; j < 50; j++ ) {
                t = new JBBomb( this, this.jbPoseDetection );
                t.setRandomPosition();
                const { min, minIndex } = this.jbPoseDetection.calcMinDist( this.currentPoses[0], t.x, t.y );
                
                let thresh = t.oScale * Math.max( t.width, t.height );
                if ( ( min >= 0 ) && ( min >  1.0 * thresh ) ) {
                    fnd = true;
                    break;
                }   
            }            
            if ( ! fnd ) {
                console.log("giving up to find bomb away from pose detection");
            }
            this.targets.push( t );
        }

        //this.startTargets();
    }

    stopTargets( ) {
        for( let t of this.targets ) {
            t.stop( );
        }
    } 

    startTargets( ) {
        for( let t of this.targets ) {
            console.log(`start target ${t.x}, ${t.y}`);
            let dur = this.currentLevel % 10;

            t.start( 2500 - dur * 150 );
        }
    } 

    gameToPoseCoords( x: number, y : number ) {
        let vec = new Phaser.Math.Vector3( x, y, 1 ).transformMat3( this.gameToPoseMatrix );
        let tx = vec.x;
        let ty = vec.y;

        return { tx, ty };
    }
}

// setInterval(() => {
//     console.log(`draw context ${width}x${height} ${this}, ${this.canvas}, ${this.canvas.context}`);
//     let ctx = this.canvas.context;
//     camera.clearContext( ctx );
//     //camera.drawContext( ctx );
//     // ctx.fillStyle = '#00ff00';
//     // ctx.fillRect(0, 0, width, height);

//     ctx.strokeStyle = '#00ff00';
//     ctx.lineWidth = 12;
//     ctx.beginPath();
//     ctx.moveTo(20, 20);
//     ctx.bezierCurveTo(20, 100, 200, 100, 200, 20);
//     ctx.stroke();
//     this.canvas.refresh();
    

// const poses = jbPoseDetectionPromise.getPoses().then((poses) => {
//     //console.log(poses[0].keypoints);
//     //camera.clearContext();
//     //camera.drawContext();
//     //jbPoseDetectionPromise.drawResults(poses, camera.context);
// });

export { MainScreen };