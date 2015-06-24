## Simple Routes

#### Usage

```
SimpleRoutes.when('/a', function() {
  console.log('enter "/a"');
}, function() {
  console.log('leave "/a"');
});

SimpleRoutes.when('/a/b', function() {
  console.log('enter "/a/b"');
}, function() {
  console.log('leave "/a/b"');
});

SimpleRoutes.navigate('/a');
// enter "/a"

SimpleRoutes.navigate('/a/b');
// enter "/a/b"

SimpleRoutes.navigate('/a/b');
// leave "/a/b"
// leave "/a"
```
