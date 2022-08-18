app.controller("loja", function(
  $scope,
  $rootScope,
  $http,
  $location,
  config,
  $routeParams,
  $route
) {
  let campos_remove = [
    "email_cliente",
    "nome_cliente",
    "fone_cliente",
    "endereco1"
  ];
  $scope.job = {
    bairro: null,
    cep: null,
    cidade: null,
    complemento: null,
    cpf: null,
    cnpj: null,
    razao_social: null,
    nome_fantasia: null,
    dh_agendamento_cliente: null,
    duracao_atendimento: null,
    email: null,
    email_cliente: null,
    endereco1: null,
    estado: null,
    fone: null,
    id_pedido: null,
    latitude: null,
    logradouro: null,
    longitude: null,
    nome: null,
    nome_cliente: null,
    numero: null,
    qtd_servico: null,
    servicos_comprados: null,
    tipo_pessoa: undefined,
    token: null,
    total_compra: null
  };

  function remove(obj, to_remove) {
    Object.entries(obj).forEach(([k, v]) => {
      if (to_remove.indexOf(k) >= 0) delete obj[k];
    });
    return obj;
  }
  function serializa(dados) {
    let a = dados.split("\n");
    $scope.job.servicos_comprados = [];
    for (let i = 0; i < a.length; i++) {
      $scope.job.servicos_comprados.push(a[i].split("x ", -1));
    }
  }

  $scope.get_geolocalizacao = function() {
    $rootScope.get_geolocation($scope.job, $scope);
  };

  $scope.get = function(query) {
    $http({
      url:
        config.base_url +
        "/loja/agendamento?token=" +
        escape(query.token) +
        "&sig=" +
        escape(query.sig),
      method: "GET"
    })
      .success(function(data, status) {
        $scope.job = Object.assign($scope.job, data.dados);
        serializa($scope.job.servicos_comprados);
        $scope.job.nome = data.dados.nome_cliente;
        $scope.job.email = data.dados.email_cliente;
        $scope.job.fone = data.dados.fone_cliente ? data.dados.fone_cliente.replace(/[^\d]/g, "") : '';
        $scope.job.tipo_pessoa = $scope.job.razao_social
          ? "juridica"
          : "fisica";
        $scope.job.cep = $scope.job.cep ? $scope.job.cep .replace(/[^\d]/g, "") : '';
        $rootScope.busca_cep($scope.job.cep, $scope.job, "numero");
      })
      .error(function(data, status) {
        $scope.agendamento = [];
        $rootScope.mostra_mensagem_nova({
          status: "erro",
          icone: "bad.svg",
          titulo: "Algo deu errado.",
          mensagem: data.erro,
          url_destino: config.loja[config.app_mode].url
        });
      });
  };

  $scope.configura_msg = () => {
    let data = new Date($scope.job.dh_agendamento_cliente)
    let dia = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"][data.getDay()];
    $scope.confirmacao_msg = 'Deseja agendar este atendimento para '+ dia +', '+ data.toLocaleString() +'?'
  }
  $scope.grava = function() {
    let job = $scope.job
    job = remove(job, campos_remove);
    $http({
      url: 
        config.base_url +
        "/loja/agendamento?token=" +
        escape($routeParams.token) +
        "&sig=" +
        escape($routeParams.sig),
      method: "POST",
      data: job
    })
      .success(function(data, status) {
        $scope.job = [];
        $rootScope.mostra_mensagem_nova({
          status: "sucesso",
          titulo: data.msg,
          icone: "good.svg",
          url_destino: config.loja[config.app_mode].url
        });
      })
      .error(function(data, status) {
        $rootScope.mostra_mensagem_nova({
          status: "erro",
          icone: "bad.svg",
          titulo: "Algo deu errado.",
          mensagem: data.erro
        });
      });
  };

  if ($route.current.originalPath == "/loja/agendamento")
    $scope.get($routeParams);
});
