const axios = require('axios');
const fs = require('fs');

const downloadUrl = '/zwiftmap/svg/world',
  cssUrl = '/zwiftmap/app/world-web.css',
  svgStart = '<svg ',
  svgEnd = '</svg>',
  addedAttributes = 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  version="1.2" baseProfile="tiny" ',
  styleStart = '<style>/* <![CDATA[ */',
  styleEnd = '/* ]]> */</style>';

const requesOptions = {
  baseURL: 'http://api.zwifthacks.com',
  headers: {
    "Accept-Encoding":"gzip, deflate, sdch"
  }
};

class Map {
  constructor() {
    this.worlds = {
    }
  }

  key(worldId) {
    return worldId || 'default';
  }

  getSvg(worldId) {
    const cached = this.getCachedMap(worldId);
    if (cached) {
      return Promise.resolve(cached);
    } else {
      return this.downloadMap(worldId).then(map => {

        this.worlds[this.key(worldId)] = {
          map: map,
					date: new Date()
        };
        return map;
      });
    }
  }

  getCachedMap(worldId) {
    const world = this.worlds[this.key(worldId)];
    if (world && world.map && (new Date() - world.date < 60 * 60000)) {
      return world.map;
    }
    return null;
  }

  downloadMap(worldId) {
    const worldParam = worldId ? `/${worldId}` : '';
    const promises = [
      axios.get(`${downloadUrl}${worldParam}`, requesOptions),
      axios.get(cssUrl, requesOptions)
    ];

    return Promise.all(promises).then(([ mapResponse, cssResponse ]) => {
      const map = mapResponse.data;
      const pos = map.indexOf(svgStart);
      if (pos !== -1) {
        const start = pos + svgStart.length;
        const end = map.indexOf(svgEnd, start);

        if (end !== -1) {
          const svgData = map.substring(start, end);
          const mapStyle = this.getMapStyle(cssResponse.data);

          return `${svgStart}${addedAttributes}${svgData}${mapStyle}${svgEnd}`;
        }
      }
      return Promise.reject("Couldn't parse map data");
    });
  }

  getMapStyle(styleData) {
    return `${styleStart}${styleData}${styleEnd}`;
  }

  getSettings(worldId) {
    return this.getSvg(worldId).then(map => {
      return {
        viewBox: this.getSvgParam(map, 'viewBox="'),
        rotate: this.getSvgParam(map, 'transform="rotate'),
        translate: this.getSvgParam(map, 'transform="translate')
      };
    });
  }

  getSvgParam(map, searchTerm) {
    const pos = map.indexOf(searchTerm);
    if (pos !== -1) {
      const start = pos + searchTerm.length;
      const end = map.indexOf('"', start);
      return map.substring(start, end);
    }
    return '';
  }
}
module.exports = Map;
