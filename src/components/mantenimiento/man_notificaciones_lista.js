import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ManNotificacionesFiltro from './man_notificaciones_filtro';

const ManNotificacionesLista = () => {
    const [token] = useCookies(['tec-token']);
    
    const [notas, setNotas]  = useState(null);
    const [filtro, setFiltro] = useState(`?finalizado=${false}&revisao=${false}&descartado=${false}`);

    const actualizaFiltro = (str) => {
        setFiltro(str);
    }
  
    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/mantenimiento/notificaciones/' + filtro ,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setNotas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro]);

<<<<<<< HEAD
    const BorrarNota =(parte) =>{ 
        console.log(parte);
    }

    return (
        <Container>            
            <Row>
                <Col>
                    <ManNotificacionesFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Row>                
                <Col>
                    <h5 className="mb-3 mt-3">Listado de Notificaciones</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th style={{width:150}}>Numero</th>
                                <th>Creado Por</th>
                                <th>Que ocurre</th>
                                <th>Donde ocurre</th>
                                <th style={{width:80}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notas && notas.map( nota => {
                                return (
                                    <tr key={nota.id}>
                                        <td>{nota.numero}</td>
                                        <td>{nota.quien.get_full_name}</td>
                                        <td>{nota.que}</td>
                                        <td>{nota.donde}</td>
                                        <td>
                                            <Link to={`/mantenimiento/notificacion/${nota.id}`}>
                                                <PencilFill className="mr-3 pencil"/>                                                
                                            </Link>
                                            <Trash className="trash"  onClick={event =>{BorrarNota(nota)}} /> 
=======
    return (
        <Container>
            <Row className="justify-content-center">
                <NotificacionFiltro actualizaFiltro={setFiltro} /> 
            </Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Notificaciones</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Numero</th>
                                <th>Fecha</th>
                                <th>Que</th>
                                <th>Quien</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notificaciones && notificaciones.map( nota => {
                                return (
                                    <tr key={nota.id}>
                                        <td>{nota.numero}</td>
                                        <td>{nota.fecha_creacion}</td>
                                        <td>{nota.que}</td>
                                        <td>{nota.quien.get_full_name}</td>
                                        <td>
                                            <Link to={`/mantenimiento/notificaciones/${nota.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                            <Trash className="trash"  onClick={null} />
>>>>>>> 4e7e4e5718d503e603c8408860a3728112095b7e
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

<<<<<<< HEAD
export default ManNotificacionesLista;
=======
export default NotificacionesLista
>>>>>>> 4e7e4e5718d503e603c8408860a3728112095b7e
