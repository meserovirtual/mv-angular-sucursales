<?php


session_start();


// Token

if (file_exists('../../../includes/MyDBi.php')) {
    require_once '../../../includes/MyDBi.php';
    require_once '../../../includes/utils.php';
} else {
    require_once 'MyDBi.php';
}


class Sucursales extends Main
{
    private static $instance;

    public static function init($decoded)
    {
        self::$instance = new Main(get_class(), $decoded['function']);
        try {
            call_user_func(get_class() . '::' . $decoded['function'], $decoded);
        } catch (Exception $e) {

            $file = 'error.log';
            $current = file_get_contents($file);
            $current .= date('Y-m-d H:i:s') . ": " . $e . "\n";
            file_put_contents($file, $current);

            header('HTTP/1.0 500 Internal Server Error');
            echo $e;
        }
    }


    function get()
    {
        $db = self::$instance->db;

        $results = $db->get('sucursales');

        echo json_encode($results);
    }


    /**
     * @description Crea una categoría, esta es la tabla paramétrica, la funcion createSucursales crea las relaciones
     * @param $sucursal
     */
    function create($sucursal)
    {
        $db = new MysqliDb();
        $db->startTransaction();
        $sucursal_decoded = checkSucursal(json_decode($sucursal));

        $data = array(
            'nombre' => $sucursal_decoded->nombre,
            'direccion' => $sucursal_decoded->direccion,
            'telefono' => $sucursal_decoded->telefono,
            'pos_cantidad' => $sucursal_decoded->pos_cantidad
        );

        $result = $db->insert('sucursales', $data);
        if ($result > -1) {
            $db->commit();
            echo json_encode($result);
        } else {
            $db->rollback();
            echo json_encode(-1);
        }
    }


    /**
     * @description Modifica una sucursal
     * @param $sucursal
     */
    function update($sucursal)
    {
        $db = new MysqliDb();
        $db->startTransaction();
        $sucursal_decoded = checkSucursal(json_decode($sucursal));
        $db->where('sucursal_id', $sucursal_decoded->sucursal_id);
        $data = array(
            'nombre' => $sucursal_decoded->nombre,
            'direccion' => $sucursal_decoded->direccion,
            'telefono' => $sucursal_decoded->telefono,
            'pos_cantidad' => $sucursal_decoded->pos_cantidad
        );

        $result = $db->update('sucursales', $data);
        if ($result) {
            $db->commit();
            echo json_encode($result);
        } else {
            $db->rollback();
            echo json_encode(-1);
        }
    }


    /**
     * @description Elimina una sucursal
     * @param $sucursal_id
     */
    function remove($sucursal_id)
    {
        $db = new MysqliDb();

        $db->where("sucursal_id", $sucursal_id);
        $results = $db->delete('sucursales');

        if ($results) {

            echo json_encode(1);
        } else {
            echo json_encode(-1);

        }
    }


    /**
     * @description Verifica todos los campos de detalle del carrito para que existan
     * @param $detalle
     * @return mixed
     */
    function checkSucursal($detalle)
    {
        $detalle->sucursal_id = (!array_key_exists("sucursal_id", $detalle)) ? -1 : $detalle->sucursal_id;
        $detalle->nombre = (!array_key_exists("nombre", $detalle)) ? 0 : $detalle->nombre;
        $detalle->direccion = (!array_key_exists("direccion", $detalle)) ? 0 : $detalle->direccion;
        $detalle->telefono = (!array_key_exists("telefono", $detalle)) ? 0 : $detalle->telefono;
        $detalle->pos_cantidad = (!array_key_exists("pos_cantidad", $detalle)) ? 1 : $detalle->pos_cantidad;

        return $detalle;
    }
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = file_get_contents("php://input");
    $decoded = json_decode($data);
    Sucursales::init(json_decode(json_encode($decoded), true));
} else {
    Sucursales::init($_GET);
}
