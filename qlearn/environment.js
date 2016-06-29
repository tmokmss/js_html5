function Environment() {
  this.statenum = Math.pow(XLEN*YLEN, 2);
  this.actnum = ACTION.LENGTH;
  this.walls = [new Position(1,2), new Position(3,3)];

  this.initialize();
}

Environment.prototype = {
  initialize : function() {
    this.state = new State();
    this.prev_distance = this.state.get_distance_to_target();
  },
  receive_action : function(action) {
    this.prev_distance = this.state.get_distance_to_target();
    this.state.go_to_next_state(action);
  },
  get_reward : function() {
    var now_distance = this.state.get_distance_to_target();
    var is_collided = this.state.is_collided(this.walls);
    var reward = 0;

    if (now_distance == 0) {
      reward = 50;
    }
    else if (is_collided) {
      reward = -100;
    }
    /*
    else if (now_distance < this.prev_distance) {
      reward = 0;//(this.prev_distance - now_distance)*2;
    }
    else if (now_distance > this.prev_distance) {
      reward = 0;//-2;
    }
    else if (now_distance = this.prev_distance) {
      reward = 0;//-1;
    }*/
    else {
      reward = -1;
    }
    return reward;
  },
  toggle_wall : function(wall) {
    if (wall.x < XMIN || wall.x > XMAX) return;
    if (wall.y < YMIN || wall.y > YMAX) return;
    for (var i=0; i < this.walls.length; i++) {
      if (this.walls[i].equals(wall)) {
        this.walls.splice(i, 1);
        return;
      }
    }
    this.walls.unshift(wall);
  }
}
