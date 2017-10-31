const axios = require('axios');
const fs = require('fs');
const NodeCache = require('node-cache')

const downloadUrl = '/zwiftmap/svg/world',
  downloadParam = '?background=1.0', // use value 0 to disable background
  cssUrl = '/zwiftmap/app/world-web.css',
  svgStart = '<svg ',
  svgEnd = '</svg>',
  addedAttributes = 'version="1.2" baseProfile="tiny" ',
  styleStart = '<style>/* <![CDATA[ */',
  styleEnd = '/* ]]> */</style>';

const requesOptions = {
  baseURL: 'http://api.zwifthacks.com',
  headers: {
    "Accept-Encoding":"gzip, deflate, sdch"
  }
};

const defaultCredit = {
  name: 'ZwiftHacks',
  href: 'http://zwifthacks.com'
}

const mapCache = new NodeCache({ stdTTL: 30 * 60, checkPeriod: 120, useClones: false });

class Map {
  constructor(worldSettings) {
    this.worldSettings = worldSettings;
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
        mapCache.set(this.key(worldId), map);
        return map;
      });
    }
  }

  getCachedMap(worldId) {
    return mapCache.get(this.key(worldId));
  }

  downloadMap(worldId) {
    const worldParam = worldId ? `/${worldId}` : '';
    const promises = [
      axios.get(`${downloadUrl}${worldParam}${downloadParam}`, requesOptions),
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

  getSettings(requestWorldId, overlay) {
    return this.getSvg(requestWorldId).then(map => {
      const worldId = this.getSvgParam(map, 'id="world_');

      const worldSettings = (!overlay && this.worldSettings) ? this.worldSettings[worldId] : null;
      const mapImage = worldSettings ? worldSettings.map : null;
      const background = worldSettings ? worldSettings.background : null;
      const credit = worldSettings && worldSettings.credit ? worldSettings.credit : defaultCredit;
      const viewBoxSettings = worldSettings ? worldSettings.viewBox : null;

      return {
        worldId,
        credit,
        map: mapImage,
        background,
        viewBox: viewBoxSettings ? viewBoxSettings : this.getSvgParam(map, 'viewBox="'),
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
