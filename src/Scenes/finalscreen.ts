import * as Phaser from 'phaser';

class FinalScreen extends Phaser.Scene{
  constructor() {
    super({
        key: 'FinalScreen'
    })
};



  init() {
    console.log("FinalScreen.init");
    
 };

   preload() {
     this.load.image("logo", 'assets/images/ntnuerc-logo-1.png');
   }


   scorePoints: number;
   scoreText : Phaser.GameObjects.Text = null;

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
  
  
    this.add.text(300, 10, 'Final Score', { font: '30px Courier', backgroundColor : '#D9E23D' } );
    this.scoreText = this.make.text({
      x: 150,
      y: 200,
      text: `User: ${this.registry.get('userName')} - Score: ${this.registry.get('Points').toFixed()}`,
      style: {
          color: '#e0e030',
          font: '32px monospace',
      }
  });



   }

}

export { FinalScreen };
