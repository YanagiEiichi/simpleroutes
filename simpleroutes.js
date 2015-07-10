var SimpleRoutes;
void function() {

  // 路由类
  var Route = function(expression, enter, leave) {
    this.matchers = expression.split('/').map(function(rule) { return RegExp('^' + rule + '$'); });
    this.enter = enter || function() {};
    this.leave = leave || function() {};
  }
  Route.filter = function(route) { return route.match(location.pathname); };
  Route.prototype.match = function(uri) {
    var matchers = this.matchers;
    var path = uri.split('/');
    return matchers.every(function(matcher, index) {
      return index in path && matcher.test(path[index]);
    });
  };

  // 节点类
  var Joint = function(base, routes, value) {
    var context = this.context = base.top().context || {};
    this.routes = routes || [];
    this.value = value || '';
    base.push(this);
    this.routes.forEach(function(route) { route.enter(context); });
  };
  Joint.prototype = {};
  Joint.prototype.destroy = function() {
    while(this.routes.length) this.routes.pop().leave(this.context);
  }; 
  Joint.prototype.toString = function() { return this.value; }; 

  // 路径类
  var Path = function() {};
  Path.prototype = [];
  Path.prototype.top = function() { return this[this.length - 1] || {}; };
  Path.prototype.add = function(routes, value) {
    void new Joint(this, (routes || []).filter(Route.filter), value);
  };
  Path.prototype.cut = function(pos) {
    while(this.length > pos) {
      this.top().destroy();
      this.pop();
    }
  };
  void new Joint(Path.prototype); 

  // 堆
  var current = '';
  var levels = [];
  var update = function() {
    var res = current.split('/');
    var des = location.pathname.split('/');
    var start = 0;
    while(start in res && start in des && res[start] === des[start]) start++;
    SimpleRoutes.cut(start);
    for(var i = start; i < des.length; i++) SimpleRoutes.add(levels[i], des[i]);
    current = location.pathname;
    emit('change');
  };

  // 接口抽象类
  SimpleRoutes = new Path();
  SimpleRoutes.when = function(expression, enter, leave) {
    var route = new Route(expression, enter, leave); 
    var level = route.matchers.length - 1;
    levels[level] = levels[level] || [];
    levels[level].push(route);
    return this;
  };
  SimpleRoutes.navigate = function(path) {
    history.pushState(null, null, path);
  };

  // 提供事件支持
  var events = { change: [] };
  var emit = function(name, args) {
    var list = events[name];
    list.forEach(function(handler) {
      handler.apply(null, args);
    });
  };
  SimpleRoutes.on = function(name, handler) {
    var list = events[name];
    if(!list) return;
    list.push(handler);
  };

  // 初始化
  update();

  // 劫持并绑定事件
  var pushState = history.pushState;
  if(pushState) {
    history.pushState = function(state, name, path) {
      pushState.apply(history, arguments);
      update();
    }
    addEventListener('popstate', function(e) {
      update();
    });
  }

}();
