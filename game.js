// Minimal runnable runner game
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let W = canvas.width, H = canvas.height;
  let last = 0, dt = 0, acc = 0;
  let score = 0, speed = 200; // px/s
  let running = true;
  const gravity = 1200;

  const player = {
    x: 80, y: H - 52, w: 36, h: 48,
    vy: 0, onGround: true,
    draw() {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(this.x, this.y, this.w, this.h);
    },
    jump() {
      if (this.onGround) { this.vy = -520; this.onGround = false; }
    },
    update(dt) {
      this.vy += gravity * dt;
      this.y += this.vy * dt;
      if (this.y + this.h >= H - 20) {
        this.y = H - 20 - this.h;
        this.vy = 0;
        this.onGround = true;
      }
    }
  };

  const obstacles = [];
  function spawnObstacle() {
    const h = 20 + Math.random()*50;
    obstacles.push({ x: W + 40, y: H - 20 - h, w: 20 + Math.random()*30, h, passed:false });
  }

  let spawnTimer = 0;

  function reset() {
    obstacles.length = 0;
    score = 0;
    speed = 200;
    player.y = H - 52; player.vy = 0; player.onGround = true;
    running = true;
  }

  function update(t) {
    if (!last) last = t;
    dt = (t - last) / 1000;
    last = t;
    if (dt > 0.1) dt = 0.1;
    if (!running) { draw(); requestAnimationFrame(update); return; }

    // spawn logic
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnObstacle();
      spawnTimer = 0.9 + Math.random()*0.9 - Math.min(score/1000,0.6);
    }

    // update
    player.update(dt);
    for (let i = obstacles.length-1; i >= 0; --i) {
      const ob = obstacles[i];
      ob.x -= speed * dt;
      if (!ob.passed && ob.x + ob.w < player.x) { score += 10; ob.passed = true; speed += 2; }
      if (ob.x + ob.w < -50) obstacles.splice(i,1);
      // collision
      if (player.x < ob.x + ob.w && player.x + player.w > ob.x && player.y < ob.y + ob.h && player.y + player.h > ob.y) {
        running = false;
      }
    }

    draw();
    requestAnimationFrame(update);
  }

  function draw() {
    // clear
    ctx.clearRect(0,0,W,H);
    // sky gradient
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#87ceeb'); g.addColorStop(1,'#0b1220');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

    // ground
    ctx.fillStyle = '#0d1723';
    ctx.fillRect(0, H-20, W, 20);

    // player
    player.draw();

    // obstacles
    ctx.fillStyle = '#374151';
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(8,8,120,34);
    ctx.fillStyle = '#fff';
    ctx.font = '16px system-ui';
    ctx.fillText('Score: ' + Math.max(0,score), 14, 30);

    if (!running) {
      ctx.fillStyle = 'rgba(2,6,23,0.7)';
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle = '#fff';
      ctx.font = '28px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W/2, H/2 - 8);
      ctx.font = '16px system-ui';
      ctx.fillText('Press Space or Tap to restart', W/2, H/2 + 20);
      ctx.textAlign = 'left';
    }
  }

  // input
  window.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      if (running) player.jump(); else { reset(); }
    }
  });
  canvas.addEventListener('pointerdown', e => {
    if (running) player.jump(); else { reset(); }
  });

  // resize handling
  function resize() {
    const rect = canvas.getBoundingClientRect();
    // keep internal resolution fixed for simplicity
    W = canvas.width;
    H = canvas.height;
  }
  window.addEventListener('resize', resize);
  resize();

  // start loop
  requestAnimationFrame(update);

  // expose for debugging
  window.__aladdin = { reset, player, obstacles };
})();
