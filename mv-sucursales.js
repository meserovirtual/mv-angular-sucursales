(function () {
    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    if (currentScriptPath.length == 0) {
        currentScriptPath = window.installPath + '/mv-angular-sucursales/includes/mv-sucursales.php';
    }

    angular.module('mvSucursales', [])
        .factory('SucursalesService', SucursalesService)
        .service('SucursalesVars', SucursalesVars);


    SucursalesService.$inject = ['$http', 'SucursalesVars', '$cacheFactory', 'MvUtils', 'MvUtilsGlobals', 'ErrorHandler', '$q'];
    function SucursalesService($http, SucursalesVars, $cacheFactory, MvUtils, MvUtilsGlobals, ErrorHandler, $q) {
        //Variables
        var service = {};

        var url = currentScriptPath.replace('mv-sucursales.js', '/includes/mv-sucursales.php');


        service.get = get;
        service.getByParams = getByParams;
        service.getSucursalById = getSucursalById;
        service.getSucursalesByName = getSucursalesByName;

        service.create = create;
        service.update = update;
        service.remove = remove;
        service.save = save;

        service.goToPagina = goToPagina;
        service.next = next;
        service.prev = prev;

        return service;

        function get() {
            MvUtilsGlobals.startWaiting();
            var urlGet = url + '?function=get';
            var $httpDefaultCache = $cacheFactory.get('$http');
            var cachedData = [];

            // Verifica si existe el cache de usuarios
            if ($httpDefaultCache.get(urlGet) != undefined) {
                if (SucursalesVars.clearCache) {
                    $httpDefaultCache.remove(urlGet);
                }
                else {
                    var deferred = $q.defer();
                    cachedData = $httpDefaultCache.get(urlGet);
                    deferred.resolve(cachedData);
                    MvUtilsGlobals.stopWaiting();
                    return deferred.promise;
                }
            }

            return $http.get(urlGet, {cache: true})
                .then(function (response) {
                    $httpDefaultCache.put(urlGet, response.data);
                    SucursalesVars.clearCache = false;
                    SucursalesVars.paginas = (response.data.length % SucursalesVars.paginacion == 0) ? parseInt(response.data.length / SucursalesVars.paginacion) : parseInt(response.data.length / SucursalesVars.paginacion) + 1;
                    MvUtilsGlobals.stopWaiting();
                    return response.data;
                })
                .catch(function (response) {
                    MvUtilsGlobals.stopWaiting();
                    ErrorHandler(response);
                });
        }

        /**
         * @description Retorna la lista filtrada de sucursals
         * @param param -> String, separado por comas (,) que contiene la lista de par�metros de b�squeda, por ej: nombre, sku
         * @param value
         * @param callback
         */
        function getByParams(params, values, exact_match, callback) {
            get(function (data) {
                MvUtils.getByParams(params, values, exact_match, data, callback);
            })
        }


        function getSucursalById(id, callback) {
            getSucursales(function (data) {
                var result = data.filter(function (elem, index, array) {
                    return elem.sucursal_id == id;
                })[0];

                callback(result);

            });

        }


        function getSucursalesByName(name, callback) {
            getSucursales(function (data) {
                var results = data.filter(function (elem, index, array) {
                    var elemUpper = elem.nombre.toUpperCase();

                    var n = elemUpper.indexOf(name.toUpperCase());

                    if (n === undefined || n === -1) {
                        n = elem.nombre.indexOf(name);
                    }

                    if (n !== undefined && n > -1) {
                        return elem;
                    }
                });
                callback(results);
            });


        }

        function save(sucursal) {

            var deferred = $q.defer();

            if (sucursal.sucursal_id != undefined) {
                deferred.resolve(update(sucursal));
            } else {
                deferred.resolve(create(sucursal));
            }
            return deferred.promise;
        }

        /** @name: remove
         * @param sucursal_id
         * @param callback
         * @description: Elimina el sucursal seleccionado.
         */
        function remove(sucursal_id, callback) {
            return $http.post(url,
                {function: 'remove', 'sucursal_id': sucursal_id})
                .success(function (data) {
                    //console.log(data);
                    if (data !== 'false') {
                        SucursalesVars.clearCache = true;
                        callback(data);
                    }
                })
                .error(function (data) {
                    callback(data);
                })
        }

        /**
         * @description: Crea un sucursal.
         * @param sucursal
         * @param callback
         * @returns {*}
         */
        function create(sucursal) {
            return $http.post(url,
                {
                    'function': 'create',
                    'sucursal': JSON.stringify(sucursal)
                })
                .then(function (response) {
                    SucursalesVars.clearCache = true;
                    return response.data;
                })
                .catch(function (response) {
                    SucursalesVars.clearCache = true;
                    ErrorHandler(response);
                });
        }


        /** @name: update
         * @param sucursal
         * @param callback
         * @description: Realiza update al sucursal.
         */
        function update(sucursal) {
            return $http.post(url,
                {
                    'function': 'update',
                    'sucursal': JSON.stringify(sucursal)
                })
                .then(function (response) {
                    SucursalesVars.clearCache = true;
                    return response.data;
                })
                .catch(function (response) {
                    SucursalesVars.clearCache = true;
                    ErrorHandler(response);
                });
        }

        /**
         * Para el uso de la p�ginaci�n, definir en el controlador las siguientes variables:
         *
         vm.start = 0;
         vm.pagina = SucursalesVars.pagina;
         SucursalesVars.paginacion = 5; Cantidad de registros por p�gina
         vm.end = SucursalesVars.paginacion;


         En el HTML, en el ng-repeat agregar el siguiente filtro: limitTo:appCtrl.end:appCtrl.start;

         Agregar un bot�n de next:
         <button ng-click="appCtrl.next()">next</button>

         Agregar un bot�n de prev:
         <button ng-click="appCtrl.prev()">prev</button>

         Agregar un input para la p�gina:
         <input type="text" ng-keyup="appCtrl.goToPagina()" ng-model="appCtrl.pagina">

         */


        /**
         * @description: Ir a p�gina
         * @param pagina
         * @returns {*}
         * uso: agregar un m�todo
         vm.goToPagina = function () {
                vm.start= SucursalesService.goToPagina(vm.pagina).start;
            };
         */
        function goToPagina(pagina) {

            if (isNaN(pagina) || pagina < 1) {
                SucursalesVars.pagina = 1;
                return SucursalesVars;
            }

            if (pagina > SucursalesVars.paginas) {
                SucursalesVars.pagina = SucursalesVars.paginas;
                return SucursalesVars;
            }

            SucursalesVars.pagina = pagina - 1;
            SucursalesVars.start = SucursalesVars.pagina * SucursalesVars.paginacion;
            return SucursalesVars;

        }

        /**
         * @name next
         * @description Ir a pr�xima p�gina
         * @returns {*}
         * uso agregar un metodo
         vm.next = function () {
                vm.start = SucursalesService.next().start;
                vm.pagina = SucursalesVars.pagina;
            };
         */
        function next() {

            if (SucursalesVars.pagina + 1 > SucursalesVars.paginas) {
                return SucursalesVars;
            }
            SucursalesVars.start = (SucursalesVars.pagina * SucursalesVars.paginacion);
            SucursalesVars.pagina = SucursalesVars.pagina + 1;
            //SucursalesVars.end = SucursalesVars.start + SucursalesVars.paginacion;
            return SucursalesVars;
        }

        /**
         * @name previous
         * @description Ir a p�gina anterior
         * @returns {*}
         * uso, agregar un m�todo
         vm.prev = function () {
                vm.start= SucursalesService.prev().start;
                vm.pagina = SucursalesVars.pagina;
            };
         */
        function prev() {


            if (SucursalesVars.pagina - 2 < 0) {
                return SucursalesVars;
            }

            //SucursalesVars.end = SucursalesVars.start;
            SucursalesVars.start = (SucursalesVars.pagina - 2 ) * SucursalesVars.paginacion;
            SucursalesVars.pagina = SucursalesVars.pagina - 1;
            return SucursalesVars;
        }
    }


    SucursalesVars.$inject = [];
    /**
     * @description Almacena variables temporales de sucursales
     * @constructor
     */
    function SucursalesVars() {
        // Cantidad de páginas total del recordset
        this.paginas = 1;
        // Página seleccionada
        this.pagina = 1;
        // Cantidad de registros por página
        this.paginacion = 10;
        // Registro inicial, no es página, es el registro
        this.start = 0;


        // Indica si se debe limpiar el cache la próxima vez que se solicite un get
        this.clearCache = true;

    }
})();