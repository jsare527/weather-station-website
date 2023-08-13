import React, {useState, useEffect} from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import moment from 'moment';
const current_date = moment().format('MM/DD/YY');


function hour_grouping(dictionary){
  let ret_dictionary = {
    '0': [], '1': [], '2': [], 3: [], '4': [], '5': [], '6': [], '7': [], '8': [], '9': [], '10': [], '11': [], '12': [], '13': [], '14': [], '15': [], '16': [], '17': [], '18': [], '19': [], '20': [], '21': [], '22': [], '23': [], '24': []
  };
  try {
    dictionary.forEach(element => {
      if(Object.keys(element).length === 0){ return;}
      const key = element['time_taken'].split(":")[0];
      const parseZero = parseInt(key);
      ret_dictionary[parseZero].push({
        'ambient_temperature': element['ambient_temperature'],
        'ground_temp': element['ground_temp'],
        'wind_speed': element['wind_speed'],
        'wind_gust': element['wind_gust'],
        'humidity': element['humidity'],
        'pressure': element['pressure'],
        'time_taken': element['time_taken']
      })
    });
  } catch (error) {}
  return ret_dictionary;
}

function week_grouping(dictionary){
  let ret_dictionary = {};
  for(let i = 7; i>=0; i--){
    const date = moment().subtract(i, 'day').format('MM/DD/YY');
    try {
      ret_dictionary[date] = dictionary[date];
    } catch (error) {}
  }
  return ret_dictionary;
}

function convert_to_fahrenheit(celcius_data){
  if(Number(celcius_data) === 0){ return 0;}
  return ((celcius_data * (9/5)) + 32).toFixed();
}

//function month_grouping(dictionary){
//  let days_in_month = moment().daysInMonth();
//  let ret_dictionary = {};
//  try {
//    for(let i=1; i<=days_in_month; i++){
//      let date = moment().date(i).format("MM/DD/YY");
//      ret_dictionary[date] = dictionary[date];
//      console.log(date);
//    } 
//  } catch (error) {}
//  return ret_dictionary;
//}

//function year_grouping(dictionary){
//  let ret_dictionary = {
//    "Jan": [], "Feb": [], "Mar": [], "Apr": [], "May": [], "Jun": [], "Jul": [], "Aug": [], "Sep": [], "Oct": [], "Nov": [], "Dec": []
//  }
//  Object.keys(dictionary).forEach(element => {
//    let tokens = element.split("/");
//    let month = tokens[0];
//    switch(month){
//      case "01":
//        ret_dictionary['Jan'] = dictionary[element];
//        break;
//      case "02":
//        ret_dictionary['Feb'] = dictionary[element];
//        break;
//      case "03":
//        ret_dictionary['Mar'] = dictionary[element];
//        break;
//      case "04":
//        ret_dictionary['Apr'] = dictionary[element];
//        break;
//      case "05":
//        ret_dictionary['May'] = dictionary[element];
//        break;
//      case "06":
//        ret_dictionary['Jun'] = dictionary[element];
//        break;
//      case "07":
//        ret_dictionary['Jul'] = dictionary[element];
//        break;
//      case "08":
//        ret_dictionary['Aug'] = dictionary[element];
//        break;
//      case "09":
//        ret_dictionary['Sep'] = dictionary[element];
//        break;
//      case "10":
//        ret_dictionary['Oct'] = dictionary[element];
//        break;
//      case "11":
//        ret_dictionary['Nov'] = dictionary[element];
//        break;
//      case "12":
//        ret_dictionary['Dec'] = dictionary[element];
//        break;
//    }
//  });
//  return ret_dictionary;
//}

//averages numbers in dictionary based off the key given
const average = (array, key) => {
    try {
        const length = array.length;
        return array.reduce((acc, value) => {
            return (acc + (value[key] / length));
        }, 0);   
    } catch (error) {}
};

function graph_dictionary(dictionary, key_name, convert=false){
    let arr = [];
    try {
        const keys = Object.keys(dictionary);
        keys.forEach(key => {
            let number;
            if(convert){
              number = convert_to_fahrenheit(average(dictionary[key], key_name).toFixed(2));
            }else{
              number = average(dictionary[key], key_name).toFixed(2);
            }
            arr.push({
                name: key,
                [key_name]: number
            });
        })
        //reverse order of array, since most recent data will be at the beginning of list.
        return arr;
    } catch (error) {}
}

