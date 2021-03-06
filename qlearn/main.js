window.onload = function () {
  width = 600,
  height = 600,
  FPS = 30.0,
  delay = 1000.0 / FPS,
  edge = 50,
  padding = 10,
  canvas = document.getElementById('canvas');

  env = new Environment();
  qlearn = new QLearn(env.statenum, ACTION.LENGTH);
  episode = 0;
  success = 0;
  failed = 0;
  average_walk = 0;
  walked = 0;
  run_background = false;
  running = false;
  is_before_success = false;
  qdiff_total = 0;
  last_qdiff = 0;

  if (!canvas || !canvas.getContext) {
      alert("Not supported");
      return false;
  }
  var ctx1 = canvas.getContext('2d');

  function initialize() {

  }

  function restart(is_success) {
    episode++;
    if (is_success) {
      average_walk = (average_walk*success + walked) / (success+1);
      success++;
    }
    else {
      failed++;
    }
    update_info();
    env.initialize();
    is_before_success = is_success;
    walked = 0;
    last_qdiff = qdiff_total;
    qdiff_total = 0;
  }

  function set_FPS(fps) {
    FPS = (fps >= 1) ? fps : 1;
    delay = 1000/FPS;
  }

  function main_routine() {
    var is_collided = env.state.is_collided(env.walls);
    var is_reached = env.state.is_reached();
    if (is_collided || is_reached) {
      restart(is_reached);
      return;
    }

    var statenow = env.state.to_id();
    var action = qlearn.get_next_action(statenow);
    env.receive_action(action);
    var nextstate = env.state.to_id();
    var nextbestaction = qlearn.select_best_action(nextstate);
    var reward = env.get_reward();
    qlearn.learn(statenow, action, reward, nextstate, nextbestaction);
    qdiff_total += qlearn.lastdiff;
    walked++;
  }

  function loop() {
    if (~run_background) {
      ctx1.clearRect(0, 0, width, height);
      draw_background();
      draw_success_indicator();
      draw_agent();
      draw_opponent();
      draw_target();
      draw_q_indicator_all();
      update_info();
    }
    else {
      delay = 0;
    }
    main_routine();
    setTimeout(loop, delay);
  }

  function draw_background() {
    // draw frame
    var edgex = edge * XLEN, edgey = edge * YLEN;
    ctx1.strokeRect(padd(0), padd(0), edgex, edgey);
    for (var i=1; i<XLEN; i++) {
      ctx1.beginPath();
      ctx1.moveTo(padd(edge * i) , padd(0));
      ctx1.lineTo(padd(edge * i), padd(edgey));
      ctx1.stroke();
    }
    for (var i=0; i<YLEN; i++) {
      ctx1.beginPath();
      ctx1.moveTo(padd(0), padd(edge * i));
      ctx1.lineTo(padd(edgex), padd(edge * i));
      ctx1.stroke();
    }
  }

  function draw_q_indicator_all() {
    for (var s=0; s < env.statenum; s++) {
      var statenow = s;
      var qnow = qlearn.get_q_in_thestate(statenow);
      var minmax = qlearn.get_minmax_q_in_thestate(statenow);
      var pos = Position.to_xy(statenow);
      var x = to_x_window(pos.x) + edge/2;
      var y = to_y_window(pos.y) + edge/2;
      var angle = 2*Math.PI/ACTION.LENGTH;
      ctx1.fillStyle = 'rgb(25, 135, 22)';
      for (var a=0; a < ACTION.LENGTH; a++) {
        var alpha = 0.5;
        if (minmax[0] > minmax[1]) {
          alpha = (qnow[a]-minmax[1])/(minmax[0]-minmax[1]);
        }
        var startangle = -5.0/8*Math.PI + a*Math.PI/4;
        ctx1.globalAlpha = alpha;
        ctx1.beginPath();
        ctx1.moveTo(x, y);
        ctx1.arc(x, y, edge*0.4, startangle, startangle+angle, false);
        ctx1.fill();
      }
    }
    ctx1.globalAlpha = 1;
  }

  function draw_success_indicator() {
    var x_ne = padd(0), y_ne = padd(edge*YLEN);
    var wx = edge*XLEN, hy = padding;
    if (is_before_success) {
      ctx1.fillStyle = 'rgb(171, 255, 127)';
    } else {
      ctx1.fillStyle = 'rgb(229, 0, 49)';
    }
    ctx1.fillRect(x_ne, y_ne, wx, hy);
  }

  function draw_agent() {
    var pos = env.state.myPos;
    var x = to_x_window(pos.x);
    var y = to_y_window(pos.y);
    ctx1.fillStyle = 'rgb(75, 90, 102)';
    ctx1.fillRect(x, y, edge, edge);
  }

  function draw_opponent() {
    var walls = env.walls;
    ctx1.fillStyle = 'rgb(229, 0, 11)';
    for (var i=0; i<walls.length; i++) {
      var x = to_x_window(walls[i].x);
      var y = to_y_window(walls[i].y);
      ctx1.fillRect(x, y, edge, edge);
    }
  }

  function draw_target() {
    var pos = env.state.trPos;
    var x = to_x_window(pos.x);
    var y = to_y_window(pos.y);
    ctx1.fillStyle = 'rgb(255, 241, 15)';
    ctx1.fillRect(x, y, edge, edge);
  }

  function to_x_window(x) {
    return padd(x*edge);
  }

  function to_y_window(y) {
    y = YLEN - y - 1;
    return padd(y*edge);
  }

  function to_x_local(x) {
    return Math.floor((x-padding)/edge);
  }

  function to_y_local(y) {
    var yl = Math.floor((y-padding)/edge);
    return YLEN - yl - 1;
  }

  function padd(org) {
    return org + padding;
  }

  function update_info() {
    var sampleNode=document.getElementById("info");
    infos  = "FPS: " + FPS + " fps<br>";
    infos += "episode: " + episode + "<br>";
    infos += "success: " + success + "<br>";
    infos += "failure: " + failed + "<br>";
    infos += "average_step: " + average_walk.toFixed(2) + "<br>";
    infos += "qdiff: " + last_qdiff.toFixed(2) + "<br>" ;
    infos += "walk: " + walked + "<br>";
    sampleNode.innerHTML=infos;
  }

  prevx = XMAX+1, prevy = YMAX+1;
  function toggle_wall_mousepos(mousex, mousey) {
    var mx = mousex, my = mousey;
    var lx = to_x_local(mx), ly = to_y_local(my);
    if (prevx == lx && prevy == ly) return;
    prevx = lx, prevy = ly;
    env.toggle_wall(new Position(lx, ly));
  }

  function onKeyDown(evt) {
    if (evt.keyCode == 32) {
      toggle_speed_learning();
    }
    else if (evt.keyCode == 38) {
      up_FPS(1);
    }
    else if (evt.keyCode == 40) {
      down_FPS(1);
    }
  }

  function toggle_speed_learning() {
    set_FPS(30);
    run_background = ~run_background;
  }

  function up_FPS(df) {
    FPS+=df; set_FPS(FPS);
  }

  function down_FPS(df) {
    FPS-=df; set_FPS( FPS);
  }

  function onMouseDown(evt) {
    toggle_wall_mousepos(evt.clientX, evt.clientY);
  }

  function onMouseMove(evt) {
    if (!evt.buttons) return;
    toggle_wall_mousepos(evt.clientX, evt.clientY);
  }

  function onMouseUp(evt) {
    prevx = XMAX+1, prevy = YMAX+1;
  }

  document.onkeydown = onKeyDown;
  document.onmousedown = onMouseDown;
  document.onmouseup = onMouseUp;
  document.onmousemove = onMouseMove;
  document.up_FPS = up_FPS;
  document.down_FPS = down_FPS;
  document.toggle_speed_learning = toggle_speed_learning;

  loop();
}
