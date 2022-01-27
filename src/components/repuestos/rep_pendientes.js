import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table } from 'react-bootstrap';
import ReactExport from 'react-data-export';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const RepPendientes = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [pendientes, setPendientes] = useState(null);
    const [lineasPendientes, setLineasPendientes] = useState(null);
    const [pedfueradefecha, setPedFueradeFecha] = useState(null);
    var fecha = new Date();
    
    const [datos, setDatos] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
        hoy: (fecha.getFullYear() + "/" + (fecha.getMonth()+1) + "/" + fecha.getDate()),
        //hoy: fecha,
    });

    const [filtro, setFiltro] = useState(`?empresa=${datos.empresa}&&finalizado=${false}`);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimo_detalle/?almacen__empresa__id=${datos.empresa}&&stock_act<cantidad`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {            
            setPendientes(res.data.filter( s => s.stock_act < s.cantidad));
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);   

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/repuestos/linea_pedido_pend/?pedido__finalizado=${'False'}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( rs => {
            setLineasPendientes(rs.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/lista_pedidos/` + filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setPedFueradeFecha(res.data.filter( s => s.fecha_prevista_entrega < datos.hoy));
        })
        .catch( err => {
            console.log(err);
        });
    },[token]); 

    return (
        <Container>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Repuestos Por Debajo del Stock Mínimo</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Stock Actual</th>
                                <th>Stock Mínimo</th>
                                <th>Pedido</th>
                                <th>Cant. por recibir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendientes && pendientes.map( pendiente => {
                                return (
                                    <tr key={pendiente.id}>
                                        <td>{pendiente.repuesto.nombre}</td>
                                        <td>{pendiente.stock_act}</td>
                                        <td>{pendiente.cantidad}</td>
                                        <td>{lineasPendientes && lineasPendientes.map( lineas => {
                                            if(lineas.repuesto === pendiente.repuesto.id){                                               
                                                return(lineas.pedido.numero) 
                                            }
                                        })}                                            
                                        </td> 
                                        <td>{lineasPendientes && lineasPendientes.map( lineas => {
                                            if(lineas.repuesto === pendiente.repuesto.id){                                               
                                                return(lineas.por_recibir) 
                                            }
                                        })}                                            
                                        </td>

                                    </tr>
                                )
                            })
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Pedidos Fecha Prevista Pasada</h5>                    
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                                <th>Num-Pedido</th>
                                <th>Empresa</th>
                                <th>Proveedor</th>
                                <th>Fecha Pedido</th>
                                <th>Fecha Entrega</th>
                                <th>Fecha Prevista Entrega</th>
                                <th>Finalizado</th>
                                <th>Ir al pedido</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedfueradefecha && pedfueradefecha.map( pedido => {
                                return (
                                    <tr key={pedido.id}>
                                        <td>{pedido.numero}</td>
                                        <td>{pedido.empresa.nombre}</td>
                                        <td>{pedido.proveedor.nombre}</td>
                                        <td>{invertirFecha(String(pedido.fecha_creacion))}</td>
                                        <td>{pedido.fecha_entrega && invertirFecha(String(pedido.fecha_entrega))}</td>                                        
                                        <td>{pedido.fecha_prevista_entrega && invertirFecha(String(pedido.fecha_prevista_entrega))}</td> 
                                        <td>{pedido.finalizado ? 'Si' : 'No'}</td>
                                        <td>
                                            <Link to={`/repuestos/pedido_detalle/${pedido.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    )
}
export default RepPendientes;