function get_grouped_dates(){
  const [data, setData] = useState([]);
  useEffect(() => {
    async function fetchData(){
      let response = await fetch("https://55i449sxbd.execute-api.us-east-2.amazonaws.com/default/grouped_dates");
      response = await response.json();
      setData(response);
    };
    fetchData();
  }, []);
  return data;
}


export default function Graph(){
    const [value, setValue] = useState('Day');
    const [key, setKey] = useState('Hour');
    const [interval_val, setInterval] = useState(1);
    const dictionary = get_grouped_dates();
    const handleSelect = (event_key) => {
      setValue(event_key);
      switch(event_key){
        case "Day":
          setKey('Hour');
          setInterval(1);
          break;
        case "Week":
          setKey('Date');
          setInterval(1);
          break;
        default:
          setKey('Hour');
          setInterval(1);
          break;
      }
    }
    const selectDict = (val) => {
      switch(val){
        case "Day":
          return hour_grouping(dictionary['day']);
        case "Week":
          return week_grouping(dictionary['week']);
        default:
          return hour_grouping(dictionary[current_date]);
      }
    }
    const ambient_temp_avg = graph_dictionary(selectDict(value), 'ambient_temperature', true);
    const humidity_avg = graph_dictionary(selectDict(value), 'humidity');
    const wind_speed_avg = graph_dictionary(selectDict(value), 'wind_speed');
    const pressure_avg = graph_dictionary(selectDict(value), 'pressure');
    const wind_gust_avg = graph_dictionary(selectDict(value), 'wind_gust');
    const ground_temp_avg = graph_dictionary(selectDict(value), 'ground_temp', true);
    return(
      <Container>
        <Row xs={1} md={2} lg={3} className="g-4 mt-4 text-center mb-4">
          <Col>
            <Card id="card-grid">
              <Card.Body>
                <Card.Title className="d-flex justify-content-between">
                  <h5 className="mt-1 text-light">Average Air Temperature (F&deg;)</h5>
                  <DropdownButton
                    title={value}
                    id="dropdown-menu"
                    variant="secondary"
                    onSelect={handleSelect}
                    >
                    <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
                    <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
                  </DropdownButton>
                </Card.Title>
                <Card.Text>
                  <ResponsiveContainer width="100%" height={250}>
                      <AreaChart
                        title="Avg air temp"
                        data={ambient_temp_avg}
                        margin={{
                          top: 0,
                          right: 10,
                          left: -20,
                          bottom: 0,
                        }}
                      >
                        <defs>
                        <linearGradient id="colorAir" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF5F1F" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#39FF14" stopOpacity={0.2}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0.2 " />
                        <XAxis dataKey="name" interval={interval_val} tick={{fill: 'black'}} tickLine={{stroke: 'black'}}/>
                        <YAxis tick={{fill: 'black'}} tickLine={{stroke: 'black'}}/>
                        <Tooltip />
                        <Area type="monotone" dataKey="ambient_temperature" fillOpacity={1} stroke="#8884d8" fill="url(#colorAir)" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p>{key}</p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card id="card-grid">
              <Card.Body>
              <Card.Title className="d-flex justify-content-between">
                  <h5 className="mt-1 text-light">Average Ground Temperature (F&deg;)</h5>
                  <DropdownButton
                    title={value}
                    id="dropdown-menu"
                    variant="secondary"
                    onSelect={handleSelect}
                    >
                    <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
                    <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
                  </DropdownButton>
                </Card.Title>
                <Card.Text>
                  <ResponsiveContainer width="100%" height={250}>
                      <AreaChart
                        title="Avg ground temp"
                        data={ground_temp_avg}
                        margin={{
                          top: 0,
                          right: 10,
                          left: -20,
                          bottom: 0,
                        }}
                      >
                        <defs>
                        <linearGradient id="colorGround" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF5F1F" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#39FF14" stopOpacity={0.2}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0.2 " />
                        <XAxis dataKey="name" interval={interval_val} tick={{fill: 'black'}} tickLine={{stroke: 'black'}}/>
                        <YAxis tick={{fill: 'black'}} tickLine={{stroke: 'black'}}/>
                        <Tooltip />
                        <Area type="monotone" dataKey="ground_temp" fillOpacity={1} stroke="#8884d8" fill="url(#colorGround)" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p>{key}</p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card id="card-grid">
              <Card.Body>
              <Card.Title className="d-flex justify-content-between">
                  <h5 className="mt-1 text-light">Average Humidity (%)</h5>
                  <DropdownButton
                    title={value}
                    id="dropdown-menu"
                    variant="secondary"
                    onSelect={handleSelect}
                    >
                    <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
                    <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
                  </DropdownButton>
                </Card.Title>
                <Card.Text>
                <ResponsiveContainer width="100%" height={250}>
                      <AreaChart
                        title="Avg humidity"
                        data={humidity_avg}
                        margin={{
                          top: 0,
                          right: 10,
                          left: -20,
                          bottom: 0,
                        }}
                      >
                        <defs>
                        <linearGradient id="colorHumid" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4BF0FC" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#39FF14" stopOpacity={0.2}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0.2 " />
                        <XAxis dataKey="name" interval={interval_val} tick={{fill: 'black'}} tickLine={{stroke: 'black'}}/>
                        <YAxis tick={{fill: 'black'}} tickLine={{stroke: 'black'}}/>
                        <Tooltip />
                        <Area type="monotone" dataKey="humidity" fillOpacity={1} stroke="#8884d8" fill="url(#colorHumid)" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p>{key}</p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card id="card-grid">
              <Card.Body>
              <Card.Title className="d-flex justify-content-between">
                  <h5 className="mt-1 text-light">Average Wind Speed (km/h)</h5>
                  <DropdownButton
                    title={value}
                    id="dropdown-menu"
                    variant="secondary"
                    onSelect={handleSelect}
                    >
                    <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
                    <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
                  </DropdownButton>
                </Card.Title>
                <Card.Text>
                <ResponsiveContainer width="100%" height={250}>
                      <AreaChart
                        title="Avg wind speed"
                        data={wind_speed_avg}
                        margin={{
                          top: 0,
                          right: 10,
                          left: -20,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="0.2 " />
                        <XAxis dataKey="name" interval={interval_val} tick={{fill: 'black'}} tickLine={{stroke: 'black'}}/>
                        <YAxis tick={{fill: 'black'}} tickLine={{stroke: 'black'}}/>
                        <Tooltip />
                        <Area type="monotone" dataKey="wind_speed" fillOpacity={0.4} stroke="#00FFFF" fill="#4BF0FC" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p>{key}</p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card id="card-grid">
              <Card.Body>
              <Card.Title className="d-flex justify-content-between">
                  <h5 className="mt-1 text-light">Average Wind Gust (km/h)</h5>
                  <DropdownButton
                    title={value}
                    id="dropdown-menu"
                    variant="secondary"
                    onSelect={handleSelect}
                    >
                    <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
                    <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
                  </DropdownButton>
                </Card.Title>
                <Card.Text>
                <ResponsiveContainer width="100%" height={250}>
                      <AreaChart
                        title="Avg wind gust"
                        data={wind_gust_avg}
                        margin={{
                          top: 0,
                          right: 10,
                          left: -20,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="0.2 " />
                        <XAxis dataKey="name" interval={interval_val} tick={{fill: 'black'}} tickLine={{stroke: 'black'}}/>
                        <YAxis tick={{fill: 'black'}} tickLine={{stroke: 'black'}}/>
                        <Tooltip />
                        <Area type="monotone" dataKey="wind_gust" fillOpacity={0.4} stroke="#00FFFF" fill="#4BF0FC" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p>{key}</p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card id="card-grid">
              <Card.Body>
              <Card.Title className="d-flex justify-content-between">
                  <h5 className="mt-1 text-light">Average Pressure (hPa)</h5>
                  <DropdownButton
                    title={value}
                    id="dropdown-menu"
                    variant="secondary"
                    onSelect={handleSelect}
                    >
                    <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
                    <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
                  </DropdownButton>
                </Card.Title>
                <Card.Text>
                <ResponsiveContainer width="100%" height={250}>
                      <AreaChart
                        title="Avg pressure"
                        data={pressure_avg}
                        margin={{
                          top: 0,
                          right: 10,
                          left: -18,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="0.2 " />
                        <XAxis dataKey="name" interval={interval_val} tick={{fill: 'black'}} tickLine={{stroke: 'black'}}/>
                        <YAxis tick={{fill: 'black'}} tickLine={{stroke: 'black'}}/>
                        <Tooltip />
                        <Area type="monotone" dataKey="pressure" fillOpacity={0.6} stroke="#8884d8" fill="#8884d8" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p>{key}</p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
       </Row>
      </Container>
      );
}