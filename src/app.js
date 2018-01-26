import './style.css'
import {Map} from './map.js'

const script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAY2F8IG3pLRgMYLPmhlwmzmrA39aoDl_k';
script.async = true;
script.defer = true;
script.onload = function() {
    new Map();
};
document.body.appendChild(script);
