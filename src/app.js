import './style.css'
import {Map} from './map'

const script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAY2F8IG3pLRgMYLPmhlwmzmrA39aoDl_k';
script.async = true;
script.defer = true;
script.onload = initMap;
document.body.appendChild(script);

function initMap() {
    const map = new Map();
}
