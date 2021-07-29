import * as Phaser from 'phaser';

class LoginScreen extends Phaser.Scene{
    constructor() {
        super({
            key: 'LoginScreen'
        })
    };
    
    init() {
       console.log("LoginScreen.init");
       
    };

    preload() {
      this.load.image("logo", 'assets/images/ntnuerc-logo-1.png');
    }

    button : Phaser.GameObjects.Text;

    textEntry : Phaser.GameObjects.Text;

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

      this.add.text(500, 5, 'Welcome to Lets Move Game', { font: '30px Courier', backgroundColor : '#D9E23D' } );

     // this.add.text(500, 40, 'Please move 1m away from the camera', { font: '35px Courier', backgroundColor : '#D9E23D' } );

     // this.add.text(100, 70, 'Hit the starts to get points, and avoid the bomb to loose them', { font: '35px Courier', backgroundColor : '#D9E23D' } );

      this.add.text(10, 200, 'Enter your name:', { font: '48px Courier', backgroundColor : '#303030' } );

      let bar = this.add.graphics();
      bar.fillStyle(0x303030, 1.0);
      bar.fillRect(10, 250, 600, 50);

      this.textEntry = this.add.text(10, 250, '', { font: '48px Courier', backgroundColor: '#303030' } );
  
      this.input.keyboard.on('keydown', (event) => {
          console.log( `event.keyCode ${event.keyCode}`);

          if ( ( event.keyCode === 8 ) && ( this.textEntry.text.length > 0) ) {
            this.textEntry.text = this.textEntry.text.substr(0, this.textEntry.text.length - 1);
          } else if (event.keyCode == 13 ) {
            this.nextScreen( );
          } else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90)) {
            this.textEntry.text += event.key;
          }
      });
  
      this.button = this.add.text( 500, 320, "Done", { font: '48px Courier', backgroundColor: '#D9E23D' } 

      
      )
        .setInteractive()
        .on('pointerdown', () => this.nextScreen( ) );
    }

    nextScreen( ) {
      this.registry.set( 'userName', this.textEntry.text );
      //this.scene.start( 'trial_screen' );
      //this.scene.start( 'main_screen' );
      this.scene.start( 'instru-screen' );

      

    }
}

export { LoginScreen };
