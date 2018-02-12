import ko from 'knockout'
import {GoogleMap, Photo} from './model'
import {Foursquare} from './api'
import './style.css'

Array.prototype.diff = function(other) {
    return this.filter(function(item) {
        return other.indexOf(item) < 0;
    });
};

const ViewModel = function() {
    const self = this;

    self.ratingOptions = [
        {value: 0, text: 'Rating'},
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
    self.filteredPlaces.subscribe(() => {
        if (self.ratingFilter() !== undefined) {
            const hidePlaces = self.allPlaces().diff(self.filteredPlaces());
            if (!hidePlaces.length) return;

            let marker;
            hidePlaces.forEach(place => {
                marker = self.fetchMarker(place);
                if (marker.getMap()) marker.setMap(null);
            });
            const markers = self.filteredPlaces().reduce((acc, place) => {
                acc.push(self.fetchMarker(place));
                return acc;
            }, []);
            map.showMarkers(markers);
            map.fitBoundsToMarkers(markers);
        }
    })

    self.allMarkers = {};
    self.allVenues = {};

    self.loadPlaces = (places) => {
        const foursquare = new Foursquare();
        const cmpOptions = {
            usage: 'search',
            ignorePunctuation: true
        };
        places.forEach(place => {
            foursquare.searchForVenue(place.name, place.geometry.location.toUrlValue())
            .then(venue => {
                // may cannot find corresponding venue of place
                if (place.name.localeCompare(venue.name, 'co', cmpOptions) === 0) {
                    foursquare.getVenueDetails(venue.id).then(venueDetails => {
                        self.allVenues[place.place_id] = venueDetails;
                    });
                }
            });
            self.allPlaces.push(place);
            self.createMarker(place);
        });
        map.fitBoundsToMarkers(Object.values(self.allMarkers));
    };

    self.createMarker = (place) => {
        const marker = map.createMarker(place);
        marker.addListener('mouseover', () => {
            self.showInfoWindow(place);
        });
        // marker.addListener('mouseout', self.hideInfoWindow);
        marker.setMap(map.map);
        self.allMarkers[place.place_id] = marker;
    };

    self.fetchMarker = (place) => {
        return self.allMarkers[place.place_id];
    };

    self.showInfoWindow = ((place) => {
        const marker = self.fetchMarker(place);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
            marker.setAnimation(null)
        }, 700);
        // only one info window
        if (!self.infoWindow) {
            self.infoWindow = new google.maps.InfoWindow();
        }
        // no need to update infoWindow
        if (self.infoWindow.marker == marker) {
            // console.log('infoWindow has already shown up.');
            return;
        }
        // close before open a new one
        self.hideInfoWindow();

        const venue = self.allVenues[place.place_id];
        if (venue) {
            place['tips'] = venue.tips;
        }

        let contentString = '<div class="place-story">';
        contentString += '<h2 class="title">' + place.name + '</h2>';

        if (place.tips && place.tips.count > 0) {
            contentString += '<div class="tip">';
            const tips = place.tips.groups[0].items;
            // pick the tip most people agreed
            tips.sort((a, b) => {
                return b.agreeCount - a.agreeCount;
            });
            const tip = tips[0];
            const user = tip.user;

            contentString += '<p class="tip">\"' + tip.text + '"</p>';
            contentString += '<div class="user">';

            contentString += '<div class="avatar">';
            const photoUrl = user.photo.prefix + '90x90' + user.photo.suffix;
            contentString += `<img src=${photoUrl} alt="avatar" class="avatar">`;
            contentString += '</div>';  // end of avatar

            contentString += '<div class="username">';
            contentString += `<p>${user.firstName} ${user.lastName}</p>`;
            contentString += '</div>'; // end of username

            contentString += '</div>'; // end of user
            contentString += '</div>'; // end of tip div
        }

        contentString += '</div>'; // end of place-story div

        self.infoWindow.marker = marker;
        self.infoWindow.setContent(contentString);
        self.infoWindow.open(map.map, marker);
        self.infoWindow.addListener('click', () => {
            self.infoWindow.setMarker = null;
        })
    });

    self.hideInfoWindow = () => {
        if (self.infoWindow) {
            self.infoWindow.close();
        }
    };
}

function main() {
    map = new GoogleMap(document.getElementById('map'));
    map.setCenter(new google.maps.LatLng(34.6796693,-82.8371351));

    // map.geocodeLatLng(map.currentLoc, (results) => {
    //     if (!results[0]) return;
    //     const addrComponents = results[0].address_components;
    //     const locationText = 'Restaurants near ' + addrComponents[0].long_name + ', ' + addrComponents[1].long_name;
    //     document.querySelector('.current-location').innerText = locationText;
    // });

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

// callback function: listening for authentication errors
function gm_authFailure() {
    window.alert('Google map authentication fails.');
}

let map;
const vm = new ViewModel();

const script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAY2F8IG3pLRgMYLPmhlwmzmrA39aoDl_k&libraries=places';
script.async = true;
script.defer = true;
script.onload = main;
document.body.appendChild(script);
