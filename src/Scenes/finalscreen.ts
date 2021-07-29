import * as Phaser from 'phaser';

class FinalScreen extends Phaser.Scene{
  constructor() {
    super({
        key: 'final_screen'
    })
};



  init() {
    console.log("FinalScreen.init");
    
 };

   preload() {
     console.log("foi aqui")
     this.load.image("logo", 'assets/images/ntnuerc-logo-1.png');
   }


   scorePoints: number;
   scoreText : Phaser.GameObjects.Text = null;

   create() {
     const logo = this.add.image(700, 800, "logo");   
    this.tweens.add({
      targets: logo,
      y: 500,
      duration: 2000,
      ease: "Power2",
      yoyo: true,
      loop: -1
    });
  
  
    this.add.text(500, 10, 'Final Score', { font: '30px Courier', backgroundColor : '#D9E23D' } );
    this.scoreText = this.make.text({
      x: 400,
      y: 200,
      text: `User: ${this.registry.get('userName')} - Score: ${this.registry.get('Points').toFixed()}`,
      style: {
          color: '#e0e030',
          font: '50px monospace',
      }
  });



   }

}

export { FinalScreen };
