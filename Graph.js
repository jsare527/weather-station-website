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
    '0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': [], '8': [], '9': [], '10': [], '11': [], '12': [], '13': [], '14': [], '15': [], '16': [], '17': [], '18': [], '19': [], '20': [], '21': [], '22': [], '23': [], '24': []
  };
  try {
    dictionary.forEach(element => {
      let key = element['time_taken'].split(":")[0];
      const check_zero = key.split("0");
      if(check_zero[0] === ''){
        key = check_zero[1];
      }
      ret_dictionary[key].push({
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
  for(let i = 0; i<8; i++){
    const date = moment().subtract(i, 'day').format('MM/DD/YY');
    try {
      ret_dictionary[date] = dictionary[date];
    } catch (error) {}
  }
  return ret_dictionary;
}

function month_grouping(dictionary){
  let days_in_month = moment().daysInMonth();
  let ret_dictionary = {};
  while(days_in_month){
    try {
      var cur = moment().date(days_in_month).format("MM/DD/YY");
      ret_dictionary[cur] = dictionary[cur];
      days_in_month--; 
    } catch (error) {}
  }
  return ret_dictionary;
}

function year_grouping(dictionary){
  let ret_dictionary = {
    "Jan": [], "Feb": [], "Mar": [], "Apr": [], "May": [], "Jun": [], "Jul": [], "Aug": [], "Sep": [], "Oct": [], "Nov": [], "Dec": []
  }
  Object.keys(dictionary).forEach(element => {
    let tokens = element.split("/");
    let month = tokens[0];
    switch(month){
      case "01":
        ret_dictionary['Jan'] = dictionary[element];
        break;
      case "02":
        ret_dictionary['Feb'] = dictionary[element];
        break;
      case "03":
        ret_dictionary['Mar'] = dictionary[element];
        break;
      case "04":
        ret_dictionary['Apr'] = dictionary[element];
        break;
      case "05":
        ret_dictionary['May'] = dictionary[element];
        break;
      case "06":
        ret_dictionary['Jun'] = dictionary[element];
        break;
      case "07":
        ret_dictionary['Jul'] = dictionary[element];
        break;
      case "08":
        ret_dictionary['Aug'] = dictionary[element];
        break;
      case "09":
        ret_dictionary['Sep'] = dictionary[element];
        break;
      case "10":
        ret_dictionary['Oct'] = dictionary[element];
        break;
      case "11":
        ret_dictionary['Nov'] = dictionary[element];
        break;
      case "12":
        ret_dictionary['Dec'] = dictionary[element];
        break;
    }
  });
  return ret_dictionary;
}

//averages numbers in dictionary based off the key given
const average = (array, key) => {
    try {
        const length = array.length;
        return array.reduce((acc, value) => {
            return acc + (value[key] / length);
        }, 0);   
    } catch (error) {}
};

function graph_dictionary(dictionary, key_name){
    let arr = [];
    try {
        const keys = Object.keys(dictionary);
        keys.forEach(key => {
            arr.push({
                name: key,
                [key_name]: average(dictionary[key], key_name)
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
        case "Month":
          setKey('Date');
          setInterval(6);
          break;
        case "Year":
          setKey("Month");
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
          return hour_grouping(dictionary[current_date]);
        case "Week":
          return week_grouping(dictionary);
        case "Month":
          return month_grouping(dictionary);
        case "Year":
          return year_grouping(dictionary);
        default:
          return hour_grouping(dictionary[current_date]);
      }
    }
    const ambient_temp_avg = graph_dictionary(selectDict(value), 'ambient_temperature');
    const humidity_avg = graph_dictionary(selectDict(value), 'humidity');
    const wind_speed_avg = graph_dictionary(selectDict(value), 'wind_speed');
    const pressure_avg = graph_dictionary(selectDict(value), 'pressure');
    const wind_gust_avg = graph_dictionary(selectDict(value), 'wind_gust');
    const ground_temp_avg = graph_dictionary(selectDict(value), 'ground_temp');
    return(
      <Container>
        <Row xs={1} md={2} lg={3} className="g-4 mt-4 text-center mb-4">
          <Col>
            <Card id="card-grid">
              <Card.Body>
                <Card.Title className="d-flex justify-content-between">
                  <h5 className="mt-1">Average Air Temperature</h5>
                  <DropdownButton
                    title={value}
                    id="dropdown-menu"
                    variant="secondary"
                    onSelect={handleSelect}
                    >
                    <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
                    <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
                    <Dropdown.Item eventKey="Month">Month</Dropdown.Item>
                    <Dropdown.Item eventKey="Year">Year</Dropdown.Item>
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
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" interval={interval_val}/>
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="ambient_temperature" stroke="#8884d8" fill="#8884d8" />
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
                  <h5 className="mt-1">Average Ground Temperature</h5>
                  <DropdownButton
                    title={value}
                    id="dropdown-menu"
                    variant="secondary"
                    onSelect={handleSelect}
                    >
                    <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
                    <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
                    <Dropdown.Item eventKey="Month">Month</Dropdown.Item>
                    <Dropdown.Item eventKey="Year">Year</Dropdown.Item>
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
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" interval={interval_val}/>
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="ground_temp" stroke="#8884d8" fill="#8884d8" />
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
                  <h5 className="mt-1">Average Humidity</h5>
                  <DropdownButton
                    title={value}
                    id="dropdown-menu"
                    variant="secondary"
                    onSelect={handleSelect}
                    >
                    <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
                    <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
                    <Dropdown.Item eventKey="Month">Month</Dropdown.Item>
                    <Dropdown.Item eventKey="Year">Year</Dropdown.Item>
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
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" interval={interval_val}/>
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="humidity" stroke="#8884d8" fill="#8884d8" />
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
                  <h5 className="mt-1">Average Wind Speed</h5>
                  <DropdownButton
                    title={value}
                    id="dropdown-menu"
                    variant="secondary"
                    onSelect={handleSelect}
                    >
                    <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
                    <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
                    <Dropdown.Item eventKey="Month">Month</Dropdown.Item>
                    <Dropdown.Item eventKey="Year">Year</Dropdown.Item>
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
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" interval={interval_val}/>
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="wind_speed" stroke="#8884d8" fill="#8884d8" />
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
                  <h5 className="mt-1">Average Wind Gust</h5>
                  <DropdownButton
                    title={value}
                    id="dropdown-menu"
                    variant="secondary"
                    onSelect={handleSelect}
                    >
                    <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
                    <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
                    <Dropdown.Item eventKey="Month">Month</Dropdown.Item>
                    <Dropdown.Item eventKey="Year">Year</Dropdown.Item>
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
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" interval={interval_val}/>
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="wind_gust" stroke="#8884d8" fill="#8884d8" />
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
                  <h5 className="mt-1">Average Pressure</h5>
                  <DropdownButton
                    title={value}
                    id="dropdown-menu"
                    variant="secondary"
                    onSelect={handleSelect}
                    >
                    <Dropdown.Item eventKey="Day">Day</Dropdown.Item>
                    <Dropdown.Item eventKey="Week">Week</Dropdown.Item>
                    <Dropdown.Item eventKey="Month">Month</Dropdown.Item>
                    <Dropdown.Item eventKey="Year">Year</Dropdown.Item>
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
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" interval={interval_val}/>
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="pressure" stroke="#8884d8" fill="#8884d8" />
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