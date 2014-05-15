$.getScript('js/llqrcode.js');
var gCtx = null;
var gCanvas = null;
var videoElement = null;
var isStreaming = false;

function initCanvas(ww,hh)
{
    gCanvas = document.getElementById("qr-canvas");
    var w = ww;
    var h = hh;
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
    imageData = gCtx.getImageData( 0,0,320,240);
}

function captureToCanvas() {
    //if(gUM)
    //{
      if (isStreaming) {
        try{
            gCtx.drawImage(videoElement,0,0);
            try{
                qrcode.decode();
            }
            catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
            };
        }
        catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
        };
      }
    //}
    /*else
    {
        flash = document.getElementById("embedflash");
        try{
            flash.ccCapture();
        }
        catch(e)
        {
            console.log(e);
            setTimeout(captureToCanvas, 1000);
        }
    }*/
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function read(a) {
    var html="<br>";
    if(a.indexOf("http://") === 0 || a.indexOf("https://") === 0)
        html+="<a target='_blank' href='"+a+"'>"+a+"</a><br>";
    html+="<b>"+htmlEntities(a)+"</b><br><br>";
    alert('the code is : ' + a);

    var add_device_identifier = (add_device_list) ? add_device_list : -1; 
    // -1=error reading from main.js; 0=undefined; 1=gateway; 2=devicecontroller; 3=device;

    // process the code here and stop camera afterwards
    // TODO: do ajax call to add the scanned code absed on the add_device_identifier

    stop();
    //document.getElementById("result").innerHTML=html;
} 

function stop() {
  if (isStreaming) {
    videoElement.src = null;
    videoElement.hidden = true; // try another way to set css display:none, as not every browser have hidden attribute
    isStreaming = false;
    window.stream.stop();
    window.stream = null;
  }
}

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function load()
{
  if(isCanvasSupported() && window.File && window.FileReader)
  {
    initCanvas(800,600);
    qrcode.callback = read;
    //alert('loaded correctly!');
  }
  else
  {
    /*
    document.getElementById("mainbody").style.display="inline";
    document.getElementById("mainbody").innerHTML='<p id="mp1">QR code scanner for HTML5 capable browsers</p><br>'+
        '<br><p id="mp2">sorry your browser is not supported</p><br><br>'+
        '<p id="mp1">try <a href="http://www.mozilla.com/firefox"><img src="firefox.png"/></a> or <a href="http://chrome.google.com"><img src="chrome_logo.gif"/></a> or <a href="http://www.opera.com"><img src="Opera-logo.png"/></a></p>';
    */
  }
}

navigator.getUserMedia =  navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var vidhtml = '<video id="basic-stream" autoplay></video>';

function successCallback(stream) {
  window.stream = stream; // make stream available to console
  videoElement.src = window.URL.createObjectURL(stream);
  videoElement.play();
  isStreaming = true;
  setTimeout(captureToCanvas, 500);
}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}

function setCamera(e){
  var source_id = $(e).data("id");
  console.log(source_id);
  var constraints = {
    video: {
      optional: [{sourceId: source_id}]
    }
  };
  $('#videodiv').html(vidhtml);
  videoElement = document.querySelector("video#basic-stream");
  navigator.getUserMedia(constraints, successCallback, errorCallback);
  setTimeout(captureToCanvas, 500);
}

var deviceInputList = $('#device-input-list');

function gotSources(sourceInfos) {
  var audio = 0;
  var video = 0;
  for (var i = 0; i != sourceInfos.length; ++i) {
    var sourceInfo = sourceInfos[i];
    if (sourceInfo.kind === 'audio') {
      // we are not handling audio now
      //var label = sourceInfo.label || 'microphone ' + audio;
      //$('#device-input-list').append('<li data-id="' + sourceInfo.id + '"><a href="#">' + label + '</a></li>');
      //$('#device-input-list').listview('refresh');
      //audio++;
    }
    else if (sourceInfo.kind === 'video') {
      var facing = sourceInfo.facing || 'none';
      var label = sourceInfo.label || 'Camera ' + video + ' - facing ' + facing;
      $('#device-input-list').append('<li onclick="setCamera(this)" data-id="' + sourceInfo.id + '"><a href="#">' + label + '</a></li>');
      $('#device-input-list').listview('refresh');
      video++;
    }
    else {
      console.log('Some other kind of source : ', sourceInfo);
    }
  }
}

if (typeof MediaStreamTrack === 'undefined') {
  alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
}
else {
  MediaStreamTrack.getSources(gotSources);
}