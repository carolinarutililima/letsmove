
import * as Phaser from 'phaser';

class FinalScreen extends Phaser.Scene{
    constructor() {
        super('final_screen')
    };


    preload() {
      this.load.image("logo", 'assets/images/ntnuerc-logo-1.png');
    }



    create() {
      const logo = this.add.image(700, 150, "logo");   
       this.tweens.add({
         targets: logo,
         y: 500,
         duration: 2000,
         ease: "Power2",
         yoyo: true,
         loop: -1
       });

      this.add.text(10, 200, 'Enter your name:', { font: '48px Courier', backgroundColor : '#303030' } );

      let bar = this.add.graphics();
      bar.fillStyle(0x303030, 1.0);
      bar.fillRect(10, 250, 600, 50);
    
    }
  

}

export { FinalScreen };
