function QLearn(statenum, actionnum) {
  this.snum = statenum;
  this.anum = actionnum;
  this.q = new Array(statenum*actionnum);
  this.ALPHA = 0.1; // 学習率
  this.EPSILON = 0.0; // 探査率
  this.GAMMA = 0.9;  // 割引率
  this.lastdiff = 0;

  for (var i=0; i < this.q.length; i++) {
    this.q[i] = 0;
  }
}
QLearn.prototype = {
  qidx : function(s, a) {
    return this.anum*s + a;
  },
  learn : function(s, a, r, s_next, a_next) {
    var lastq = this.q[this.qidx(s,a)];
    this.q[this.qidx(s,a)] += this.ALPHA *
        (r + this.GAMMA * this.q[this.qidx(s_next, a_next)] - this.q[this.qidx(s, a)]);
    this.lastdiff = this.q[this.qidx(s,a)] - lastq;
  },
  select_best_action : function(stateidnow) {
    var s = stateidnow;
    var best_a = 0;
    var bests = [];
    for (var a = best_a+1; a < ACTION.LENGTH; a++) {
      var qnow = this.q[this.qidx(s, a)], qbest = this.q[this.qidx(s, best_a)];
      if (qnow > qbest) {
        best_a = a;
        bests = [a];
      }
      else if (qnow == qbest) {
        bests.push(a);
      }
    }
    if (bests.length > 1) {
      best_a = bests[Math.floor(Math.random() * bests.length)];
    }
    return best_a;
  },
  get_next_action : function(stateidnow) {
    if (Math.random() < this.EPSILON) {
      var minmax = this.get_minmax_q_in_thestate(stateidnow);
      var mag = Math.max(Math.abs(minmax[0]), Math.abs(minmax[1]));
      for (var a = 0; a < ACTION.LENGTH; a++) {
        this.q[this.qidx(stateidnow, a)] += (Math.random()-0.5)*mag;
      }
    }
    var action = this.select_best_action(stateidnow);
    return action;
  },
  get_minmax_q_in_thestate : function(state) {
    var max=this.q[this.qidx(state, 0)], min=max;
    for (var a = 1; a < ACTION.LENGTH; a++) {
      if (this.q[this.qidx(state, a)] > max) {
        max = this.q[this.qidx(state, a)];
      }
      else if (this.q[this.qidx(state, a)] < min) {
        min = this.q[this.qidx(state, a)];
      }
    }
    return [max, min];
  },
  get_q_in_thestate : function(state) {
    var qn = new Array(ACTION.LENGTH);
    for (var a=0; a < ACTION.LENGTH; a++) {
      qn[a] = this.q[this.qidx(state, a)];
    }
    return qn;
  }
}
