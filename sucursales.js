(function () {

    'use strict';


    angular.module('nombreapp.stock.sucursales', ['ngRoute', 'toastr'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/sucursales/:id', {
                templateUrl: './sucursales/sucursales.html',
                controller: 'SucursalesController',
                data: {requiresLogin: true}
            });
        }])

        .controller('SucursalesController', SucursalesController);

    SucursalesController.$inject = ["$scope", "$routeParams", "SucursalesService", "$location", "toastr"];
    function SucursalesController($scope, $routeParams, SucursalesService, $location, toastr) {
        var vm = this;
        vm.isUpdate = false;
        
        vm.save = save;
        vm.delete = deleteSucursal;
        vm.id = $routeParams.id;
        vm.parent_categories = -1;
        vm.padres = [];
        vm.sucursal = {
            nombre: '',
            direccion: '',
            telefono: '',
            pos_cantidad: 1
        };



        if (vm.id == 0) {
            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;

            SucursalesService.getByParams('sucursal_id', '' + vm.id, 'true', function (data) {
                vm.sucursal = data[0];
            });
        }

        function deleteSucursal() {

            var r = confirm("Realmente desea eliminar la sucursal? Esta operación no tiene deshacer.");
            if (r) {

                SucursalesService.remove(vm.id, function (data) {
                    toastr.success('Sucursal eliminada');
                    $location.path('/listado_sucursales');
                });
            }
        }

        function save() {


            if (vm.isUpdate) {
                SucursalesService.update(vm.sucursal, function (data) {
                    if(data == 'true'){
                        toastr.success('Sucursal salvada con exito');
                        $location.path('/listado_sucursales');
                    }else{
                        toastr.error('Sucursal no guardada');

                    }
                });
            } else {
                SucursalesService.create(vm.sucursal, function (data) {
                    toastr.success('Sucursal salvada con exito');
                    $location.path('/listado_sucursales');
                });
            }
        }


    }




})();

