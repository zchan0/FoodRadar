import ko from 'knockout'
import {GoogleMap} from './model'
import {Foursquare} from './api'
import './style.css'

let map;

const script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAY2F8IG3pLRgMYLPmhlwmzmrA39aoDl_k&libraries=places';
script.async = true;
script.defer = true;
script.onload = () => {
    map = new GoogleMap();
    map.setCenter(new google.maps.LatLng(34.6796693,-82.8371351));
    main();
};
document.body.appendChild(script);

function main() {
    // 1. get current loacation
    // 2. search nearby restaurants using Google Map API
    map.nearbySearch('3000', (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            console.log('Error: nearbySearch' + status);
            return;
        } else {
            processNearby(results);
        }
    });
}

// 3. filter results by duration not exceeds maxDuration in 'WALKING' mode
function processNearby(places) {
    const destinations = places.reduce((acc, place) => {
        acc.push(place.geometry.location);
        return acc;
    }, []);
    const request = {
        origins: [map.currentPos],
        destinations: destinations,
        travelMode: 'WALKING'
    };
    map.calculateDistance(request, (results, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            // 4. insert distance&duration fileds to places
            insertDistDuration(places, results);
            const filteredPlaces = searchWithinTime(places, 15 * 60);
            // 5. show filtered restaurants' names, get the details via Yelp
            console.log(filteredPlaces);
        } else {
            console.log('Error: getDistanceMatrix with' + status);
        }
    });
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
