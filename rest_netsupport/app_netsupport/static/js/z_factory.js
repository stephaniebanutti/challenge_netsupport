app.factory('adicionaVersao', function(config){
        return {
            'request': function(cfg){
                if (cfg.url.indexOf('.html') != -1 && cfg.url.indexOf('tpl.html') == -1){
                    if (config && config.app_version){
                        cfg.url = cfg.url + '?v='+config.app_version
                    }
                    else{
                        cfg.url = cfg.url + '?v='+Date.now()
                    }
                }
                return cfg
            }
        }
    })
    .config(function($httpProvider){
        $httpProvider.interceptors.push('adicionaVersao')
    })
