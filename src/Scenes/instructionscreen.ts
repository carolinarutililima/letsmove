import * as Phaser from 'phaser';

class InstruScreen extends Phaser.Scene{
    constructor() {
        super({
            key: 'instru-screen'
        })
    };
    
    init() {
       console.log("InstruScreen.init");
       
    };

    preload() {
      this.load.image("logo", 'assets/images/ntnuerc-logo-1.png');
    }

    button : Phaser.GameObjects.Text;

    textEntry : Phaser.GameObjects.Text;

    scoreText : Phaser.GameObjects.Text = null;


    create() {
      const logo = this.add.image(900, 400, "logo");   
      this.tweens.add({
        targets: logo,
        y: 500,
        duration: 2000,
        ease: "Power2",
        yoyo: true,
        loop: -1
      });
    
    // create() {
    //   let tWidth = window.innerWidth;
    //   let tHeight = window.innerHeight;

    //   const logo = this.add.image(0, 0, "logo");   
    //   logo.setOrigin(0.5,0);

    //   this.tweens.add({
    //     targets: logo,
    //     x: 1.0 * tWidth,
    //     duration: 2000,
    //     ease: "Power2",
    //     yoyo: true,
    //     loop: -1
    //   });

      //this.add.text(700, 5, 'Lets Move Game', { font: '20px Courier', backgroundColor : '#D9E23D' } );

      this.add.text(300, 70, '1) Please move 1m away from the camera', { font: '35px Courier', backgroundColor : '#D9E23D' } );

      this.add.text(60, 130, '2) Hit the starts to get points, and avoid the bomb to loose them', { font: '35px Courier', backgroundColor : '#D9E23D' } );

      this.add.text(300, 190, '3) Avoid the bomb to not loose them', { font: '35px Courier', backgroundColor : '#D9E23D' } );

      this.add.text(200, 240, '4) 10s Trial Section is lauched before the main game', { font: '35px Courier', backgroundColor : '#D9E23D' } );

      this.scoreText = this.make.text({
        x: 550,
        y: 10,
        text: `Welcome ${this.registry.get('userName')}`,
        style: {
            color: '#e0e030',
            font: '50px monospace',
        }
    });   


    this.input.keyboard.on('keydown', (event) => {
      console.log( `event.keyCode ${event.keyCode}`);

      if (event.keyCode == 13 ) {
        this.nextScreen( );
      } 
    });

    this.button = this.add.text( 500, 320, "Start Game", { font: '48px Courier', backgroundColor: '#D9E23D' } 

    )
    .setInteractive()
    .on('pointerdown', () => this.nextScreen( ) );

}

  nextScreen( ) {
    //this.scene.start( 'trial_screen' );
    this.scene.start( 'main_screen' );
  }
}

export { InstruScreen };
