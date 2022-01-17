var canvas = document.getElementById("canvas"); //Canvas - 2D
var pencil = document.getElementById("pencil_btn"); // Pencil Button
var eraser = document.getElementById("erase_btn");
var paint = document.getElementById("color-label");
var paintpick = document.getElementById("color-picker");
var slider = document.getElementById("myRange");
var ctx = canvas.getContext("2d");
var flag = false;
var prevX = -120;
var prevY = 0;
var buttonPen = document.querySelector(".pen1");
var stat = false;
var drawingSurfaceImageData;
ctx.lineWidth = 6; //default width
let mouseDown = false;
var stack = [];
stack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
var queue = [];
var isClicked = false;
function handleChange(src) {
  paint.classList.add("hide");
  paintpick.classList.add("hide");
  slider.classList.add("hide");
  canvas.removeEventListener("mousemove", draw);
  if (src.value == 1) {
    ctx.strokeStyle = returnColor();
    canvas.addEventListener("mousedown", function (event) {
      mouseDown = true;
      prevX = event.clientX - 120;
      prevY = event.clientY;
      let data = {
        x: prevX,
        y: prevY,
      };
      socket.emit("beginPath", data);
    });
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", function (event) {
      saveDrawingSurface();
      mouseDown = false;
    });
  } else if (src.value == 2) {
    paint.classList.remove("hide");
    paintpick.classList.remove("hide");
  } else if (src.value == 3) {
    ctx.strokeStyle = "rgba(255,255,255,1)";
    canvas.addEventListener("mousedown", function (event) {
      mouseDown = true;
      prevX = event.clientX - 120;
      prevY = event.clientY;
      let data = {
        x: prevX,
        y: prevY,
      };
      socket.emit("beginPath", data);
    });
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", function (event) {
      mouseDown = false;
    });
  } else if (src.value == 4) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else if (src.value == 5) {
    slider.classList.remove("hide");
  } else if (src.value == 6) {
    saveDrawingSurface();
    var link = document.createElement("a");
    link.download = "filename.png";
    link.href = document.getElementById("canvas").toDataURL();
    link.click();
  } else if (src.value == 7) {
    // if (isClicked == false) {
    //   queue.push(stack.pop());
    // }
    // isClicked = true;
    undo();
  } else if (src.value == 8) {
    redo();
  } else if (src.value == 9) {
    var imageLoader = document.getElementById("imageLoader");
    imageLoader.addEventListener("change", handleImage, false);
    function handleImage(e) {
      var reader = new FileReader();
      reader.onload = function (event) {
        var img = new Image();
        img.onload = function () {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  }
}
function saveDrawingSurface() {
  drawingSurfaceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  stack.push(drawingSurfaceImageData);
}

function undo() {
  if (stack.length > 0) {
    drawingSurfaceImageData = stack.pop();
    queue.push(drawingSurfaceImageData);
    ctx.putImageData(drawingSurfaceImageData, 0, 0);
    console.log(stack.length);
    console.log(queue.length);
  }
}

function redo() {
  if (queue.length > 0) {
    drawingSurfaceImageData = queue.pop();
    stack.push(drawingSurfaceImageData);
    ctx.putImageData(drawingSurfaceImageData, 0, 0);
    console.log(stack.length);
    console.log(queue.length);
  }
}

function draw(event) {
  prevX = event.clientX - 120;
  prevY = event.clientY;
  if (mouseDown) {
    let data = {
      x: prevX,
      y: prevY,
      color: ctx.strokeStyle,
      width: ctx.lineWidth,
    };
    ctx.save();
    socket.emit("drawStroke", data);
  }
}

//Color Picker Logic Below
var colorBlock = document.getElementById("color-block");
var ctx1 = colorBlock.getContext("2d");
var width1 = colorBlock.width;
var height1 = colorBlock.height;

var colorStrip = document.getElementById("color-strip");
var ctx2 = colorStrip.getContext("2d");
var width2 = colorStrip.width;
var height2 = colorStrip.height;

var colorLabel = document.getElementById("color-label");

var x = 0;
var y = 0;
var drag = false;
var rgbaColor = "rgba(0,0,0,1)";

ctx1.rect(0, 0, width1, height1);
fillGradient();

ctx2.rect(0, 0, width2, height2);
var grd1 = ctx2.createLinearGradient(0, 0, 0, height1);
grd1.addColorStop(0, "rgba(255, 0, 0, 1)");
grd1.addColorStop(0.17, "rgba(255, 255, 0, 1)");
grd1.addColorStop(0.34, "rgba(0, 255, 0, 1)");
grd1.addColorStop(0.51, "rgba(0, 255, 255, 1)");
grd1.addColorStop(0.68, "rgba(0, 0, 255, 1)");
grd1.addColorStop(0.85, "rgba(255, 0, 255, 1)");
grd1.addColorStop(1, "rgba(255, 0, 0, 1)");
ctx2.fillStyle = grd1;
ctx2.fill();

function click(e) {
  x = e.offsetX;
  y = e.offsetY;
  var imageData = ctx2.getImageData(x, y, 1, 1).data;
  rgbaColor =
    "rgba(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + ",1)";
  fillGradient();
}

function fillGradient() {
  ctx1.fillStyle = rgbaColor;
  ctx1.fillRect(0, 0, width1, height1);

  var grdWhite = ctx2.createLinearGradient(0, 0, width1, 0);
  grdWhite.addColorStop(0, "rgba(255,255,255,1)");
  grdWhite.addColorStop(1, "rgba(255,255,255,0)");
  ctx1.fillStyle = grdWhite;
  ctx1.fillRect(0, 0, width1, height1);

  var grdBlack = ctx2.createLinearGradient(0, 0, 0, height1);
  grdBlack.addColorStop(0, "rgba(0,0,0,0)");
  grdBlack.addColorStop(1, "rgba(0,0,0,1)");
  ctx1.fillStyle = grdBlack;
  ctx1.fillRect(0, 0, width1, height1);
}

function mousedown(e) {
  drag = true;
  changeColor(e);
}

function mousemove(e) {
  if (drag) {
    changeColor(e);
  }
}

function mouseup(e) {
  drag = false;
}

function changeColor(e) {
  x = e.offsetX;
  y = e.offsetY;
  var imageData = ctx1.getImageData(x, y, 1, 1).data;
  rgbaColor =
    "rgba(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + ",1)";
  colorLabel.style.backgroundColor = rgbaColor;
  ctx.strokeStyle = rgbaColor;
}
function returnColor() {
  return rgbaColor;
}
colorStrip.addEventListener("click", click, false);
colorBlock.addEventListener("mousedown", mousedown, false);
colorBlock.addEventListener("mouseup", mouseup, false);
colorBlock.addEventListener("mousemove", mousemove, false);

var slider = document.getElementById("myRange");
ctx.lineWidth = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
  ctx.lineWidth = this.value;
};

function beginPath(strokeObj) {
  ctx.beginPath();
  ctx.moveTo(strokeObj.x, strokeObj.y);
}
function drawStroke(strokeObj) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = strokeObj.color;
  ctx.lineWidth = strokeObj.width;
  ctx.lineTo(strokeObj.x, strokeObj.y);
  ctx.stroke();
}

socket.on("beginPath", (data) => {
  // data -> data from server
  beginPath(data);
});
socket.on("drawStroke", (data) => {
  drawStroke(data);
});
