export class Map {
    constructor(dom, options) {
        this.map = new google.maps.Map(dom, options);
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
}
