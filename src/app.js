import ko from 'knockout'
import {GoogleMap, Photo} from './model'
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
    self.filteredPlaces.subscribe(() => {
        if (self.ratingFilter() !== undefined) {
            self.hideMarkers();
            const markers = self.filteredPlaces().reduce((acc, key) => {
                acc.push(self.allMarkers[key.place_id]);
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

    self.createMarker = (place => {
        const marker = new google.maps.Marker({
            title: place.name,
            position: place.geometry.location
        });

        let placeDetail = place;
        marker.addListener('mouseover', () => {
            const venue = self.allVenues[place.place_id];
            if (venue) {
                placeDetail['tips'] = venue.tips;
                placeDetail['stats'] = venue.stats;
                placeDetail['category'] = venue.categories[0].name;
                placeDetail['bestPhoto'] = venue.bestPhoto;
                placeDetail['opening_hours'] = venue.opening_hours;
            }
            self.showInfoWindow(marker, placeDetail);
        });

        // marker.addListener('mouseout', self.hideInfoWindow);
        marker.setMap(map.map);
        self.allMarkers[place.place_id] = marker;
    });

    self.hideMarkers = () => {
        for (let prop in self.allMarkers) {
            self.allMarkers[prop].setMap(null);
        }
    };

    self.toggleMarkerBounce = (place) => {
        const marker = self.allMarkers[place.place_id];
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
            marker.setAnimation(null)
        }, 700);
    };

    self.showInfoWindow = ((marker, placeDetail) => {
        // only one info window
        if (!self.infoWindow) {
            self.infoWindow = new google.maps.InfoWindow();
        }
        // close before open a new one
        self.hideInfoWindow();

        let contentString = '<div class="place-story">';

        contentString += '<div class="info">';
        contentString += '<h3 class="title">' + marker.title + '</h3>';

        if (placeDetail.tips && placeDetail.tips.count > 0) {
            contentString += '<div class="tip">';

            const tips = placeDetail.tips.groups[0].items;
            // pick the tip most people agreed
            tips.sort((a, b) => {
                return b.agreeCount - a.agreeCount;
            });
            const tip = tips[0];
            contentString += '<span class="tip">\"' + tip.text + '"</span>';

            contentString += '<hr>';
            contentString += '</div>'; // end of tip div
        }

        contentString += '<div class="price-category-rating">';
        contentString += '<span class="rating"> Ratings: ' + placeDetail.rating + '</span>';
        if (placeDetail.category) {
            contentString += '<span class="category"> · ' + placeDetail.category + '</span>';
        }
        contentString += '<span class="priceLevel"> · ' + map.priceLevelText(placeDetail.price_level) + '</span>';
        if (placeDetail.opening_hours) {
            const openNow = placeDetail.opening_hours.openNow;
            if (!openNow)
                contentString += '<span class="openNow"> · Closed now';
        }
        contentString += '</div>'; // end of price-category-rating div

        contentString += '<div class="directions">';
        if (placeDetail.stats) {
            const visitsCount = placeDetail.stats.visitsCount;
            contentString += '<span class="visitsCount">' + visitsCount + ' people visited here' + ' · </span>';
        }
        contentString += '<span class="duration">' + ' Walk ' + placeDetail.duration.text + '</span>';
        contentString += '</div>'; // end of directions div
        contentString += '</div>'; // end of info div

        if (placeDetail.bestPhoto) {
            contentString += '<div class="image">';
            const photo = new Photo(placeDetail.bestPhoto);
            contentString += '<img class=\'image\' src=' + photo.photoUrl + ' alt="image"">';
            contentString += '</div>'; // end of image div
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
