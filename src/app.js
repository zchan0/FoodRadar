import './style.css'
import {Map} from './map.js'

const mapDiv = document.getElementById('map');
const defaultLoc = {lat: 39.8943011, lng: 116.3922383};
const mapOptions = {
    center: defaultLoc,
    zoom: 17
};

const map = new Map(mapDiv, mapOptions);
