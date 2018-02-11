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

    geocodeLatLng(latlng, callback) {
        const geocoder = new google.maps.Geocoder;
        geocoder.geocode({'location': latlng}, (results, status) => {
          if (status === 'OK') {
            callback(results);
          } else {
            console.log('Geocoder failed due to: ' + status);
          }
        });
    }

    /**
     * place type: google.maps.PlaceResult
     *
     * @param {any} place
     * @memberof GoogleMap
     */
    createMarker(place) {
        const options = {
            title: place.name,
            animation: google.maps.Animation.DROP,
            position: place.geometry.location
        };
        return new google.maps.Marker(options);
    }

    showMarkers(markers) {
        const self = this;
        for (let i = 0; i < markers.length; i++) {
            const marker = markers[i];
            setTimeout(() => {
                marker.setMap(self.map);
            }, i * 200);
        }
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
    fitBoundsToMarkers(markers) {
        const bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (let i = 0; i < markers.length; i++) {
          markers[i].setMap(this.map);
          bounds.extend(markers[i].position);
        }
        this.map.fitBounds(bounds);
    }

    priceLevelText(priceLevel) {
        let text = '';
        for (let i = 0; i < priceLevel; ++i) {
            text += '$';
        }
        return text;
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
