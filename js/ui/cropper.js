// Photo cropper for the ball's appearance: pick any image, drag and zoom it
// so the face sits inside the circle, and only that circle goes on the ball.
"use strict";

var CROP_OUTPUT = 256;     // size in pixels of the saved, cropped ball image
var CROP_CIRCLE = 0.84;    // circle diameter as a share of the crop stage

var cropCanvas = document.getElementById("cropCanvas");
var cropCtx = cropCanvas.getContext("2d");
var cropZoomEl = document.getElementById("cropZoom");

// Current crop session. img = the photo being cropped; cx/cy = the photo point
// at the circle's center; zoom = 1 means the photo just covers the circle.
var crop = null;
// The full original photo from this editing session, so "Adjust crop" can
// zoom back out past the last crop. Not saved with the character.
var cropOriginal = null;

function resetCropper() {
  crop = null;
  cropOriginal = null;
  document.getElementById("cropper").hidden = true;
  updateRecropButton();
}

function updateRecropButton() {
  document.getElementById("fImgRecrop").hidden = !(editState && editState.imgData);
}

// Loads any image file the browser can read (PNG, JPEG, WebP, GIF...).
function readImageFile(file, onImage) {
  if (!file || !/^image\//.test(file.type)) return;
  var reader = new FileReader();
  reader.onload = function () {
    var im = new Image();
    im.onload = function () { onImage(im, file.type); };
    im.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function openCropper(img, keepsTransparency) {
  crop = {
    img: img,
    cx: img.naturalWidth / 2,
    cy: img.naturalHeight / 2,
    zoom: 1,
    alpha: keepsTransparency
  };
  cropZoomEl.value = 1;
  document.getElementById("cropper").hidden = false;
  drawCrop();
  document.getElementById("cropper").scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
}

// Photo pixels per stage pixel at the current zoom.
function cropScale() {
  var circle = cropCanvas.width * CROP_CIRCLE;
  var shortSide = Math.min(crop.img.naturalWidth, crop.img.naturalHeight);
  return (circle / shortSide) * crop.zoom;
}

// Keeps the circle fully covered by the photo.
function clampCrop() {
  var half = (cropCanvas.width * CROP_CIRCLE / 2) / cropScale();
  var w = crop.img.naturalWidth, h = crop.img.naturalHeight;
  crop.cx = Math.min(w - half, Math.max(half, crop.cx));
  crop.cy = Math.min(h - half, Math.max(half, crop.cy));
}

function drawCrop() {
  if (!crop) return;
  clampCrop();
  var size = cropCanvas.width, s = cropScale();
  cropCtx.setTransform(1, 0, 0, 1, 0, 0);
  cropCtx.clearRect(0, 0, size, size);
  cropCtx.drawImage(crop.img,
    size / 2 - crop.cx * s, size / 2 - crop.cy * s,
    crop.img.naturalWidth * s, crop.img.naturalHeight * s);

  // Dim everything outside the circle, then outline the circle.
  var r = size * CROP_CIRCLE / 2;
  cropCtx.fillStyle = "rgba(0, 0, 0, 0.55)";
  cropCtx.beginPath();
  cropCtx.rect(0, 0, size, size);
  cropCtx.arc(size / 2, size / 2, r, 0, Math.PI * 2, true);
  cropCtx.fill();
  cropCtx.lineWidth = 4;
  cropCtx.strokeStyle = "#ffffff";
  cropCtx.setLineDash([12, 10]);
  cropCtx.beginPath(); cropCtx.arc(size / 2, size / 2, r, 0, Math.PI * 2); cropCtx.stroke();
  cropCtx.setLineDash([]);
}

function setCropZoom(z) {
  if (!crop) return;
  crop.zoom = Math.min(parseFloat(cropZoomEl.max), Math.max(1, z));
  cropZoomEl.value = crop.zoom;
  drawCrop();
}

// Renders just the circle's contents into a small square image for the ball.
function finishCrop() {
  var out = document.createElement("canvas");
  out.width = CROP_OUTPUT; out.height = CROP_OUTPUT;
  var o = out.getContext("2d");
  var srcSize = (cropCanvas.width * CROP_CIRCLE) / cropScale();
  if (!crop.alpha) { o.fillStyle = editState.color || "#888888"; o.fillRect(0, 0, CROP_OUTPUT, CROP_OUTPUT); }
  o.drawImage(crop.img, crop.cx - srcSize / 2, crop.cy - srcSize / 2, srcSize, srcSize, 0, 0, CROP_OUTPUT, CROP_OUTPUT);
  // Photos save as JPEG to keep saved characters small; images with
  // transparency (PNG, WebP, GIF) stay PNG so cut-outs keep their edges.
  return crop.alpha ? out.toDataURL("image/png") : out.toDataURL("image/jpeg", 0.9);
}

// ---- dragging and pinching on the stage ----
var cropPointers = {};
var pinchStart = null;

function stagePoint(e) {
  var rect = cropCanvas.getBoundingClientRect();
  var k = cropCanvas.width / rect.width;
  return { x: (e.clientX - rect.left) * k, y: (e.clientY - rect.top) * k };
}

cropCanvas.addEventListener("pointerdown", function (e) {
  if (!crop) return;
  cropPointers[e.pointerId] = stagePoint(e);
  try { cropCanvas.setPointerCapture(e.pointerId); } catch (err) {}
  cropCanvas.classList.add("dragging");
  var ids = Object.keys(cropPointers);
  if (ids.length === 2) {
    var a = cropPointers[ids[0]], b = cropPointers[ids[1]];
    pinchStart = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: crop.zoom };
  }
  e.preventDefault();
});

cropCanvas.addEventListener("pointermove", function (e) {
  if (!crop || !cropPointers[e.pointerId]) return;
  var p = stagePoint(e), prev = cropPointers[e.pointerId];
  cropPointers[e.pointerId] = p;
  var ids = Object.keys(cropPointers);
  if (ids.length >= 2 && pinchStart) {
    var a = cropPointers[ids[0]], b = cropPointers[ids[1]];
    setCropZoom(pinchStart.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / pinchStart.dist));
    return;
  }
  var s = cropScale();
  crop.cx -= (p.x - prev.x) / s;
  crop.cy -= (p.y - prev.y) / s;
  drawCrop();
});

function endCropPointer(e) {
  delete cropPointers[e.pointerId];
  if (Object.keys(cropPointers).length < 2) pinchStart = null;
  if (!Object.keys(cropPointers).length) cropCanvas.classList.remove("dragging");
}
cropCanvas.addEventListener("pointerup", endCropPointer);
cropCanvas.addEventListener("pointercancel", endCropPointer);

cropCanvas.addEventListener("wheel", function (e) {
  if (!crop) return;
  e.preventDefault();
  setCropZoom(crop.zoom * Math.exp(-e.deltaY * 0.0015));
}, { passive: false });

cropZoomEl.addEventListener("input", function () { setCropZoom(parseFloat(cropZoomEl.value)); });

// ---- wiring to the editor's ball appearance field ----
document.getElementById("fImg").addEventListener("change", function (e) {
  var file = e.target.files && e.target.files[0];
  readImageFile(file, function (img, type) {
    cropOriginal = { img: img, alpha: /png|webp|gif/.test(type) };
    openCropper(img, cropOriginal.alpha);
  });
});

document.getElementById("fImgRecrop").addEventListener("click", function () {
  if (cropOriginal) { openCropper(cropOriginal.img, cropOriginal.alpha); return; }
  if (!editState.imgData) return;
  // No original this session (character saved earlier): re-crop the saved image.
  var im = new Image();
  im.onload = function () { openCropper(im, /^data:image\/png/.test(editState.imgData)); };
  im.src = editState.imgData;
});

document.getElementById("cropUse").addEventListener("click", function () {
  if (!crop) return;
  var dataUrl = finishCrop();
  editState.imgData = dataUrl;
  document.getElementById("fThumb").style.backgroundImage = "url(" + dataUrl + ")";
  document.getElementById("cropper").hidden = true;
  document.getElementById("fImg").value = "";
  crop = null;
  updateRecropButton();
});

document.getElementById("cropCancel").addEventListener("click", function () {
  document.getElementById("cropper").hidden = true;
  document.getElementById("fImg").value = "";
  crop = null;
});

document.getElementById("fImgClear").addEventListener("click", function () {
  editState.imgData = null;
  document.getElementById("fThumb").style.backgroundImage = "";
  document.getElementById("fImg").value = "";
  resetCropper();
});
