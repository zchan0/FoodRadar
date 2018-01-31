import {FS_CONFIG} from './config'

export class Foursquare {
    constructor() {
        this.query = {
            client_id: FS_CONFIG.CLIENT_ID,
            client_secret: FS_CONFIG.CLIENT_SECRET,
            v: getToday()
        }
    }
    /**
     * Returns a list of recommended venues near the current location.
     * https://developer.foursquare.com/docs/api/venues/explore
     *
     * @param {any} options config query parameters
     * @returns Promise.response, contains an array of recommend venues.
     */
    getVenueRecommendations(options) {
        this.query['limit'] = 25;
        Object.keys(options).map(key => {
            this.query[key] = options[key];
        });

        const init = { method: 'GET' };
        const url = FS_CONFIG.BASE_URL + 'venues/explore' + serialize(this.query);

        return fetch(url, init)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`failed to fetch ${url}`);
                }
            })
            .then(data => {
                return data.response.groups[0].items;
            })
            .then(recommendations => {
                return recommendations.reduce((venues, recommendation) => {
                    venues.push(recommendation.venue);
                    return venues;
                }, []);
            })
            .catch(err => {
                console.log(err);
            });
    }

    getVenuePhotos(venueId) {
        const url = FS_CONFIG.BASE_URL + 'venues/' + venueId + '/photos' + serialize(this.query);
        const init = { method : 'GET' };

        return fetch(url, init)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`failed to fetch ${url}`);
                }
            })
            .then(data => {
                return data.response.photos.items;
            })
            .catch(err => {
                console.log(err);
            });
    }
}

export class GoogleMap {
    constructor() {
        const mapDiv = document.getElementById('map');
        this.currentPos = {lat: 39.8943011, lng: 116.3922383};
        const mapOptions = {
            center: this.currentPos,
            zoom: 17
        };
        this.map = new google.maps.Map(mapDiv, mapOptions);
    }

    locateCurrentPosition() {
        if (navigator.geolocation) {
            const self = this;
            navigator.geolocation.getCurrentPosition(position => {
                self.currentPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                self.map.setCenter(self.currentPos);
                self.createMarker(self.currentPos);
            }, () => {
                console.log('Error: The Geolocation service failed.');
            });
        } else {
            // Browser doesn't support Geolocation
            console.log('Error: Your browser doesn\'t support Geolocation.');
        }
    }

    nearbySearch(radius, callback) {
        const request = {
            location: this.currentPos,
            radius: radius,
            types: ['restaurant']
        };
        const service = new google.maps.places.PlacesService(this.map);
        service.nearbySearch(request, callback);
    }

    latlngToString(latlng) {
        return latlng['lat'] + ',' + latlng['lng'];
    }
}

/**
 * @returns format date string: yyyymmdd
 */
function getToday() {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; // Jan is 0
    let yy = today.getFullYear();

    dd = dd < 10 ? '0' + dd : dd;
    mm = mm < 10 ? '0' + mm : mm;

    return '' + yy + mm + dd;
}

function serialize(obj) {
    return '?' + Object.keys(obj).reduce((res, key) => {
        const val = obj[key];
        res.push((val !== null && typeof val === 'object') ?
            serialize(val) :
            encodeURIComponent(key) + '=' + encodeURIComponent(val));
        return res;
    }, []).join('&');
};
