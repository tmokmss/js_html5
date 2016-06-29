function Environment() {
  this.statenum = Math.pow(XLEN*YLEN, 2);
  this.actnum = ACTION.LENGTH;
  this.wall = [];

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
    var is_collided = this.state.is_collided();
    var reward = 0;

    if (now_distance == 0) {
      reward = 50;
    }
    else if (is_collided) {
      reward = -1000;
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
  }
}
