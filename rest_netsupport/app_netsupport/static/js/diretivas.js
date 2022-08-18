app.directive("datahora", function(){
    return {
        restrict: 'A',
        require: "ngModel",
        link : date_hora_link,
    }

    function date_hora_link(scope, element, attrs, ngModel){
        var formato_data_hora = attrs['datahora']
        var data_regex = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d{0,6})?$/
        switch(formato_data_hora){
            case 'dd/MM/yyyy HH:mm:ss.us':
                var tam_dh = 26
            break
            case 'dd/MM/yyyy HH:mm:ss':
                var tam_dh = 19
            break
            case 'dd/MM/yyyy HH:mm':
                var tam_dh = 16
            break
            default:
                alert("Formato de data inválido: "+formato_data_hora)
                return null
        }

        ngModel.$formatters.push(formata_data_hora)

        function inverte_data_hora(data, separador, novo_separador){
            var vet_dh = data.split("T")
            var vet_data = vet_dh[0].split(separador)
            return vet_data[2]+novo_separador+vet_data[1]+novo_separador+vet_data[0]+" "+vet_dh[1]
        }

        function formata_data_hora(data){
            if (data_regex.test(data) && !isNaN(Date.parse(data))){
                // Data é válida no formato yyyy-MM-dd
                return inverte_data_hora(data.substring(0, tam_dh), '-', '/')
            }
            else
                return data
        }
    }
})

