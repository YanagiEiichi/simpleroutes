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
  var Joint = function(context, routes, value) {
    this.context = context = context || {};
    this.routes = routes = routes || [];
    this.value = value || '';
    routes.forEach(function(route) { route.enter(context); });
  };
  Joint.prototype = {};
  Joint.prototype.destroy = function() {
    while(this.routes.length) this.routes.pop().leave(this.context);
  }; 
  Joint.prototype.toString = function() { return this.value; }; 

  // 路径类
  var Path = function() {};
  Path.prototype = [ new Joint() ];
  Path.prototype.top = function() { return this[this.length - 1]; };
  Path.prototype.add = function(routes, value) {
    routes = (routes || []).filter(Route.filter);
    this.push(new Joint(this.top().context, routes, value));
  };
  Path.prototype.cut = function(pos) {
    while(this.length > pos) this.pop().destroy();
  };

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
