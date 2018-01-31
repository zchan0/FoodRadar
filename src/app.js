import './style.css'
import {GoogleMap, Foursquare} from './api'

const script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAY2F8IG3pLRgMYLPmhlwmzmrA39aoDl_k&libraries=places';
script.async = true;
script.defer = true;
script.onload = main;
document.body.appendChild(script);

function main() {
    const map = new GoogleMap();
    // 1. get current loacation
    // 2. search nearby restaurants using Google Map API
    const handleNearbyResults = (places, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            // 3. filter results by duration not exceeds maxDuration in 'WALKING' mode
            const destinations = places.reduce((acc, place) => {
                acc.push(place.geometry.location);
                return acc;
            }, []);
            const request = {
                origins: [map.currentPos],
                destinations: destinations,
                travelMode: 'WALKING'
            };
            const service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix(request, (results, status) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    // 4. insert distance&duration fileds to places
                    const elements = results.rows[0].elements;
                    for (let i = 0; i < places.length; i++)  {
                        if (elements[i].status == google.maps.places.PlacesServiceStatus.OK) {
                            const distance = {text: elements[i].distance.text, value: elements[i].distance.value};
                            const duration = {text: elements[i].duration.text, value: elements[i].duration.value};
                            places[i].distance = distance;
                            places[i].duration = duration;
                        }
                    }
                    const filteredPlaces = searchWithinTime(places, 15 * 60);
                    console.log(filteredPlaces);
                } else {
                    console.log('Error: getDistanceMatrix with' + status);
                }
            });
        } else {
            console.log('Error: nearbySearch' + status);
        }
    };
    map.nearbySearch('3000', handleNearbyResults);
    // 5. show filtered restaurants' names, get the details via Foursquare
}

function searchWithinTime(places, maxDuration) {
    return places.reduce((acc, place) => {
        if (place.duration.value <= maxDuration) {
            acc.push(place);
        }
        return acc;
    }, []);
}
