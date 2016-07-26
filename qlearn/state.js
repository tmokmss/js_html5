var XMIN = 0, XMAX = 7, YMIN = 0, YMAX = 7;
var XLEN = (XMAX-XMIN+1), YLEN = (YMAX-YMIN+1);

function State() {
  this.trPos = new Position(XLEN-2,YLEN-2); // position of target
  this.myPos = new Position(1,1);
}

State.prototype = {
  go_to_next_state : function(action) {
    this.myPos.move(action);
  },
  to_id : function() {
    return this.myPos.to_id();
  },
  get_distance_to_target : function() {
    return this.myPos.get_distance(this.trPos);
  },
  is_collided : function(walls) {
    for (var i=0; i<walls.length; i++) {
      if (this.myPos.equals(walls[i])) {
        return true;
      }
    }
    return false;
  },
  is_reached : function() {
    var trdist = this.myPos.get_distance(this.trPos);
    if (trdist == 0) { return true; }
    return false;
  }
}

function Position(x, y) {
  this.x = x;
  this.y = y;
  arguments.callee.to_xy = function(id) {
    var x = Math.floor(id / YLEN);
    var y = id - x*YLEN;
    return new Position(x, y);
  }
}
Position.prototype = {
  move : function(action) {
    switch (action) {
      case ACTION.N:
        this.x += 0; this.y += 1;
        break;
      case ACTION.NE:
        this.x += 1; this.y += 1;
        break;
      case ACTION.E:
        this.x += 1; this.y += 0;
        break;
      case ACTION.SE:
        this.x += 1; this.y += -1;
        break;
      case ACTION.S:
        this.x += 0; this.y += -1;
        break;
      case ACTION.SW:
        this.x += -1; this.y += -1;
        break;
      case ACTION.W:
        this.x += -1; this.y += 0;
        break;
      case ACTION.NW:
        this.x += -1; this.y += 1;
        break;
    }
    if (this.x < XMIN) this.x = XMIN;
    if (this.x > XMAX) this.x = XMAX;
    if (this.y < YMIN) this.y = YMIN;
    if (this.y > YMAX) this.y = YMAX;
  },
  to_id : function() {
    return YLEN*this.x + this.y;
  },
  get_distance : function(pos) {
    var dx = this.x - pos.x;
    var dy = this.y - pos.y;
    return Math.sqrt(dx*dx + dy*dy);
  },
  equals : function(pos) {
    if (pos.x == this.x && pos.y == this.y) {
      return true;
    }
    return false;
  }
}

var ACTION = {
  N : 0,
  NE : 1,
  E : 2,
  SE : 3,
  S : 4,
  SW : 5,
  W : 6,
  NW : 7,
  LENGTH : 8
}
