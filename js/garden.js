/* Living garden: local artwork, bounded canvas rendering, no dependencies. */
(function () {
  'use strict';
  var hero = document.getElementById('hero');
  var image = hero.querySelector('.hero__bg');
  var canvas = document.getElementById('garden-water');
  if (!image || !canvas) return; // Keep the SVG fallback usable if artwork cannot load.
  var context = canvas.getContext('2d');
  var surface = document.createElement('canvas');
  var surfaceContext = surface.getContext('2d');
  var birds = Array.prototype.slice.call(hero.querySelectorAll('.garden-bird'));
  var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var visible = true;
  var started = false;
  var ready = false;
  var elapsed = 0;
  var previous = 0;
  var lastPaint = 0;
  var frame = 0;
  var width = 0;
  var height = 0;
  var displayWidth = 0;
  var displayHeight = 0;
  var waterStart = 0;
  var waterEnd = 0;
  var birdTop = 0;
  var birdPositions = [];

  function resize() {
    if (!image.naturalWidth || !context || !surfaceContext) return;
    displayWidth = hero.clientWidth;
    displayHeight = hero.clientHeight;
    // Cap resolution instead of multiplying work on high-density phone screens.
    var ratio = Math.min(window.devicePixelRatio || 1, 1.5, 720 / displayWidth);
    width = Math.round(displayWidth * ratio);
    height = Math.round(displayHeight * ratio);
    canvas.width = surface.width = width;
    canvas.height = surface.height = height;
    var scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    var iw = image.naturalWidth * scale;
    var ih = image.naturalHeight * scale;
    surfaceContext.drawImage(image, (width - iw) / 2, (height - ih) / 2, iw, ih);
    // Follow the photographed shoreline when object-fit crops a short screen.
    waterStart = Math.max(0, (height - ih) / 2 + ih * .74);
    waterEnd = Math.min(height, (height - ih) / 2 + ih * .93);
    birdTop = ((height - ih) / 2 + ih * .823) / ratio - displayWidth * .27 * .75 * .833;
    birds.forEach(function (bird) { bird.style.top = birdTop.toFixed(2) + 'px'; });
    var top = (waterStart / height * 100).toFixed(2) + '%';
    var bottom = (waterEnd / height * 100).toFixed(2) + '%';
    var middle = ((waterStart + waterEnd) / 2 / height * 100).toFixed(2) + '%';
    canvas.style.clipPath = 'polygon(8% ' + top + ',92% ' + top + ',94% ' + middle + ',78% ' + bottom + ',22% ' + bottom + ',6% ' + middle + ')';
    var mask = 'linear-gradient(transparent ' + top + ',#000 ' + ((waterStart + 16 * ratio) / height * 100).toFixed(2) + '%,#000 ' + ((waterEnd - 20 * ratio) / height * 100).toFixed(2) + '%,transparent ' + bottom + ')';
    canvas.style.maskImage = canvas.style.webkitMaskImage = mask;
    ready = true;
    paint();
    synchronize();
  }

  function positionBirds() {
    var t = motionPreference.matches ? 20 : elapsed;
    var approach = 1 - Math.pow(1 - Math.min(t / 14, 1), 3);
    birdPositions = birds.map(function (bird, i) {
      var direction = i === 0 ? -1 : 1;
      var x = direction * ((1 - approach) * displayWidth * .22 + 3 + Math.sin(t * .22 + i) * 2);
      var y = Math.sin(t * .9 + i * 1.7) * .8;
      var tilt = Math.sin(t * .55 + i * 2) * .35;
      bird.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotate(' + tilt.toFixed(2) + 'deg)';
      var reflection = bird.querySelector('.garden-bird__reflection');
      reflection.style.opacity = (.21 + Math.sin(t * 1.3 + i) * .025).toFixed(3);
      // Body centroid and the sprite's actual waterline (transparent padding excluded).
      return {
        x: ((i === 0 ? .22 : .51) * displayWidth + displayWidth * .27 * .52 + x) * width / displayWidth,
        y: (birdTop + displayWidth * .27 * .75 * .833 + y) * height / displayHeight
      };
    });
  }

  function paint() {
    if (!ready) return;
    positionBirds();
    context.clearRect(0, 0, width, height);
    var start = Math.floor(waterStart);
    var end = Math.min(height - 2, Math.ceil(waterEnd));
    // Refract the existing lake photograph in fine horizontal bands. The fixed
    // shoreline stays aligned; amplitude grows toward the foreground.
    for (var y = start; y < end; y += 2) {
      var depth = (y - start) / (end - start);
      var shift = Math.sin(y * .12 + elapsed * .7) * depth * 1.8 + Math.sin(y * .035 - elapsed * .4) * .7;
      context.drawImage(surface, 0, y, width, 2, shift, y, width, 2);
    }
    // Perspective-scaled highlights: slow moving glints, no bright sparkle field.
    for (var i = 0; i < 24; i++) {
      var phase = (i * .618 + elapsed * .011) % 1;
      var gy = waterStart + (waterEnd - waterStart) * (.05 + phase * .9);
      var gx = width * (.15 + ((i * .381) % .7));
      var length = (3 + phase * 13) * width / 480;
      var glow = .035 + (Math.sin(elapsed * .6 + i * 2.4) + 1) * .035;
      context.strokeStyle = 'rgba(255,248,213,' + glow.toFixed(3) + ')';
      context.lineWidth = .65;
      context.beginPath();
      context.moveTo(gx - length, gy);
      context.quadraticCurveTo(gx, gy + .8, gx + length, gy);
      context.stroke();
    }
    birdPositions.forEach(function (bird, index) {
      // Expanding wakes travel with each bird instead of floating independently.
      for (var ring = 0; ring < 4; ring++) {
        var progress = (elapsed * .24 + ring / 4 + index * .13) % 1;
        var rx = width * (.085 + progress * .065);
        var ry = height * (.002 + progress * .008);
        context.strokeStyle = 'rgba(255,247,223,' + ((1 - progress) * .24).toFixed(3) + ')';
        context.lineWidth = .75;
        context.beginPath();
        context.ellipse(bird.x, bird.y + progress * 3, rx, ry, 0, 0, Math.PI * 2);
        context.stroke();
      }
      context.fillStyle = 'rgba(65,64,45,.12)';
      context.beginPath();
      context.ellipse(bird.x, bird.y, width * .07, height * .002, 0, 0, Math.PI * 2);
      context.fill();
    });
  }

  function shouldRun() {
    return ready && started && visible && !motionPreference.matches && !document.hidden;
  }
  function animate(now) {
    frame = 0;
    if (!shouldRun()) return;
    if (previous) elapsed += Math.min((now - previous) / 1000, .08);
    previous = now;
    if (now - lastPaint >= 1000 / 30) {
      paint();
      lastPaint = now;
    }
    frame = requestAnimationFrame(animate);
  }
  function synchronize() {
    document.body.classList.toggle('scene-paused', !started || !visible || document.hidden || motionPreference.matches);
    document.body.classList.toggle('tab-hidden', document.hidden);
    if (shouldRun() && !frame) {
      previous = 0;
      frame = requestAnimationFrame(animate);
    } else if (!shouldRun()) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    }
  }

  window.addEventListener('invitation:opened', function () { started = true; synchronize(); });
  document.addEventListener('visibilitychange', synchronize);
  function preferenceChanged() {
    paint();
    synchronize();
  }
  if (motionPreference.addEventListener) motionPreference.addEventListener('change', preferenceChanged);
  else if (motionPreference.addListener) motionPreference.addListener(preferenceChanged);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; synchronize(); }).observe(hero);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
  else window.addEventListener('resize', resize);
  image.addEventListener('load', resize);
  if (image.complete) resize();
  synchronize();
})();
