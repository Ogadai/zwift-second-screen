const axios = require('axios');
const fs = require('fs');
const NodeCache = require('node-cache')
const xml2js = require('xml2js')
const moment = require('moment')

const downloadUrl = '/zwiftmap/svg/world',
  downloadParam = '', // use value 0 to disable background
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

const scheduleUrl = 'https://whatsonzwift.com/cached/MapSchedule.xml';
const scheduleMaps = {
  WATOPIA: 1,
  RICHMOND: 2,
  LONDON: 3,
  NEWYORK: 4,
  INNSBRUCK: 5,
  YORKSHIRE: 7,
  FRANCE: 10,
  MAKURIISLANDS: 9,
  SCOTLAND: 13
};

const defaultCredit = {
  name: 'ZwiftHacks',
  href: 'http://zwifthacks.com'
}

const mapCache = new NodeCache({ stdTTL: 4 * 60 * 60, checkperiod: 120, useClones: false });

class Map {
  constructor(worldSettings) {
    this.worldSettings = worldSettings;
  }

  key(worldId) {
    return worldId || 'default';
  }

  getSchedule() {
    const key = 'zwift-schedule';
    const cached = mapCache.get(key);
    if (cached) {
      return Promise.resolve(cached);
    } else {
      return this.downloadSchedule().then(scheduleXML => {
        return new Promise(resolve => {
          xml2js.parseString(scheduleXML, (err, schedule) => {
            mapCache.set(key, schedule);
            resolve(schedule);
          })
        })
      });
    }
  }

  downloadSchedule() {
    return axios.get(scheduleUrl).then(response => response.data);
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

  getWorld() {
    return this.getSchedule().then(schedule => {
      const list = schedule.MapSchedule.appointments[0].appointment.map(a => {
        return {
          world: scheduleMaps[a.$.map],
          start: moment(a.$.start)
        };
      });
      const now = moment();
      const latest = list.reduce((current, a) => {
        if ((!current || current.start.isBefore(a)) && a.start.isBefore(now)) {
          return a;
        }
        return current;
      }, null);
      return latest ? latest.world : 1;
    });
  }

  getSettings(requestWorldId, overlay, event) {
    const worldPromise = requestWorldId ? Promise.resolve(requestWorldId) : this.getWorld();

    return worldPromise.then(worldId => {
      const baseSettings = (!overlay && this.worldSettings) ? this.worldSettings[worldId] : null;
      const eventSettings = event && this.worldSettings.events && this.worldSettings.events[event]
            ? this.worldSettings.events[event][worldId]
            : undefined;

      const worldSettings = Object.assign({}, baseSettings, eventSettings);

      const mapImage = worldSettings ? worldSettings.map : null;
      const roadsFile = worldSettings ? worldSettings.roads : null;
      const background = worldSettings ? worldSettings.background : null;
      const credit = worldSettings && worldSettings.credit ? worldSettings.credit : defaultCredit;
      const viewBoxSettings = worldSettings ? worldSettings.viewBox : null;
      const rotateSettings = worldSettings ? worldSettings.rotate : null;
      const translateSettings = worldSettings ? worldSettings.translate : null;

      return {
        worldId,
        credit,
        map: mapImage,
        roads: roadsFile,
        background,
        viewBox: viewBoxSettings,
        rotate: rotateSettings,
        translate: translateSettings
      };
    });
  }

  // getSettings(requestWorldId, overlay, event) {
  //   return this.getSvg(requestWorldId).then(map => {
  //     const worldId = this.getSvgParam(map, 'id="world_');

  //     const baseSettings = (!overlay && this.worldSettings) ? this.worldSettings[worldId] : null;
  //     const eventSettings = event && this.worldSettings.events && this.worldSettings.events[event]
  //           ? this.worldSettings.events[event][worldId]
  //           : undefined;

  //     const worldSettings = Object.assign({}, baseSettings, eventSettings);

  //     const mapImage = worldSettings ? worldSettings.map : null;
  //     const roadsFile = worldSettings ? worldSettings.roads : null;
  //     const background = worldSettings ? worldSettings.background : null;
  //     const credit = worldSettings && worldSettings.credit ? worldSettings.credit : defaultCredit;
  //     const viewBoxSettings = worldSettings ? worldSettings.viewBox : null;
  //     const rotateSettings = worldSettings ? worldSettings.rotate : null;
  //     const translateSettings = worldSettings ? worldSettings.translate : null;

  //     return {
  //       worldId,
  //       credit,
  //       map: mapImage,
  //       roads: roadsFile,
  //       background,
  //       viewBox: viewBoxSettings ? viewBoxSettings : this.getSvgParam(map, 'viewBox="'),
  //       rotate: rotateSettings ? rotateSettings : this.getSvgParam(map, 'transform="rotate'),
  //       translate: translateSettings ? translateSettings : this.getSvgParam(map, 'transform="translate')
  //     };
  //   });
  // }

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
