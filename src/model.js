import ko from 'knockout'

export class GoogleMap {
    constructor(div) {
        this.map = new google.maps.Map(div, {zoom: 17});
        this.markers = [];
    }

    /**
     * location: google.maps.LatLng
     *
     * @param {Object} location
     * @memberof GoogleMap
     */
    setCenter(location) {
        this.currentLoc = location;
        this.map.setCenter(location);
        this.markers.push(new google.maps.Marker({
            map: this.map,
            title: 'Current Location',
            position: location
        }));
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
            location: this.currentLoc,
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
        this.markers.push(new google.maps.Marker(options));
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

    // This function will loop through the markers array and display them all.
    fitBoundsToMarkers() {
        const bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (let i = 0; i < this.markers.length; i++) {
          this.markers[i].setMap(this.map);
          bounds.extend(this.markers[i].position);
        }
        this.map.fitBounds(bounds);
    }
}

export class Restaurant {
    constructor(obj) {
        this.id = obj.id;
        this.placeId = obj.place_id;
        this.name = obj.name;
        this.openNow = obj.opening_hours.open_now;
        this.location = obj.geometry.location;

        const self = this;
        this.openNowStr = ko.computed(() => {
            return self.openNow ? 'Open Now' : 'Closed'
        });
        this.rating = ko.computed(() => {
            return 'Rating: ' + obj.rating;
        });
        this.duration = ko.computed(() => {
            return ' Walk ' + obj.duration.text;
        })
        this.address = ko.computed(() => {
            return 'Address: ' + obj.vicinity;
        });
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
