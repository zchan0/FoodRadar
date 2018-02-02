import ko from 'knockout'

export class GoogleMap {
    constructor() {
        const mapDiv = document.getElementById('map');
        this.map = new google.maps.Map(mapDiv, {zoom: 17});
    }

    /**
     * place type: google.maps.LatLng
     *
     * @param {any} place
     * @memberof GoogleMap
     */
    setCenter(place) {
        this.currentPos = place;
        this.map.setCenter(place);
        new google.maps.Marker({
            map: this.map,
            title: 'Current Locatio',
            position: place
        });
    }
    /**
     * callback: (position)=>{}
     *
     * @param {function} callback
     * @memberof GoogleMap
     */
    locateCurrentPosition(callback) {
        if (navigator.geolocation) {
            const self = this;
            navigator.geolocation.getCurrentPosition(callback, () => {
                console.log('Error: The Geolocation service failed.');
            });
        } else {
            // Browser doesn't support Geolocation
            console.log('Error: Your browser doesn\'t support Geolocation.');
        }
    }
    /**
     * search within radius
     * callback has two params: results, status
     *
     * @param {string} radius
     * @param {function} callback
     * @memberof GoogleMap
     */
    nearbySearch(radius, callback) {
        const request = {
            location: this.currentPos,
            radius: radius,
            types: ['restaurant']
        };
        const service = new google.maps.places.PlacesService(this.map);
        service.nearbySearch(request, callback);
    }

    /**
     * place type: google.maps.PlaceResult
     *
     * @param {any} place
     * @memberof GoogleMap
     */
    createMarker(place) {
        const options = {
            map: this.map,
            title: place.name,
            position: place.geometry.location
        };
        new google.maps.Marker(options);
    }

    /**
     * request should contains: origins, destinations, travel mode(default is 'DRIVING')
     * callback has two parameters: results, status
     *
     * @param {any} request
     * @param {any} callback
     * @memberof GoogleMap
     */
    calculateDistance(request, callback) {
        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(request, callback);
    }
}

export class Restaurant {
    constructor(obj) {
        this.id = obj.id;
        this.placeId = obj.place_id;
        this.name = obj.name;
        this.rating = obj.rating;   // The place's rating, from 0.0 to 5.0, based on aggregated user reviews.
        this.openNow = obj.opening_hours.open_now;
        this.geometry = obj.geometry;
    }
}

export class Photo {
    constructor(obj) {
        this.createdAt = obj.createdAt;
        this.width  = obj.width;
        this.height = obj.height;
        // assemble a photo URL: prefix + SIZE(width x height) + suffix
        this.photoUrl = obj.prefix +
                        obj.width + 'x' + obj.height +
                        obj.suffix;
    }
}
