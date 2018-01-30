import './style.css'
import {Map} from './map'
import {Foursquare} from './api'
import {Restaurant} from './model'

const script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAY2F8IG3pLRgMYLPmhlwmzmrA39aoDl_k';
script.async = true;
script.defer = true;
script.onload = main;
document.body.appendChild(script);

function main() {
    const map = new Map();
    loadRestaurants(map.currentPos)
    .then(restaurants => {
        console.log(restaurants);
    });
}

function loadRestaurants(currentPos) {
    const foursquare = new Foursquare();
    const options = {
        section: 'food',
        ll: currentPos['lat'] + ',' + currentPos['lng']
    };

    return foursquare.getVenueRecommendations(options)
            .then(venues => {
                return venues.reduce((restaurants, venue) => {
                    restaurants.push(new Restaurant(venue));
                    return restaurants;
                }, []);
            });
}
