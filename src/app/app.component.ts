import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  name = ' Tomar foto usando webcam y generar base64';
  
  @ViewChild('videoContainer') videoContainer: ElementRef;
  @ViewChild('videoElement') videoElement: any;
  @ViewChild('overlayImg') overlayImg: ElementRef;
  video: any;
  videoActive: Boolean;
  capturedFrontImage: any;
  capturedBackImage: any;
  optimizedRequest: any;
  optimizedRequestSize: any;

  ngOnInit() {
    this.capturedFrontImage = null;
    this.capturedBackImage = null;

    this.start();
  }

  start() {
    this.video = this.videoElement.nativeElement;

    // REAR CAMERA
    this.initCamera({ 
      video: { 
        facingMode: "environment"
      },
      audio: false 
      });

    // FRONT CAMERA
    // this.initCamera({ video: { facingMode: "user" }, audio: false });
  }

  initCamera(config:any) {    
    var browser = <any>navigator;

    console.log(browser.userAgent);

    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (browser.mediaDevices === undefined) {
      browser.mediaDevices = {};
    }

    browser.getUserMedia = (browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia);

    browser.mediaDevices.getUserMedia(config).then(stream => {
      console.log('STREAM', stream);
      
      // Older browsers may not have srcObject
      if ("srcObject" in this.video) {
        this.video.srcObject = stream;
      } else {
        this.video.src = window.URL.createObjectURL(stream);
      }

      this.video.onloadedmetadata = (e) => {
        this.videoActive = true;
        this.video.play();
      };
    }).catch( err => {
      console.log(err.name + ": " + err.message); 
      
      if ( err.name ) {
        switch(err.name) {
          case 'AbortError':
          break;
          case 'NotAllowedError':
            const userAgent = navigator.userAgent.toLowerCase();
            let userBrowser;
            if (userAgent.indexOf('firefox') > -1) {
              userBrowser = 'Firefox';
            } else if (userAgent.indexOf('chrome') > -1) {
              userBrowser = 'Chrome';
            } else if (userAgent.indexOf('safari') > -1) {
              userBrowser = 'Safari';
            }
            alert('no tienes permiso usando ' + userBrowser);
            break;
          case 'NotFoundError':
          break;
          case 'NotReadableError':
          break;
          case 'OverconstrainedError':
          break;
          case 'SecurityError':
          break;
          case 'TypeError':
          break;
          default:
            console.log('error generico, no controlado');
          break;
        }
      }
    });
  }

  captureFront() {
    this.resizeImage(this.video, 1432, 914, 70, (base64) => {
      this.capturedFrontImage = base64;
      this.generateOptimizedRequest();
    });

    // this.turnCameraOff();
  }

  captureBack() {
    this.resizeImage(this.video, 1432, 914, 70, (base64) => {
      this.capturedBackImage = base64;
      this.generateOptimizedRequest();
    });

    // this.turnCameraOff();
  }

  resizeImage(video, width, height, quality, callback) {
    // const canvas = document.createElement('canvas');
    // const ctx = canvas.getContext('2d');
    // canvas.width  = width;
    // canvas.height = height;

    // let xStart = 0;
    // let yStart = 0;
    // let newWidth = 0;
    // let newHeight = 0;

    // let aspectRadio = video.videoHeight / video.videoWidth;

    //   if (video.videoHeight > video.videoWidth) {
    //     // horizontal
    //     aspectRadio = video.videoWidth / video.videoHeight;
    //     newHeight = height;
    //     newWidth = aspectRadio * height;
    //     xStart = -(newWidth - width) / 2;
    //   } else {
    //     // vertical
    //     newWidth = width;
    //     newHeight = aspectRadio * width;
    //     yStart = -(newHeight - height) / 2;
    //   }

    // let overlayBox = this.overlayImg.nativeElement;
    // let containerTop = this.videoContainer.nativeElement.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
    // let overlayTop = overlayBox.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);

    // // ctx.drawImage(video, xStart, yStart, newWidth, newHeight);
    // // ctx.drawImage(video, overlayBox.getBoundingClientRect().x, overlayTop - containerTop, 500, 500, 0, 0, 600, 600);

    // callback(canvas.toDataURL('image/jpeg', quality / 100));


      let canvas   = document.createElement("canvas"),
          ctx      = canvas.getContext('2d'),
          xStart   = 0,
          yStart   = 0,
          aspectRadio,
          newWidth,
          newHeight;

      ctx.save();
      ctx.beginPath();

      canvas.width  = width;
      canvas.height = height;

      aspectRadio = video.videoHeight / video.videoWidth;

      if(video.videoHeight > video.videoWidth) { // OR < for 4:3 photo
         //horizontal
         aspectRadio = video.videoWidth / video.videoHeight;
         newHeight   = height,
         newWidth    = aspectRadio * height;
         xStart      = -(newWidth - width) / 2;
      } else {
         //vertical
         newWidth  = width,
         newHeight = aspectRadio * width;
         yStart    = -(newHeight - height) / 2;
      }

      ctx.fillStyle = 'green';
      ctx.rect(0, 0, width, height);
      ctx.fill();
      ctx.closePath();
      ctx.drawImage(video, xStart, yStart, newWidth, newHeight);
    
      // let overlayBox = this.overlayImg.nativeElement.getBoundingClientRect();
      // ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)

      // canvas = this.cropCanvas(canvas, 250, 250, width, height);
      // ctx = canvas.getContext('2d');

      callback(canvas.toDataURL('image/jpeg', quality / 100));
  }

  cropCanvas(sourceCanvas,left,top,width,height) {
    let destCanvas = document.createElement('canvas');
    destCanvas.width = width;
    destCanvas.height = height;
    destCanvas.getContext('2d').drawImage(
        sourceCanvas,
        left,top,width,height,  // source rect with content to crop
        0,0,width,height);      // newCanvas, same size as source rect
    return destCanvas;
  }

  generateOptimizedRequest() {
    if (this.capturedFrontImage && this.capturedBackImage) {  
      this.optimizedRequest = {
        id_front: this.capturedFrontImage,
        id_back: this.capturedBackImage,
        selfie: 'asd4das6d5',
        documentType: 'jpg'
      }

      this.optimizedRequestSize = JSON.stringify(this.optimizedRequest, null, 0).length / 1000;
      }
    }

  turnCameraOff() {
    this.videoActive = false;
    this.video.srcObject = null;
  }

}
