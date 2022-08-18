app.controller("sso", function ($scope, $routeParams, $rootScope, $window) {
  let dest = $rootScope.usuario_logado.url+'/portal/sso/discourse?sso='+$routeParams.sso+'&sig='+$routeParams.sig
  $window.location.href = dest
})
