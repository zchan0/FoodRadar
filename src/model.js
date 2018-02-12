export class GoogleMap {
    constructor(div) {
        const styles =
        [
            {
                "featureType": "all",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "saturation": 36
                    },
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 40
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    },
                    {
                        "weight": 1.2
                    }
                ]
            },
            {
                "featureType": "administrative.country",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#e5c163"
                    }
                ]
            },
            {
                "featureType": "administrative.locality",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#c4c4c4"
                    }
                ]
            },
            {
                "featureType": "administrative.neighborhood",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#e5c163"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 21
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "poi.business",
                "elementType": "geometry",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#e5c163"
                    },
                    {
                        "lightness": "0"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#e5c163"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 18
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#575757"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#2c2c2c"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#999999"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 19
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    }
                ]
            }
        ];
        this.map = new google.maps.Map(div, {
            zoom: 13,
            styles: styles,
            mapTypeControl: false,
            streetViewControl: false
        });
        this.markers = [];
        this.defaultIcon = this.makeMarkerIcon('DBB76C');
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
            icon: this.defaultIcon,
            title: place.name,
            animation: google.maps.Animation.DROP,
            position: place.geometry.location
        };
        return new google.maps.Marker(options);
    }

    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    makeMarkerIcon(markerColor) {
        return new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21, 34)
        );
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
