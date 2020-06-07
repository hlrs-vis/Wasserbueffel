import 'ol/ol.css';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import {LineString, Point, Polygon} from 'ol/geom';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import {OSM, TileDebug} from 'ol/source';
import TileXYZ from 'ol/source/XYZ';
import {transform} from 'ol/proj.js';

import {Vector as VectorLayer} from 'ol/layer';
import {TileJSON, Vector as VectorSource} from 'ol/source';
import {Fill, Icon, Stroke, Style} from 'ol/style';



var dates = [
  '2019_03',
  '2019_05',
  '2020_03',
  '2020_04',
  '2020_05',
];
var renderGridCheckbox = document.getElementById('render-grid');
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
      visible: true,
    })
)
var la=9.280;
var lo=48.986;
for(i=0;i<40;i++)
{
gridLines.push(
new Feature(
  new LineString([ transform([la, lo], 'EPSG:4326', 'EPSG:3857'), transform([la+0.016, lo], 'EPSG:4326', 'EPSG:3857')])
));
lo+=0.0002;
}
var la=9.280;
var lo=48.986;
for(i=0;i<40;i++)
{
gridLines.push(
new Feature(
  new LineString([ transform([la, lo], 'EPSG:4326', 'EPSG:3857'), transform([la, lo+0.016], 'EPSG:4326', 'EPSG:3857')])
));
la+=0.00034;
}


for (i = 0, ii = dates.length; i < ii; ++i) {
  layers.push(
    new TileLayer({
      source: new TileXYZ({
        url: 'https://wasserbueffel.hlrs.de/'+dates[i]+'/code/odm_orthophoto/odm_orthophoto/{z}/{x}/{-y}.png',
        type: 'png',
      }),
    visible: false,
    preload: Infinity,
    })
  );
}
layers.push(
new VectorLayer({
      visible: true,
      source: new VectorSource({
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
  layers: layers,
  target: 'map',
  view: new View({
    center: transform([9.288,48.9905], 'EPSG:4326', 'EPSG:3857'),
    zoom: 16,
    maxZoom: 23
  })
});

/**
 *  * Handle checkbox change event.
 *   */
renderGridCheckbox.onchange = function() {
  layers[2].visible = renderGridCheckbox.checked;
  };

var select = document.getElementById('imageDate');
function onChange() {
  var date = select.value;
  for (var i = 0, ii = layers.length-3; i < ii; ++i) {
    layers[i+2].setVisible(dates[i] === date);
  }
}
select.addEventListener('change', onChange);
onChange();
