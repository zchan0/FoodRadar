import ko from 'knockout'
import {GoogleMap, Restaurant} from './model'
import {Foursquare} from './api'
import './style.css'

const script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAY2F8IG3pLRgMYLPmhlwmzmrA39aoDl_k&libraries=places';
script.async = true;
script.defer = true;
script.onload = () => {
    ko.applyBindings(new ViewModel());
};
document.body.appendChild(script);

class ViewModel {
    constructor() {
        const mapDiv = document.getElementById('map');
        this.map = new GoogleMap(mapDiv);
        this.restaurants = ko.observableArray();
        this.main();
    }

    main() {
        const self = this;
        this.map.setCenter(new google.maps.LatLng(34.6796693,-82.8371351));
        this.map.nearbySearch('3000', (results, status) => {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.log('Error: nearbySearch' + status);
                return;
            } else {
                self.processNearby(results);
            }
        });
    }

    processNearby(places) {
        const destinations = places.reduce((acc, place) => {
            acc.push(place.geometry.location);
            return acc;
        }, []);
        const request = {
            origins: [this.map.currentLoc],
            destinations: destinations,
            travelMode: 'WALKING'
        };
        const self = this;
        this.map.calculateDistance(request, (results, status) => {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                // insert distance&duration fields to places
                self.insertDistDuration(places, results);
                // filter places within maxDuration
                const filteredPlaces = self.searchWithinTime(places, 10 * 60);
                self.handleFilteredPlaces(filteredPlaces);
            } else {
                console.log('Error: getDistanceMatrix with' + status);
            }
        });
    }

    handleFilteredPlaces(places) {
        // If compareFunction(a, b) is less than 0, sort a to an index lower than b, i.e. a comes first.
        // details: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        const self = this;
        places.sort((placeA, placeB) => {
            return placeA.duration.value > placeB.duration.value;
        }).forEach((place) => {
            self.restaurants.push(new Restaurant(place));
            self.map.createMarker(place);
        });
        self.map.fitBoundsToMarkers();
    }

    insertDistDuration(places, results) {
        const elements = results.rows[0].elements;
        for (let i = 0; i < places.length; i++)  {
            if (elements[i].status == google.maps.places.PlacesServiceStatus.OK) {
                places[i].distance = elements[i].distance;
                places[i].duration = elements[i].duration;
            }
        }
    }

    searchWithinTime(places, maxDuration) {
        return places.reduce((acc, place) => {
            if (place.duration.value <= maxDuration) {
                acc.push(place);
            }
            return acc;
        }, []);
    }
}
