import React, {useState, useEffect} from "react";
import { Suspense, lazy } from 'react';
import logo from './pics/oKG.svg';
import windLogo from './pics/oKS.svg';
import tempLogo from './pics/oH_.svg';
import humLogo from './pics/oHw.svg';
import './index.css';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Graph from './Graph.js';
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function convert_to_fahrenheit(celcius_data){
  return ((celcius_data * (9/5)) + 32).toFixed();
}

function convert_to_celcius(far_data){
  return ((far_data - 32) * (5/9)).toFixed();
}

function App() {
  const [symbol, setSymbol] = useState("F");
  const [isLoading, setLoading] = useState(true);
  const [ground_temperature, setGroundTemperature] = useState(0);
  const [air_temperature, setAirTemperature] = useState(0);
  const [data, setData] = useState({});
  useEffect(() => {
      fetch("https://55i449sxbd.execute-api.us-east-2.amazonaws.com/default/current_reading").then((res) => res.json().then((data) => {
              // Setting data from api
              data = data[0];
              setAirTemperature(convert_to_fahrenheit(data.ambient_temperature));
              setGroundTemperature(convert_to_fahrenheit(data.ground_temp));
              setData({
                wind_speed: (data.wind_speed).toFixed(), 
                wind_gust: (data.wind_gust).toFixed(), 
                humidity: (data.humidity).toFixed(), 
                pressure: (data.pressure).toFixed(), 
                ambient_temperature: convert_to_fahrenheit(data.ambient_temperature), 
                ground_temp: convert_to_fahrenheit(data.ground_temp), 
                current_day: data.current_day, 
                time_taken: data.time_taken
              });
          })
      );
  }, []);
  useEffect(() => {
    setLoading(false);
  }, [isLoading]);
  return (
    <ThemeProvider theme={darkTheme}>
        <Tabs
          id="fill-tab-example"
          className="mb-3"
          fill
        >
          <Tab eventKey="home" title="Current weather in Omaha, NE">
            <Container>
              <Row xs={1} md={2} lg={3}>
                <Col>
                <BootstrapSwitchButton onChange={degreeState => {
                  if(degreeState){
                    setAirTemperature(convert_to_celcius(air_temperature));
                    setGroundTemperature(convert_to_celcius(ground_temperature));
                    setSymbol("C");
                  }else{
                    setAirTemperature(convert_to_fahrenheit(air_temperature));
                    setGroundTemperature(convert_to_fahrenheit(ground_temperature));
                    setSymbol("F");
                  }
                }} checked={false} onlabel={<p>C&deg;</p>} offlabel={<p>F&deg;</p>} onstyle="secondary" offstyle="secondary" style="mt-2"/>
                </Col>
                <Col>
                  <h1 className="text-center">{isLoading ? ("Loading") : ("Weather in Omaha, NE")}</h1>
                </Col>
              </Row>
              <Card sm={12} id="card-1">
                <Container id="card-top">
                  <Row className="justify-content-around align-items-center">
                    <Col sm={4} className="text-center p-3"> 
                      <h1 style={{fontSize: '50px'}}>{((parseInt(air_temperature) + parseInt(ground_temperature)) / 2).toFixed()}&deg;{symbol}</h1>
                    </Col>
                    <Col sm={4} className="p-3">
                      <Card.Img variant="top" src={logo} height={100}></Card.Img>
                    </Col>
                    <Col sm={4} className="text-center p-3">
                    <h1 style={{fontSize: '35px'}}>Last updated: {data.time_taken} CDT</h1>
                    </Col>
                  </Row>
                </Container>
                <Card.Body className="card-body">
                  <Container style={{marginTop: '30px'}}>
                  <Row className="text-center" lg={3}>
                      <Col>
                        <span>
                        Humidity
                        <Card.Img variant="top" src={humLogo} height={30}></Card.Img>
                        <h3>{data.humidity}%</h3>
                        </span>
                      </Col>
                      <Col>
                        <span>
                        Air temp
                        <Card.Img variant="top" src={tempLogo} height={30}></Card.Img>
                        <h3>{air_temperature}&deg;{symbol}</h3>
                        </span>
                      </Col>
                      <Col>
                        <span>
                        Ground temp
                        <Card.Img variant="top" src={tempLogo} height={30}></Card.Img>
                        <h3>{ground_temperature}&deg;{symbol}</h3>
                        </span>
                      </Col>
                    </Row>
                  </Container>
                  <Container style={{marginTop: '40px'}}>
                  <Row className="text-center" lg={3}>
                    <Col>
                        <span>
                        Pressure
                        <br/>
                        <br/>
                        <h3>{data.pressure} hPa</h3>
                        </span>
                    </Col>
                    <Col>
                      <span>
                        Wind speed
                        <Card.Img variant="top" src={windLogo} height={30}></Card.Img>
                        <h3>{data.wind_speed} km/h</h3>
                      </span>
                    </Col>
                    <Col>
                    <span>
                      Wind gust
                      <Card.Img variant="top" src={windLogo} height={30}></Card.Img>
                      <h3>{data.wind_gust} km/h </h3>
                    </span>
                    </Col>
                  </Row>
                  </Container>
                </Card.Body>
              </Card>
             </Container>
             <Suspense fallback={<h1 className="text-center">Still Loading...</h1>}>
              <Graph/>
            </Suspense>
          </Tab>
          <Tab eventKey="graphs" title="Graphs">
            <Suspense fallback={<h1>Still Loading...</h1>}>
              <Graph/>
            </Suspense>
          </Tab>
        </Tabs>
    </ThemeProvider>
  );
}
export default App;

