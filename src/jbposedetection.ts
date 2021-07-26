import * as poseDetection from '@tensorflow-models/pose-detection';
import { findBackendFactory } from '@tensorflow/tfjs-core';

class JBPoseDetection {
    videoElement : HTMLVideoElement;
    detector : any;
    model : poseDetection.SupportedModels;

    width : number;
    height : number;

    private constructor( video : string, model : poseDetection.SupportedModels ) {
        const vel = document.getElementById(video);
        this.videoElement = vel as HTMLVideoElement;
        
        this.width = this.videoElement.width;
        this.height = this.videoElement.height;

        this.model = model;
    }

    static async factory( video : string,  ) {
        const poser = new JBPoseDetection( video, poseDetection.SupportedModels.MoveNet );
        poser.detector = await poseDetection.createDetector( poser.model, {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING } );
        return poser;
    }

    async getPoses() {
        const poses = await this.detector.estimatePoses( this.videoElement );
        return poses;
    }

    drawResults( poses, context : CanvasRenderingContext2D ) {
        for (const pose of poses) {
          this.drawResult(pose, context );
        }
    }    
    
    drawResult(pose : poseDetection.Pose, context : CanvasRenderingContext2D ) {
        if (pose.keypoints != null) {
            this.drawKeypoints(pose.keypoints, context );
            this.drawSkeleton(pose.keypoints, context );
            //console.log(`Nose ${pose.keypoints[0].x}, ${pose.keypoints[0].y}`);
        }
    }
    
    drawKeypoints(keypoints, context : CanvasRenderingContext2D) {
        const keypointInd = poseDetection.util.getKeypointIndexBySide( this.model );
        context.fillStyle = 'White';
        context.strokeStyle = 'White';
        context.lineWidth = 3; // params.DEFAULT_LINE_WIDTH;

        for (const i of keypointInd.middle) {
            this.drawKeypoint(keypoints[i], context);
        }

        context.fillStyle = 'Green';

        for (const i of keypointInd.left) {
            this.drawKeypoint(keypoints[i], context );
        }

        context.fillStyle = 'Orange';

        for (const i of keypointInd.right) {
            this.drawKeypoint(keypoints[i], context);
        }
    }

    drawKeypoint(keypoint, context : CanvasRenderingContext2D ) {
        // If score is null, just show the keypoint.
        const score = keypoint.score != null ? keypoint.score : 1;
        const scoreThreshold = 0.50; // params.STATE.modelConfig.scoreThreshold || 0;
        if (score >= scoreThreshold) {
          const circle = new Path2D();
          circle.arc(keypoint.x, keypoint.y, 5.0 /* params.DEFAULT_RADIUS */, 0, 2 * Math.PI);
          context.fill(circle);
          context.stroke(circle);
        }
    }
    
    /**
     * Draw the skeleton of a body on the video.
     * @param keypoints A list of keypoints.
     */
    drawSkeleton(keypoints, context : CanvasRenderingContext2D ) {
        context.fillStyle = 'White';
        context.strokeStyle = 'White';
        context.lineWidth = 3; //params.DEFAULT_LINE_WIDTH;
        poseDetection.util.getAdjacentPairs( this.model ).forEach(([i, j]) => {
          const kp1 = keypoints[i];
          const kp2 = keypoints[j]; // If score is null, just show the keypoint.
    
          const score1 = kp1.score != null ? kp1.score : 1;
          const score2 = kp2.score != null ? kp2.score : 1;
          const scoreThreshold = 0.50; // params.STATE.modelConfig.scoreThreshold || 0;
    
          if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
            context.beginPath();
            context.moveTo(kp1.x, kp1.y);
            context.lineTo(kp2.x, kp2.y);
            context.stroke();
          }
        });
    }
    
    calcMinDist( pose : poseDetection.Pose, x : number, y : number ) {
        //console.dir( pose );
        let min = -1;
        let minIndex = -1;
        if ( pose.keypoints != null ) {
            for( let i = 0; i < pose.keypoints.length; i++ ) {
                const kp = pose.keypoints[i];
                if ( kp.score > 0.5 ) {
                    let d = Math.hypot( kp.x - x, kp.y - y );
                    //console.log(`kp[${i}] at ${kp.x}, ${kp.y}, to ${x},${y} = d ${d}`);
                    if ( ( minIndex < 0 ) || ( min > d ) ) {
                        min = d;
                        minIndex = i;
                    }
                }
            }
        }
        console.log(min, minIndex);
        return { min, minIndex };
    }

    scaleX : number;
    scaleY : number;
}

export { JBPoseDetection };
