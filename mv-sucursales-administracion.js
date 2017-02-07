(function () {
    'use strict';

    angular.module('mvSucursalesAdministracion', [])
        .component('mvSucursalesAdministracion', mvSucursalesAdministracion());

    function mvSucursalesAdministracion() {
        return {
            bindings: {
                searchFunction: '&'
            },
            templateUrl: window.installPath + '/mv-angular-sucursales/mv-sucursales-administracion.html',
            controller: MvSucursalController
        }
    }

    MvSucursalController.$inject = ["SucursalesVars", 'SucursalesService', "MvUtils"];
    /**
     * @param AcUsuarios
     * @constructor
     */
    function MvSucursalController(SucursalesVars, SucursalesService, MvUtils) {
        var vm = this;

        vm.sucursales = [];
        vm.sucursal = {};
        vm.detailsOpen = false;

        vm.save = save;
        vm.cancel = cancel;
        vm.setData = setData;
        vm.loadSucursales = loadSucursales;
        vm.remove = remove;

        var element1 = angular.element(document.getElementById('nombre'));
        var element2 = angular.element(document.getElementById('direccion'));
        var element3 = angular.element(document.getElementById('telefono'));

        element1[0].addEventListener('focus', function () {
            element1[0].classList.remove('error-input');
            element1[0].removeEventListener('focus', removeFocus);
        });

        element2[0].addEventListener('focus', function () {
            element2[0].classList.remove('error-input');
            element2[0].removeEventListener('focus', removeFocus);
        });

        element3[0].addEventListener('focus', function () {
            element3[0].classList.remove('error-input');
            element3[0].removeEventListener('focus', removeFocus);
        });

        function removeFocus() { }


        loadSucursales();

        function loadSucursales() {
            SucursalesService.get().then(function (data) {
                setData(data);
            });
        }

        function save() {
            if(vm.sucursal.telefono != undefined && vm.sucursal.telefono.length > 0) {
                if(!MvUtils.validaTelefono(vm.sucursal.telefono)) {
                    element3[0].classList.add('error-input');
                    MvUtils.showMessage('error', 'El formato del teléfono no es correcto.');
                    return;
                } else {
                    element3[0].classList.remove('error-input');
                }
            }

            if(vm.sucursal.nombre === undefined || vm.sucursal.nombre.length === 0) {
                element1[0].classList.add('error-input');
                MvUtils.showMessage('error', 'El nombre no puede ser vacio');
                return;
            }

            if(vm.sucursal.direccion === undefined || vm.sucursal.direccion.length === 0) {
                element2[0].classList.add('error-input');
                MvUtils.showMessage('error', 'La dirección no puede ser vacio');
                return;
            }

            SucursalesService.save(vm.sucursal).then(function (data) {
                vm.detailsOpen = (data === undefined || data < 0) ? true : false;
                if(data === undefined) {
                    element1[0].classList.add('error-input');
                    element2[0].classList.add('error-input');
                    MvUtils.showMessage('error', 'Error actualizando el dato');
                }
                else {
                    vm.sucursal = {};
                    loadSucursales();
                    element1[0].classList.remove('error-input');
                    element2[0].classList.remove('error-input');
                    MvUtils.showMessage('success', 'La operación se realizó satisfactoriamente');
                }
            }).catch(function (data) {
                vm.sucursal = {};
                vm.detailsOpen = true;
            });

        }

        function setData(data) {
            vm.sucursales = data;
            vm.paginas = SucursalesVars.paginas;
        }

        function remove() {
            if(vm.sucursal.sucursal_id == undefined) {
                alert('Debe seleccionar una sucursal');
            } else {
                var result = confirm('¿Esta seguro que desea eliminar la sucursal seleccionada?');
                if(result) {
                    SucursalesService.remove(vm.sucursal.sucursal_id, function(data){
                        vm.sucursal = {};
                        vm.detailsOpen = false;
                        loadSucursales();
                        MvUtils.showMessage('success', 'La registro se borro satisfactoriamente');
                    });
                }
            }
        }


        function cancel() {
            vm.sucursales = [];
            vm.sucursal={};
            vm.detailsOpen=false;
            SucursalesVars.clearCache = true;
            loadSucursales();
        }


        // Implementación de la paginación
        vm.start = 0;
        vm.limit = SucursalesVars.paginacion;
        vm.pagina = SucursalesVars.pagina;
        vm.paginas = SucursalesVars.paginas;

        function paginar(vars) {
            if (vars == {}) {
                return;
            }
            vm.start = vars.start;
            vm.pagina = vars.pagina;
        }

        vm.next = function () {
            paginar(MvUtils.next(SucursalesVars));
        };
        vm.prev = function () {
            paginar(MvUtils.prev(SucursalesVars));
        };
        vm.first = function () {
            paginar(MvUtils.first(SucursalesVars));
        };
        vm.last = function () {
            paginar(MvUtils.last(SucursalesVars));
        };

        vm.goToPagina = function () {
            paginar(MvUtils.goToPagina(vm.pagina, SucursalesVars));
        }

    }


})();
