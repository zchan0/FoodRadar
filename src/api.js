import {FS_CONFIG} from './config'

export class Foursquare {
    constructor() {
        this.queryObj = {
            client_id: FS_CONFIG.CLIENT_ID,
            client_secret: FS_CONFIG.CLIENT_SECRET,
            v: getToday()
        }
    }
    /**
     * API: https://developer.foursquare.com/docs/api/venues/search
     *
     * @param {String} position lat,lng
     * @returns Promise, the restaurant at position, may have no value
     * @memberof Foursquare
     */
    searchForVenue(position) {
        this.queryObj['ll'] = position;
        this.queryObj['limit'] = 1;
        const query = new URLSearchParams(this.queryObj);
        const url = FS_CONFIG.BASE_URL + 'venues/search?' + query.toString();

        return fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`failed to fetch ${url}`);
                }
            })
            .then(data => {
                return data.response.venues[0];
            })
            .catch(err => {
                console.log(err);
            });
    }

    /**
     * get Photo of a venue
     *
     * @param {string} venueId
     * @returns Photo
     * @memberof Foursquare
     */
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