app.directive('googleMapa', function() {

    var google_mapas = function(scope, element, attrs) {
        var map, infoWindow, novo_zoom, novo_center, url
        var markers = []
        var zoom = 4.3
        var center = {lat:-15.721751, lng : -48.0073978}

        var opcoes_mapa = {
            center: new google.maps.LatLng(center),
            zoom: zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: true,
            streetViewControl: false
        }

        function null2str_vazia(string) {
            return string ? string : ''
		}

		function tipo_url() {
            if(scope.usuario.perfil == 'doutor')
                return '#/supporter/job/detalha/'
            else if(scope.usuario.perfil == 'cliente')
                return '#/cliente/job/detalha/'
            else
                return '#/job/detalha/'
		}

        function inicia_mapa() {
            if (map === void 0) {
                map = new google.maps.Map(element[0], opcoes_mapa)

                var icons = [
                    {nome: 'Aberto',                icon: 'aberto_verde',                 grayscale: 'grayscale'},
                    {nome: 'Com Gestor',            icon: 'com_gestor_verde',             grayscale: 'grayscale'},
                    {nome: 'Categorizado',          icon: 'categorizacao_verde',          grayscale: 'grayscale'},
                    {nome: 'Divulgado',             icon: 'divulgacao_verde',             grayscale: 'grayscale'},
                    {nome: 'Com Doutor',            icon: 'com_doutor_verde',             grayscale: 'grayscale'},
                    {nome: 'Doutor em trânsito',    icon: 'doutor_transito_verde',        grayscale: 'grayscale'},
                    {nome: 'Doutor no local',       icon: 'doutor_local_verde',           grayscale: 'grayscale'},
                    {nome: 'Atendimento encerrado', icon: 'atendimento_encerrado_verde',  grayscale: 'grayscale'},
                    {nome: 'Validado com sucesso',  icon: 'valido_sucesso_verde',         grayscale: 'grayscale'},
                    {nome: 'Falha validação',       icon: 'valido_erro_verde',            grayscale: 'grayscale'},
                    {nome: 'Fechado',               icon: 'fechado_verde',                grayscale: 'grayscale'},
                    {nome: '',                      icon: 'graduacao_sla',                style: 'width: 220px;margin-top:10px', style_div: 'float:right !important;'}
                ]
                for (var key in icons) {""
                    var div = document.createElement('div')
                    div.innerHTML = '<div class="text-center" style="'+icons[key].style_div+'"><img  style="'+icons[key].style+'" class="'+icons[key].grayscale+'" src="/img/mapas/' + icons[key].icon + '.png"><br>' + icons[key].nome.replace("Doutor", "Supporter") + '</div>'
                    legenda.appendChild(div)
                }

                map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legenda)
                google.maps.event.addListener(map, 'tilesloaded', function() {
                    jQuery('#legenda').css('display', 'inline-flex')
                })
            }
        }

        function seta_marcador(map, position, title, content, icon, status) {
            var marker = []
            var markerOptions = {
                position: position,
                map: map,
                title: title,
                icon: '/img/mapas/'+icon+'_'+status+'.png',
                status: status
            }

            var marker = new google.maps.Marker(markerOptions)
            markers.push(marker)

            google.maps.event.addListener(marker, 'click', function () {
                if (infoWindow !== void 0) {
                    infoWindow.close()
                }
                var infoWindowOptions = {
                    content: content
                }
                infoWindow = new google.maps.InfoWindow(infoWindowOptions)
                infoWindow.open(map, marker)
            })
        }

        function reseta_centro(qtd_jobs){
            if(scope.reseta) {
                // Centraliza e ajusta zoom do mapa, quando usuário altera.
                google.maps.event.addListener(map, 'click', function () {
                    novo_zoom = map.getZoom()
                    novo_center = {lat: map.getCenter().lat(), lng: map.getCenter().lng()}
                })
                google.maps.event.addListener(map, 'center_changed', function () {
                    novo_zoom = map.getZoom()
                    novo_center = {lat: map.getCenter().lat(), lng: map.getCenter().lng()}
                })
                google.maps.event.addListener(map, 'zoom_changed', function () {
                    novo_zoom = map.getZoom()
                    novo_center = {lat: map.getCenter().lat(), lng: map.getCenter().lng()}
                })
            }
            if(!scope.reseta || qtd_jobs) {
                novo_center = false
                scope.reseta = true
            }
        }


        // Reseta o auto centraliza e auto zoom do mapa.
        scope.$watch("reseta", function () {
            reseta_centro(false)
        })


        // Habilita ou não as referências do mapa.
        scope.$watch("referencias", function () {
            let saturacao
            if(scope.referencias == "off"){ saturacao = -100 } else { saturacao = 0 }
            map.setOptions({
                styles:[
                    {"featureType": "poi.attraction","stylers": [{"visibility": scope.referencias}]},
                    {"featureType": "poi.business","stylers": [{"saturation": saturacao},{"lightness": saturacao},{"visibility": scope.referencias}]},
                    {"featureType": "poi.government","stylers": [{"visibility": scope.referencias}]},
                    {"featureType": "poi.medical","stylers": [{"visibility": scope.referencias}]},
                    {"featureType": "poi.park","stylers": [{"visibility": scope.referencias}]},
                    {"featureType": "poi.place_of_worship","elementType": "geometry.fill","stylers": [{"visibility": scope.referencias}]},
                    {"featureType": "poi.school","stylers": [{"visibility": scope.referencias}]},
                    {"featureType": "poi.school","elementType": "labels.icon","stylers": [{"visibility": scope.referencias}]},
                    {"featureType": "poi.sports_complex","stylers": [{"visibility": scope.referencias}]}
                ]
            })
        })


        scope.$watch("jobs",function() {

            if(scope.jobs.length != 0) {
                reseta_centro(true)

                if (markers){
                    markers = []
                }

                var limites = new google.maps.LatLngBounds();
                var hora_atual = new Date()

                for (let i in scope.jobs) {
                    var localizacao, status, color, icon
                    localizacao = {lat:scope.jobs[i].latitude,lng:scope.jobs[i].longitude}

                    if(scope.jobs[i].sla_vencido == 'sim') {
                        status = 'vermelho';  color = '#d9544f'
                    } else { status = 'verde'; color = '#5db75d' }

                    switch(scope.jobs[i].status) {
                        case 'Aberto': icon = 'aberto'; break;
                        case 'Com Gestor': icon = 'com_gestor'; break;
                        case 'Categorizado': icon = 'categorizacao'; break;
                        case 'Divulgado': icon = 'divulgacao'; break;
                        case 'Com Doutor': icon = 'com_doutor'; break;
                        case 'Doutor em trânsito': icon = 'doutor_transito'; break;
                        case 'Doutor no local': icon = 'doutor_local'; break;
                        case 'Atendimento encerrado': icon = 'atendimento_encerrado'; break;
                        case 'Validado com sucesso': icon = 'valido_sucesso'; status = 'verde'; color = '#5db75d'; break;
                        case 'Falha validação': icon = 'valido_erro'; status = 'vermelho'; color = '#d9544f'; break;
                        case 'Fechado': icon = 'fechado'; status = 'verde'; color = '#5db75d'; break;
                        default:
                                if(["Abandono", "Desistencia", "Reaberto"].indexOf(scope.jobs[i].status) >= 0) {
                                    icon = 'valido_erro'; status = 'vermelho'; color = '#d9544f';
                                } else {
                                    console.warn('Status desconhecido.'); icon = 'valido_erro'; status = 'vermelho'; color = '#d9544f';
                                }
                            break;
                    }

                    var problema = scope.jobs[i].problema.slice(1, 77) + '...'
                    var horario_agendamento = new Date(scope.jobs[i].dh_agendamento_cliente).toLocaleString()

                    var div = '<div style="width: 300px;height: 160px;">'
                        + '<h4 style="width: 300px"><a style="text-decoration: none; color: '+color+'!important;" href="'+tipo_url()+scope.jobs[i].id+'" >'
                        + '<img src="/img/mapas/'+ icon +'_'+ status + '.png"> - '+ scope.jobs[i].id + '</a></h4>'
                        + '<p style="margin: 0"><strong>Cliente:</strong> ' + scope.jobs[i].nome_cliente + '</p>'
                        + '<p style="margin: 0"><strong>Supporter:</strong> ' + null2str_vazia(scope.jobs[i].nome_doutor) + '</p>'
                        + '<p style="margin: 0"><strong>Gestor:</strong> ' + null2str_vazia(scope.jobs[i].nome_gestor) + '</p>'
                        + '<p style="margin: 0"><strong>Horário Agendamento:</strong> ' + horario_agendamento + '</p>'
                        + '<p style="margin: 0"><strong>Tipo Serviço:</strong> ' + null2str_vazia(scope.jobs[i].tipo_servico) + '</p>'
                        + '<p style="margin: 0"><strong>Descrição:</strong> ' + problema + '</p>'
                        + '</div>'

                    seta_marcador(map, new google.maps.LatLng(localizacao), scope.jobs[i].pais, div, icon, status)

                    limites.extend(localizacao);
                }/** end for */


                if(novo_center){
                    map.setOptions({
                        zoom: novo_zoom,
                        center: new google.maps.LatLng(novo_center)
                    })
                }
                else
                    map.fitBounds(limites)


                var calc = function(markers) {
                    for (var i = 0; i < markers.length; i++) {
                        if (markers[i].getIcon().indexOf("vermelho") > -1) {
                            return {text: markers.length, index: 2};
                        }
                    }
                    return {text: markers.length, index: 1};
                }

                var clusterOptions = {gridSize: 50, maxZoom: 15, styles: [
                    { height: 64, url: "/img/mapas/cluster_verde.png", width: 64},
                    { height: 64, url: "/img/mapas/cluster_vermelho.png", width: 64}
                    ]
                }


                let markerCluster = new MarkerClusterer(map, markers, clusterOptions);
                markerCluster.setCalculator(calc);
            }
            else{
                map.setOptions({
                    center: new google.maps.LatLng(center),
                    zoom: zoom,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scrollwheel: true,
                    scaleControl: true,
                    streetViewControl: false
                })
            }
        })

        inicia_mapa()
    }

    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        link: google_mapas,
        scope:{
            jobs: '=',
            referencias: '=',
            reseta: '=',
            usuario: '='
        }
    }
})

app.directive('selecionaClique', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('focus', function () {
                this.select()
            })
        }
    }
})

app.directive('copyToClipboard', function ($rootScope) {
    return {
        restrict: 'A',
        scope:{
            input: '='
        },
        link: function (scope, element, attrs) {
            element.bind('click', function(){
                $rootScope.adiciona_historico('Item copiado.', 200)
                var $temp_input = $("<input>");
                $("body").append($temp_input);
                $temp_input.val(scope.input).select();
                document.execCommand("copy");
                $temp_input.remove();
            })
        }
    }
})
