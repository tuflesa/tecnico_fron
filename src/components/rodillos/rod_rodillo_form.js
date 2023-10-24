import { Alert, Container } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import { Button, Form, Col, Row, Table, Modal } from 'react-bootstrap';
import { PlusCircle, Clipboard, Trash} from 'react-bootstrap-icons';
import PlanoForm from './rod_plano_nuevo';
import { Link } from 'react-router-dom';
import {invertirFecha} from '../utilidades/funciones_fecha';
import RodRevisionForm from './rod_revision_form';
import RodParametrosEstandar from './rod_parametros_estandar';


const RodRodilloForm = ({rodillo, setRodillo}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    
    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [operaciones, setOperaciones] = useState([]);
    const [tipo_rodillo, setTipoRodillo] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [planos, setPlanos] = useState(null);
    const [valor_conjuntos, setValorConjuntos] = useState('');
    const [show, setShow] = useState(false);
    const [showParam, setShowParam] = useState(false);
    const [showParamNot, setShowParamNot] = useState(false);
    const [filaSeleccionada, setFilaSeleccionada] = useState(null);
    const [revisiones, setRevisiones] = useState(null);
    const [valor_parametros, setValorParametros] = useState('');
    const [parametros, setParametros] = useState(null);
    const [filaSeleccionadaParametros, setFilaSeleccionadaParametros] = useState(null);
    const [plano_id, setPlano_id] = useState(null);
    const [showRevision, setShowRevision] = useState(false);
    const [showParametros, setShowParametros] = useState(false);
    
    const [show_plano, setShowPlano] = useState(false);

    const [datos, setDatos] = useState({
        empresa: rodillo.id?rodillo.operacion.seccion.maquina.empresa_id:'',
        zona: rodillo.id?rodillo.operacion.seccion.maquina.id:'',
        seccion: rodillo.id?rodillo.operacion.seccion.id: '',
        operacion: rodillo.id?rodillo.operacion.id:'',
        grupo: rodillo.grupo?rodillo.grupo.id:'',
        tipo_rodillo: rodillo.id?rodillo.tipo.id:'',
        material: rodillo.id?rodillo.material.id:'',
        nombre: rodillo.id?rodillo.nombre:'',
        tipo_seccion: rodillo.id?rodillo.operacion.seccion.tipo:'',
        tipo_plano: rodillo.id?rodillo.tipo_plano:'',
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => {
        if(rodillo.id){
            axios.get(BACKEND_SERVER + `/api/rodillos/plano/?rodillos=${rodillo.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
            })
            .then( res => {
                setPlanos(res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, rodillo]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/rodillos/materiales/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setMateriales(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/rodillos/tipo_rodillo/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setTipoRodillo(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => {
        if (datos.empresa === '') {
            setZonas([]);
            setDatos({
                ...datos,
                zona: '',
                seccion: '',
                operacion: '',
                grupo: '',
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setZonas(res.data);
                if(!rodillo.id){
                    setDatos({
                        ...datos,
                        zona: '',
                        seccion: '',
                        operacion: '',
                        grupo: '',
                    });
                }
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.empresa]);

    useEffect(() => {
        if(rodillo.id){
            if(datos.zona!=rodillo.operacion.seccion.maquina.id){
                setOperaciones([]);
                setSecciones([]);
                setGrupos([]);
            }
        }
        if (datos.zona === '') {
            setSecciones([]);
            setOperaciones([]);
            setGrupos([]);
            setDatos({
                ...datos,
                seccion: '',
                operacion:'',
                grupo: '',
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/rodillos/seccion/?maquina__id=${datos.zona}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setSecciones(res.data);
                if(!rodillo.id){
                    setOperaciones([]);
                    setDatos({
                        ...datos,
                        seccion: '',
                        operacion: '',
                        grupo: '',
                    });
                }
            })
            .catch( err => {
                console.log(err);
            });

            axios.get(BACKEND_SERVER + `/api/rodillos/grupo/?maquina=${datos.zona}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setGrupos(res.data);
                if(res.data.length === 0){
                    alert('No tenemos ningún grupo dado de alta para esta máquina');
                }
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.zona]);

    useEffect(() => {
        if (datos.seccion === ''){
            setOperaciones([]);
            setDatos({
                ...datos,
                operacion: '',
            });
        }
        else{
            axios.get(BACKEND_SERVER + `/api/rodillos/operacion/?seccion=${datos.seccion}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setOperaciones(res.data);
                if(!rodillo.id){
                    setDatos({
                        ...datos,
                        operacion: '',
                    });
                }
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.seccion]);

    useEffect(() => { //recogemos los parámetros que tenemos ya guardados
        if(rodillo.id){
            axios.get(BACKEND_SERVER + `/api/rodillos/parametros_estandar/?rodillo=${rodillo.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( r => {
                setParametros(r.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    },[token, rodillo, showParametros]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const GuardarRodillo = (event) => {
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/rodillos/rodillo_nuevo/`, {
            nombre: datos.nombre,
            operacion: datos.operacion,
            grupo: datos.grupo,
            tipo: datos.tipo_rodillo,
            material: datos.material,
            tipo_plano: datos.tipo_plano,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            window.location.href = `/rodillos/editar/${res.data.id}`;
        })
        .catch(err => { 
            console.log(err);
            alert('Falta datos, por favor rellena todo los datos que tengan *');
        })
    };

    const ActualizarRodillo = (event) => {
        event.preventDefault();
        axios.put(BACKEND_SERVER + `/api/rodillos/rodillo_editar/${rodillo.id}/`, {
            nombre: datos.nombre,
            operacion: datos.operacion,
            grupo: datos.grupo,
            tipo: datos.tipo_rodillo,
            material: datos.material,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            window.location.href = `/rodillos/editar/${res.data.id}`;
        })
        .catch(err => { 
            console.log(err);
            alert('Falta datos, por favor rellena todo los datos que tengan *');
        })
    };

    const handleDisabled = () => {
        if(rodillo.id){
            return true
        }
    }

    const añadirPlano = () => {
        setShowPlano(true);
    }

    const añadirParametros = () => {
        setShowParametros(true);
    }

    const cerrarParametros = () => {
        setShowParametros(false);
    }

    const cerrarPlano = () => {
        setShowPlano(false);
    }

    const abrirConjuntos = (plano) => {        
        axios.get(BACKEND_SERVER + `/api/rodillos/revision_conjuntos/?plano=${plano}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setRevisiones(res.data);
            setShow(!show);                          
            if(show){
                const tabla = (
                    <div>
                    <h2 style={{textAlign: 'center'}}>Revisiones del plano</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Motivo</th>
                                <th>Nombre</th>
                                <th>Archivo</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {res.data && res.data.map( conjunto => {
                                return (
                                    <React.Fragment key={conjunto.id}>
                                        <tr key={conjunto.id}>
                                            <td>{conjunto.motivo}</td>
                                            <td>{conjunto.plano}</td>
                                            <td>
                                                <a href={conjunto.archivo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Haz clic para abrir el PDF">
                                                {conjunto.archivo}
                                                </a>
                                            </td>
                                            
                                            <td>{invertirFecha(String(conjunto.fecha))}</td>
                                        </tr>
                                        {filaSeleccionadaParametros === conjunto.id && (
                                            <tr>
                                                <td colSpan="3">{valor_parametros}</td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )})
                            }
                        </tbody>
                    </Table>
                    </div>
                );
                setValorConjuntos(tabla);
                setFilaSeleccionada(plano);
            }
            else{
                setValorConjuntos('');
                setFilaSeleccionada('');
                setRevisiones(null);
            }
        })
        .catch( err => {
            console.log(err);
        });
        
        
    };

    const eliminarParametros = ()=>{
        for(var x=0;x<parametros.length;x++){
            axios.delete(BACKEND_SERVER + `/api/rodillos/parametros_estandar/${parametros[x].id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( res => {
                window.location.href = `/rodillos/editar/${rodillo.id}`; 
            })
            .catch( err => {
                console.log(err);
            });
        }
    }

    const eliminarPlano = (plano) => { 
        var confirmacion = window.confirm('¿Confirma que desea eliminar plano, con sus revisiones y parámetros?');
        if(confirmacion){
            axios.delete(BACKEND_SERVER + `/api/rodillos/plano/${plano}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( res => {
                eliminarParametros();
            })
            .catch( err => {
                console.log(err);
            });
            
        }    
    };

    const NuevaRevision = (plano) => {
        setPlano_id(plano);
        setShowRevision(true);
    }

    return (
        <Container className='mt-5 pt-1'>
            {rodillo.length===0?
                <h5 className='mt-5'>Nuevo Rodillo</h5>:
                <h5 className='mt-5'>Editar Rodillo</h5>}
            <Form >
                <Row>
                    <Form.Group controlId="nombre">
                        <Form.Label>Nombre del rodillo *</Form.Label>
                        <Form.Control type="text" 
                                    name='nombre' 
                                    value={datos.nombre}
                                    onChange={handleInputChange} 
                                    placeholder="Rodillo"
                                    autoFocus
                        />
                    </Form.Group>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa *</Form.Label>
                            <Form.Control as="select"  
                                        name='empresa' 
                                        value={datos.empresa}
                                        onChange={handleInputChange}
                                        disabled={handleDisabled()}
                                        placeholder="Empresa">
                                        <option key={0} value={''}>Todas</option>    
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
                        <Form.Group controlId="zona">
                            <Form.Label>Zona *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.zona}
                                            name='zona'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todas</option>
                                {zonas && zonas.map( zona => {
                                    return (
                                    <option key={zona.id} value={zona.id}>
                                        {zona.siglas}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="seccion">
                            <Form.Label>Seccion *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.seccion}
                                            name='seccion'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todas</option>
                                {secciones && secciones.map( seccion => {
                                    return (
                                    <option key={seccion.id} value={seccion.id}>
                                        {seccion.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="operacion">
                            <Form.Label>Operación *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.operacion}
                                            name='operacion'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                {operaciones && operaciones.map( operacion => {
                                    return (
                                    <option key={operacion.id} value={operacion.id}>
                                        {operacion.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="tipo_rodillo">
                            <Form.Label>Tipo de Rodillo *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.tipo_rodillo}
                                            name='tipo_rodillo'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                {tipo_rodillo && tipo_rodillo.map( tipo => {
                                    return (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="material">
                            <Form.Label>Tipo de Material *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.material}
                                            name='material'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                {materiales && materiales.map( material => {
                                    return (
                                    <option key={material.id} value={material.id}>
                                        {material.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="grupo">
                            <Form.Label>Grupo al que pertenece</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.grupo}
                                            name='grupo'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                {grupos && grupos.map(grupo => {
                                    return (
                                    <option key={grupo.id} value={grupo.id}>
                                        {grupo.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
                {rodillo?rodillo.length===0?<Button variant="outline-primary" onClick={GuardarRodillo}>Guardar</Button>:<Button variant="outline-primary" onClick={ActualizarRodillo}>Actualizar</Button>:''}
                {parametros?parametros.length===0?<Button className={'mx-2'} onClick={añadirParametros}>Añadir Parámetros</Button>:<Button className={'mx-2'} onClick={añadirParametros}>Editar Parámetros</Button>:''}
                {rodillo.length!==0?
                    <React.Fragment> 
                        <Form.Row>
                        <Col>
                            <Row>
                                <Col>
                                <h5 className="pb-3 pt-1 mt-2">Añadir Plano:</h5>
                                </Col>
                                <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                        <PlusCircle className="plus mr-2" size={30} onClick={añadirPlano}/>
                                </Col>
                            </Row>
                            
                        </Col>
                        </Form.Row>
                    </React.Fragment>
                :null}
            </Form>
            {planos?planos.length!==0?
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Revisiones</th>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        { planos && planos.map( plano => {
                            return (
                                <React.Fragment key={plano.id}>
                                    <tr key={plano.id}>
                                        <td>
                                            <button type="button" className="btn btn-default" value={plano.id} name='prueba' onClick={event => {abrirConjuntos(plano.id)}}>--</button>
                                        </td>
                                        <td>{plano.id}</td>
                                        <td>{plano.nombre}</td>
                                        <td>
                                            <Clipboard className="mr-3 pencil" onClick={event => {NuevaRevision(plano.id)}}/>   
                                            <Trash className="mr-3 pencil" onClick={event => {eliminarPlano(plano.id)}}/>                                                      
                                        </td>
                                    </tr>
                                    {filaSeleccionada === plano.id && (
                                        <tr>
                                            <td colSpan="4">{valor_conjuntos}</td>
                                        </tr>
                                        )}
                                </React.Fragment>
                            )})
                        }
                    </tbody>
                </Table>
            :"No hay planos relacionados con este rodillo":null}
            
            <PlanoForm show={show_plano}
                           handleCloseParametros={cerrarPlano}
                           tipo_seccion={datos.tipo_seccion}
                           tipo_rodillo={datos.tipo_rodillo}
                           rodillo_id={rodillo.id}
                           rodillo_tipo_plano={datos.tipo_plano}/>
            
            <RodRevisionForm showRev={showRevision}
                           plano_id={plano_id}
                           setShowRevision={setShowRevision}
                           show_revision={showRevision}
                           tipo_plano_id={datos.tipo_plano}
                           rodillo_id={rodillo.id}/>
            
            <RodParametrosEstandar showPa={showParametros}
                           tipo_plano_id={datos.tipo_plano}
                           rodillo_id={rodillo.id}
                           handleClose={cerrarParametros}/>

        </Container>
    );
}
export default RodRodilloForm;