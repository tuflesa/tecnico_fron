import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const StockMinimoForm = ({show, handleCloseStock, repuesto_id, stock, stock_minimo, updateRepuesto, stocks_utilizados}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    //console.log('que vale lo que entra, repuesto_id, stock, stock_minimo,stocks_utilizados');
    //console.log(repuesto_id);
    //console.log(stock);
    //console.log(stock_minimo);
    //console.log(stocks_utilizados);
    const [datos, setDatos] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
        repuesto: repuesto_id,
        almacen: '',
        stock_minimo_cantidad: null,
        stock_actual: null
    });
    const [empresas, setEmpresas] = useState([]);
    const [almacenes, setAlmacenes] = useState([]);
    const [guardarDisabled, setGuardarDisabled] = useState(false);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            // console.log(res.data);
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);
   
    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/repuestos/almacen/?empresa=${datos.empresa}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log('datos recibidos DB...')
            console.log(res.data);
            // console.log('Lista de stocks utilizados ...');
            // console.log(stocks_utilizados);
            let almacenes_utilizados = [];
            if (stocks_utilizados) {
                // console.log('Calculando almacenes utilizados')
                stocks_utilizados.forEach( s => {
                    almacenes_utilizados.push(s.almacen);
                })
                console.log('almacenes utilizados....');
                console.log(almacenes_utilizados)
            }
            const almacenes_disponible = res.data.filter( a =>!almacenes_utilizados.includes(a.id));
            console.log('almacenes disponibles ...')
            console.log(almacenes_disponible)
            setGuardarDisabled(almacenes_disponible.length === 0);
            setAlmacenes(almacenes_disponible);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, datos.empresa, stocks_utilizados]);

    useEffect(()=>{
        setDatos({
            ...datos,
            stock_minimo_cantidad : stock ? stock.stock_minimo : null,
            stock_minimo_inicial : stock ? stock.stock_minimo : null,
            stock_actual : stock ? stock.suma : null,
            stock_actual_inicial : stock ? stock.suma : null,
            stock_minimo : stock_minimo ? stock_minimo : null,
        })
        // console.log(datos);
    },[stock, stock_minimo, almacenes]);

    useEffect(()=>{
        setDatos({
            ...datos,
            almacen : stock ? stock.almacen__id : almacenes.length > 0 ? almacenes[0].id : '',
        })
        // console.log(datos);
    },[almacenes]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        });
        // console.log(datos);
    }

    const handleDisabled = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local'
    }

    const handleCancelar = () => {
        setDatos({
            ...datos,
            stock_minimo_cantidad : null,
            stock_actual : null
        });
        handleCloseStock();
    }

    const handleGuardar = () => {
        if (datos.stock_minimo_cantidad !== datos.stock_minimo_inicial){
            // Stock mínimo
            //console.log('Actualizar stock mínimo ...');
            if (datos.stock_minimo) { // Actualizar stock mínimo
                // datos.stock_minimo.cantidad = parseInt(datos.stock_minimo_cantidad);
                axios.patch(BACKEND_SERVER + `/api/repuestos/stocks_minimos/${datos.stock_minimo.id}/`, {
                    cantidad: datos.stock_minimo_cantidad
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                      }     
                })
                .then( res => { 
                        // console.log(res.data);
                        updateRepuesto();
                    }
                )
                .catch(err => { console.log(err);})
            }
            else { // Crear stock mínimo
                // console.log('Crear stock mínimo: repuesto:' + repuesto_id + ' almacen:  ' + datos.almacen + ' cantidad: ' + datos.stock_minimo_cantidad);
                axios.post(BACKEND_SERVER + `/api/repuestos/stocks_minimos/`, {
                    repuesto: repuesto_id,
                    almacen: datos.almacen,
                    cantidad: datos.stock_minimo_cantidad ? datos.stock_minimo_cantidad : 0,
                    stock_act: datos.stock_actual ? datos.stock_actual : 0
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                      }     
                })
                .then( res => { 
                        // console.log(res.data);
                        if (!datos.stock_actual) {
                            console.log('no hay valor inicial de stock ...')
                        }
                        updateRepuesto();
                    }
                )
                .catch(err => { console.log(err);})
            }
        }

        // Ajustar Stock
        if (datos.stock_actual !== datos.stock_actual_inicial || !datos.stock_actual){ // Si hay cambios o se deja sin valor el campo stock
            // console.log('Guardar ajuste stock ' + datos.stock_actual);
            // 1 Crear un inventario
            // 2 Añadir una línea de inventario
            // 3 Generar un movimiento correspondiente al inventario

            const hoy = new Date();
            var dd = String(hoy.getDate()).padStart(2, '0');
            var mm = String(hoy.getMonth() + 1).padStart(2, '0'); //Enero es 0!
            var yyyy = hoy.getFullYear();
            
            axios.post(BACKEND_SERVER + `/api/repuestos/inventario/`, {
                nombre : datos.stock_actual_inicial ? 'Ajuste de stock' : 'Ajuste Inicial',
                fecha_creacion : yyyy + '-' + mm + '-' + dd,
                responsable : user['tec-user'].id
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }     
            })
            .then( res => { 
                    // console.log(res.data);
                    const inventario = res.data
                    axios.post(BACKEND_SERVER + `/api/repuestos/lineainventario/`, {
                        inventario : inventario.id,
                        repuesto : repuesto_id,
                        almacen : datos.almacen,
                        cantidad : datos.stock_actual ? datos.stock_actual : 0 
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                          }     
                    })
                    .then( res => {
                        // console.log(res.data);
                        const linea_inventario = res.data;
                        axios.post(BACKEND_SERVER + `/api/repuestos/movimiento/`, {
                            fecha : yyyy + '-' + mm + '-' + dd,
                            cantidad : datos.stock_actual_inicial ? (parseInt(datos.stock_actual) - parseInt(datos.stock_actual_inicial)) : datos.stock_actual ? datos.stock_actual : 0,
                            almacen : datos.almacen,
                            usuario : user['tec-user'].id,
                            linea_inventario : linea_inventario.id
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                              }     
                        })
                        .then( res => {
                            // console.log(res.data);
                            updateRepuesto();
                        })
                        .catch( err => {console.log(err);})
                    })
                    .catch( err => {console.log(err);})
                }
            )
            .catch(err => { console.log(err);})
        }
        
        handleCancelar();
    }

    return (
        <Modal show={show} onHide={handleCloseStock} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Stock Mínimo + Ajuste</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form >
                        <Row>
                            <Col>
                                <Form.Group controlId="empresa">
                                    <Form.Label>Empresa</Form.Label>
                                    <Form.Control as="select"  
                                                name='empresa' 
                                                value={datos.empresa}
                                                onChange={handleInputChange}
                                                disabled={stock ? true : handleDisabled()}
                                                placeholder="Empresa">
                                                {empresas && empresas.map( empresa => {
                                                    return (
                                                    <option key={empresa.id} value={empresa.id}>
                                                        {empresa.nombre}
                                                    </option>
                                                    )
                                                })}
                                </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="almacen">
                                    <Form.Label>Almacen</Form.Label>
                                    <Form.Control as="select"  
                                                name='almacen' 
                                                value={datos.almacen}
                                                onChange={handleInputChange}
                                                disabled={stock ? true : false}
                                                placeholder="Almacen">
                                                {almacenes && almacenes.map( almacen => {
                                                    return (
                                                    <option key={almacen.id} value={almacen.id}>
                                                        {almacen.nombre}
                                                    </option>
                                                    )
                                                })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="stock_minimo_cantidad">
                                    <Form.Label>Stock Mínimo</Form.Label>
                                    <Form.Control type="text" 
                                                name='stock_minimo_cantidad' 
                                                value={datos.stock_minimo_cantidad}
                                                onChange={handleInputChange} 
                                                placeholder="Stock Mínimo"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="stock_actual">
                                    <Form.Label>Stock Actual</Form.Label>
                                    <Form.Control type="text" 
                                                name='stock_actual' 
                                                value={datos.stock_actual}
                                                onChange={handleInputChange} 
                                                placeholder="Stock Actual"
                                                // disabled
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="info" 
                        onClick={handleGuardar}
                        disabled = {guardarDisabled}>
                        Guardar
                    </Button>
                    <Button variant="waring" onClick={handleCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
        </Modal>
    )
}

export default StockMinimoForm;