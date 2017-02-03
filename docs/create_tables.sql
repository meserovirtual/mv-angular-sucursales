# USUARIOS
CREATE TABLE sucursales (
  sucursal_id      INT(11)      NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(100) NOT NULL,
  direccion        VARCHAR(150) DEFAULT NULL,
  telefono         VARCHAR(45)  DEFAULT NULL,
  pos_cantidad     INT(11)      NOT NULL DEFAULT '0',
  PRIMARY KEY (sucursal_id)
)
  ENGINE = MyISAM
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = utf8;

