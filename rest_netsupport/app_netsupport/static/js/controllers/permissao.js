app.controller("permissao", function ($scope, $rootScope, $http, $location, config, $route, $routeParams) {

    let id_grupo = $routeParams.id_grupo

    $scope.get = function(){
        $scope.grupo = {}
        $http({
            url: config.base_url + '/grupo/' + id_grupo,
            method: 'GET'
        }).success(function(data, status) {
            $scope.grupo = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
        $scope.lista()
    }

    $scope.lista = function() {
        $scope.funcionalidade = []
        $scope.permissao_grupo = []
        let filtros = {"menu": "S"}
        $http({
            url: config.base_url + "/funcionalidade/lista",
            method: 'POST',
            data: filtros
        }).success(function(data, status) {
            $scope.funcionalidade = data
            let filtro = {"id_grupo": id_grupo}
            $http({
                url: config.base_url + '/permissao_grupo/lista',
                method: 'POST',
                data: filtro
            }).success(function(data, status) {
                $scope.permissao_grupo = data;
                $scope.permissao_grupo.filter(function(permissao_grupo) {
                  return $scope.funcionalidade.filter(function(funcionalidade){
                      if(funcionalidade.id == permissao_grupo.id_funcionalidade){
                          let id_funcionalidade =  $scope.funcionalidade.indexOf(funcionalidade)
                          $scope.funcionalidade.splice(id_funcionalidade, 1)
                      }
                  })
                });
            })
            .error(function (data, status) {
                if (status != 404)
                    $rootScope.erro_portal(data, status)
            })
        })
        .error(function (data, status) {
            if (status != 404)
                $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function (funcionalidade) {
        $http({
            url: config.base_url + '/permissao_grupo',
            method: 'POST',
            data : {id_grupo: id_grupo, id_funcionalidade: funcionalidade.id}
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista(id_grupo)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.deleta = function (funcionalidade) {
        $http({
            url: config.base_url + '/permissao_grupo/' + funcionalidade.id,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista();
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        });
    }
    $scope.get(id_grupo)


});
