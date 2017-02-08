const axios = require('axios');
const fs = require('fs');

const downloadUrl = '/zwiftmap/app/world/',
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
  constructor(settings) {
    this.worlds = settings.worlds;
  }

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
          const endTag = map.indexOf('>', start);
          const svgStartTag = map.substring(start, endTag + 1);

          const svgData = map.substring(endTag + 1, end);
          const mapStyle = this.getMapStyle(cssResponse.data);

          const transformTags = this.getTransformTags(map);

          return `${svgStart}${addedAttributes}${svgStartTag}${transformTags.start}${svgData}${mapStyle}${transformTags.end}${svgEnd}`;
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
      const worldId = this.getWorldId(map);
      return {
        world: worldId,
        png: (this.worlds && this.worlds[worldId]) ? this.worlds[worldId].png : null,
        viewBox: this.getSvgParam(map, 'viewBox="'),
        rotate: this.getSvgParam(map, 'transform="rotate'),
        translate: this.getSvgParam(map, 'transform="translate'),
        transforms: this.getWorldTransforms(worldId)
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

  getWorldId(map) {
    return parseInt(this.getSvgParam(map, 'id="world_'));
  }

  getWorldTransforms(worldId) {
    if (this.worlds && this.worlds[worldId]) {
      return this.worlds[worldId].transforms;
    }
    return null;
  }

  getTransformTags(map) {
    let start = '';
    let end = '';
    //const transforms = this.getWorldTransforms(this.getWorldId(map));

    //if (transforms && transforms.length) {
    //  transforms.forEach(t => {
    //    start += `<g transform="${t}">`;
    //    end += '</g>';
    //  });
    //}

    return {
      start,
      end
    };
  }
}
module.exports = Map;
