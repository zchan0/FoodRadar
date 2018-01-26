export class Map {
    constructor(dom, options) {
        this.map = new google.maps.Map(dom, options);
        this.locateCurrentPosition();
    }

    static main() {
        const mapDiv = document.getElementById('map');
        const defaultLoc = {lat: 39.8943011, lng: 116.3922383};
        const mapOptions = {
            center: defaultLoc,
            zoom: 17
        };
        new Map(mapDiv, mapOptions);
    }

    locateCurrentPosition() {
        if (navigator.geolocation) {
            const self = this;
            navigator.geolocation.getCurrentPosition(function(position) {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                self.map.setCenter(pos);
            }, function() {
                console.log('Error: The Geolocation service failed.');
            });
        } else {
            // Browser doesn't support Geolocation
            console.log('Error: Your browser doesn\'t support Geolocation.');
        }
    }
}
