import ko from 'knockout'
import {GoogleMap} from './model'
import {Foursquare} from './api'
import './style.css'

const ViewModel = function() {
    const self = this;

    self.ratingOptions = [
        {value: 1, text: '1.0 and up'},
        {value: 2, text: '2.0 and up'},
        {value: 3, text: '3.0 and up'},
        {value: 4, text: '4.0 and up'},
        {value: 4.5, text: '4.5 and up'}
    ];
    self.ratingFilter = ko.observable();

    self.allPlaces = ko.observableArray();
    self.filteredPlaces = ko.computed(() => {
        if (self.ratingFilter() === undefined) {
            return self.allPlaces();
        } else {
            return ko.utils.arrayFilter(self.allPlaces(), place => {
                return place.rating >= self.ratingFilter();
            });
        }
    });

    self.loadPlaces = (places) => {
        places.forEach(place => {
            self.allPlaces.push(place);
        });
    };
}

function main() {
    const mapDiv = document.getElementById('map');
    map = new GoogleMap(mapDiv);
    map.setCenter(new google.maps.LatLng(34.6796693,-82.8371351));

    map.nearbySearch('3000', (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            console.log('Error: nearbySearch' + status);
            return;
        } else {
            processNearby(results);
        }
    });
}

function processNearby(places) {
    const destinations = places.reduce((acc, place) => {
        acc.push(place.geometry.location);
        return acc;
    }, []);
    const request = {
        origins: [map.currentLoc],
        destinations: destinations,
        travelMode: 'WALKING'
    };

    map.calculateDistance(request, (results, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            // insert distance&duration fields to places
            insertDistDuration(places, results);
            // filter places within maxDuration
            const filteredPlaces = searchWithinTime(places, 20 * 60);
            handleFilteredPlaces(filteredPlaces);
        } else {
            console.log('Error: getDistanceMatrix with' + status);
        }
    });
}

function handleFilteredPlaces(places) {
    vm.loadPlaces(places);
    ko.applyBindings(vm);
}

function insertDistDuration(places, results) {
    const elements = results.rows[0].elements;
    for (let i = 0; i < places.length; i++)  {
        if (elements[i].status == google.maps.places.PlacesServiceStatus.OK) {
            places[i].distance = elements[i].distance;
            places[i].duration = elements[i].duration;
        }
    }
}

function searchWithinTime(places, maxDuration) {
    return places.reduce((acc, place) => {
        if (place.duration.value <= maxDuration) {
            acc.push(place);
        }
        return acc;
    }, []);
}

let map;
const vm = new ViewModel();

const script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAY2F8IG3pLRgMYLPmhlwmzmrA39aoDl_k&libraries=places';
script.async = true;
script.defer = true;
script.onload = main;
document.body.appendChild(script);
