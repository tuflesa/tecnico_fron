import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from 'react-bootstrap/Modal'
import { Button, Row, Form, Col, Table } from 'react-bootstrap';
import { GeoAltFill} from 'react-bootstrap-icons';
import { PencilFill, HandThumbsUpFill, CheckCircleFill } from 'react-bootstrap-icons';
const BuscarRepuestos = ({cerrarListRepuestos, show, almacen, elegirRepuesto})=>{
    const [token] = useCookies(['tec-token']);
    const [filtro, setFiltro] = useState('');
    const [repuesto, setRepuesto] = useState(null);
    const [datos, setDatos] = useState({
        id:'',
        nombre: '',     
    });

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/detalle/?stocks_minimos__almacen__id=${almacen}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {   
            setRepuesto(res.data);
        })
        .catch(err => { console.log(err);})
    },[almacen]);
    
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }   

    return(
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="xl">
            <Modal.Title>Buscar Repuesto</Modal.Title>
            <Modal.Header>                             
                <Row>
                    <Col>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Buscar por Nombre</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange}                                        
                                        placeholder="Nombre contiene" />
                        </Form.Group>
                    </Col>
                </Row>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Localización</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {repuesto && repuesto.map( rep => {                                    
                                    return (                                                
                                        <tr key={rep.id}>
                                            <td>{rep.nombre}</td>  
                                            {/* <td>{repuesto.stocks_minimos.localizacion}</td> */}
                                            <td>{rep.stocks_minimos.map(s =>{
                                                if(s.almacen__id===almacen){return(s.localizacion)}
                                            })} </td>
                                            <td>
                                            <GeoAltFill className="mr-3 pencil" onClick={event => {elegirRepuesto(rep.id)}}/>
                                            </td>                                                
                                        </tr>
                                    )})
                                }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>                                               
                    <Button variant="info" onClick={cerrarListRepuestos}>
                        Cerrar
                    </Button>
                </Modal.Footer>
        </Modal>    
    )
}
export default BuscarRepuestos;