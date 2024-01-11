import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Button, Row, Form, Modal, Col, Table } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { PencilFill, Receipt } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ListaDePersonal from './man_equipo_trabajadores';
import { constants } from 'buffer';

const LineasPartesMov = ({tarea, handleCloseList, show, parte}) => {
    const [token] = useCookies(['tec-token']);
    const [listados, setListados] = useState(null);
    const [show2, setShow2] = useState(false);
    const [linea_id, setLinea_id] = useState(null);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(()=>{
        tarea && axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_mov/?tarea=${tarea.id}&parte=${parte.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setListados(res.data.sort(function(a, b){
                if(a.fecha_fin > b.fecha_fin){
                    return 1;
                }
                if(a.fecha_fin < b.fecha_fin){
                    return -1;
                }
                return 0;
            }))
        })
        .catch( err => {
            console.log(err);
        });
    },[tarea, token]);
    /* eslint-disable react-hooks/exhaustive-deps */

    const handlerListCancelar = () => {      
        handleCloseList();
    } 

    const listarTrabajadores = (linea)=>{
        setLinea_id(linea.id);
        setShow2(true);
    }

    const handlerClose = () => {
        setShow2(false);
    }

    return (
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="xl">
                <Modal.Header closeButton>                
                    <Modal.Title>{parte.nombre}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col>
                            { tarea ? 
                            <Form.Group controlId="tarea">
                                    <Form.Label>Tarea</Form.Label>
                                    <Form.Control type="text"  
                                                name='tarea' 
                                                value={tarea.nombre}
                                                disabled>  
                                    </Form.Control>
                            </Form.Group>
                            :null
                            }
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Fecha Plan</th>
                                        <th>Fecha Inicio</th>
                                        <th>Fecha Fin</th> 
                                        <th>Acciones</th>                                        
                                    </tr>
                                </thead>                                
                                <tbody>                                
                                    {listados && listados.map( lista => {
                                        return (
                                            <tr key={lista.id}>
                                                <td>{lista.fecha_plan?invertirFecha(String(lista.fecha_plan)): ''}</td>
                                                <td>{lista.fecha_inicio?invertirFecha(String(lista.fecha_inicio)):'Tarea NO iniciada'}</td> 
                                                <td>{lista.fecha_fin?invertirFecha(String(lista.fecha_fin)):'Tarea NO finalizada'}</td>
                                                <td>                                            
                                                    <Link to={`/mantenimiento/linea_tarea/${lista.id}`}><PencilFill className="mr-3 pencil"/></Link> 
                                                    <Receipt className="mr-3 pencil" onClick={event =>{listarTrabajadores(lista)}}/>                                        
                                                </td>
                                            </tr>
                                        )})
                                    }                                                                       
                                </tbody>                                
                            </Table>
                        </Col>
                    </Row>
                    <ListaDePersonal    show={show2}
                                        linea_id ={linea_id}
                                        handlerClose={handlerClose}
                    />
                </Modal.Body>
                <Modal.Footer>                                               
                    <Button variant="info" onClick={handlerListCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
        </Modal>
    )
}
export default LineasPartesMov;