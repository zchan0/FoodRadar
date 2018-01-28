export class Map {
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

    createMarker(position) {
        const options = {
            position: position,
            map: this.map
        };
        return new google.maps.Marker(options);
    }
}
