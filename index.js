import 'ol/ol.css';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import { LineString, Point, Polygon } from 'ol/geom';
import View from 'ol/View';
import {defaults as defaultControls, ScaleLine} from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import { OSM, TileDebug } from 'ol/source';
import TileXYZ from 'ol/source/XYZ';
import { transform } from 'ol/proj.js';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import sync from 'ol-hashed';

import { Vector as VectorLayer } from 'ol/layer';
import { TileJSON, Vector as VectorSource } from 'ol/source';
import { Fill, Icon, Stroke, Style } from 'ol/style';


var dates = [
  '2019_03',
  '2019_05',
  '2020_03',
  '2020_04',
  '2020_05',
];
var renderGridCheckbox = document.getElementById('render-grid');
var renderDebugCheckbox = document.getElementById('render-debug');

 

proj4.defs('EPSG:25832','+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
register(proj4);

var scaleType = 'scalebar';
var scaleBarSteps = 4;
var scaleBarText = true;
var control;

function scaleControl() {
  if (scaleType === 'scaleline') {
    control = new ScaleLine({
      units: "metric"
    });
    return control;
  }
  control = new ScaleLine({
    units:"metric",
    bar: true,
    steps: scaleBarSteps,
    text: scaleBarText,
    minWidth: 140
  });
  return control;
}

var layers = [];
var gridLines = [];
var i, ii;
layers.push(
  new TileLayer({
    source: new OSM(),
    visible: true,
  })
)

layers.push(
  new TileLayer({
    source: new TileDebug(),
    visible: false,
  })
)
var pos = transform([9.285, 48.984], 'EPSG:4326', 'EPSG:3857')
for (i = 0; i < (2000/15.6); i++) {
  gridLines.push(
    new Feature(
      new LineString([pos, [pos[0]+800,pos[1]]])
    )
  );
  pos[1] += 15.6;
}
var pos = transform([9.285, 48.984], 'EPSG:4326', 'EPSG:3857')
for (i = 0; i < (800/15.6); i++) {
  gridLines.push(
    new Feature(
      new LineString([pos, [pos[0],pos[1]+2000]])
      )
    );
    pos[0] += 15.6;
}


for (i = 0, ii = dates.length; i < ii; ++i) {
  layers.push(
    new TileLayer({
      source: new TileXYZ({
        url: 'https://wasserbueffel.hlrs.de/' + dates[i] + '/code/odm_orthophoto/odm_orthophoto/{z}/{x}/{-y}.png',
        type: 'png',
      }),
      visible: false,
      preload: Infinity,
    })
  );
}
layers.push(
  new VectorLayer({
    visible: false,
    source: new VectorSource({
      projection: 'EPSG:3857',
      features: gridLines
    }),
    style: new Style({
      stroke: new Stroke({
        width: 1,
        color: [5, 5, 5, 1]
      })
    })
  })
);


var map = new Map({
  controls: defaultControls().extend([
    scaleControl()
  ]),
  layers: layers,
  target: 'map',
  view: new View({
    center: transform([9.288, 48.9905], 'EPSG:4326', 'EPSG:3857'),
    zoom: 16,
    maxZoom: 23
  })
});
sync(map);

/**
 *  * Handle checkbox change event.
 *   */
renderGridCheckbox.onchange = function () {
  layers[layers.length-1].setVisible(renderGridCheckbox.checked);
};
renderDebugCheckbox.onchange = function () {
  layers[1].setVisible(renderDebugCheckbox.checked);
};


var select = document.getElementById('imageDate');
function onChange() {
  var date = select.value;
  for (var i = 0, ii = layers.length - 3; i < ii; ++i) {
    layers[i + 2].setVisible(dates[i] === date);
  }
}
select.addEventListener('change', onChange);
onChange();
