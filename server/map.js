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
  getSvg() {
    const cached = this.getCachedMap();
    if (cached) {
      return Promise.resolve(cached);
    } else {
      return this.downloadMap().then(map => {
        this.map = map;
        this.mapDate = new Date();
        return map;
      });
    }
  }

  getCachedMap() {
    if (this.map && (new Date() - this.mapDate < 60 * 60000)) {
      return this.map;
    }
    return null;
  }

  downloadMap() {
    const promises = [
      axios.get(downloadUrl, requesOptions),
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

  getSettings() {
    return this.getSvg().then(map => {
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
