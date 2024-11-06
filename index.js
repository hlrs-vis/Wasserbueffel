import 'ol/ol.css';
import Map from 'ol/Map';
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import Projection from 'ol/proj/Projection'
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
import GeoJSON from 'ol/format/GeoJSON';
import DragAndDrop from 'ol/interaction/DragAndDrop';
import Modify from 'ol/interaction/Modify';
import Draw from 'ol/interaction/Draw';
import Snap from 'ol/interaction/Snap';
import Event from 'ol/events/Event';
//import UndoRedo from './UndoRedo.js';

import { Vector as VectorLayer } from 'ol/layer';
import { TileJSON, Vector as VectorSource } from 'ol/source';
import { Circle, Text, Fill, Icon, Stroke, Style } from 'ol/style';


var Bdates = [
  '22.05.2020',
  '11.06.2020',
  '12.06.2020',
];
var dates = [
  '2019_03',
  '2019_05',
  '2020_03',
  '2020_04',
  '2020_05',
  '2020_06',
  '2020_09',
  '2024_07',
];
var renderGridCheckbox = document.getElementById('render-grid');
var renderGridRotCheckbox = document.getElementById('render-grid-rot');
var renderDebugCheckbox = document.getElementById('render-debug');
var renderStudyAreasCheckbox = document.getElementById('render-study');
var editStudyAreasCheckbox = document.getElementById('edit-study');



//proj4.defs('EPSG:25832','+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
proj4.defs('projLayer1','+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');

register(proj4);

var scaleType = 'scalebar';
var scaleBarSteps = 4;
var scaleBarText = true;
var control;

const vSource = new VectorSource({
  format: new GeoJSON(),
  url: 'https://wasserbueffel.hlrs.de/studyareas.json'
});

//undoRedo = new UndoRedo(vSource);	

var image = new Circle({
        radius: 5,
        fill: null,
        stroke: new Stroke({color: 'red', width: 1})
      });
var styles = {
        'Point': new Style({
          image: image
        }),
        'LineString': new Style({
          stroke: new Stroke({
            color: 'green',
            width: 1
          })
        }),
        'MultiLineString': new Style({
          stroke: new Stroke({
            color: 'green',
            width: 1
          })
        }),
        'MultiPoint': new Style({
          image: image
        }),
        'MultiPolygon': new Style({
          stroke: new Stroke({
            color: 'yellow',
            width: 1
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 0, 0.1)'
          })
        }),
        'Polygon': new Style({
          stroke: new Stroke({
            color: 'blue',
            lineDash: [4],
            width: 3
          }),
          fill: new Fill({
            color: 'rgba(0, 0, 255, 0.1)'
          })
        }),
        'GeometryCollection': new Style({
          stroke: new Stroke({
            color: 'magenta',
            width: 2
          }),
          fill: new Fill({
            color: 'magenta'
          }),
          image: new Circle({
            radius: 10,
            fill: null,
            stroke: new Stroke({
              color: 'magenta'
            })
          })
        }),
        'Circle': new Style({
          stroke: new Stroke({
            color: 'red',
            width: 2
          }),
          fill: new Fill({
            color: 'rgba(255,0,0,0.2)'
          })
        })
      };


var styleFunction = function(feature) {

        var text = new Style({
            text :new Text({
                text: feature.getProperties().name,
                font: '12px Calibri,sans-serif',
                weight:'Bold',
                fill: new Fill({ color: '#000' }),
                stroke: new Stroke({
                    color: '#D3D3D3', width: 2
                }),
                offsetX: 0,
                offsetY: 0,
                rotation: 0
            })
        });
        return [styles[feature.getGeometry().getType()],text];
      };


const vLayer = new VectorLayer({
  source: vSource,
  style: styleFunction
/*  style: new Style({
    stroke: new Stroke({
      width: 2,
      color: 'white'
    }),
    fill: new Fill({
      color: [255,255,255,0]
    })
  A})*/
});
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
var flightLayers = [];
var Blayers = [];
var gridLines = [];
var gridRotLines = [];
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
var origin = [9.285, 48.984];
var angle = 0.3;
var pos = transform(origin, 'EPSG:4326', 'EPSG:3857');
for (i = 0; i < (2000/15.6); i++) {
  gridLines.push(
    new Feature(
      new LineString([pos, [pos[0]+800,pos[1]]])
    )
  );
  pos[1] += 15.6;
}
var pos = transform(origin, 'EPSG:4326', 'EPSG:3857');
for (i = 0; i < (800/15.6); i++) {
  gridLines.push(
    new Feature(
      new LineString([pos, [pos[0],pos[1]+2000]])
      )
    );
    pos[0] += 15.6;
}

origin = [9.288, 48.983];
var pos = transform(origin, 'EPSG:4326', 'EPSG:3857');
var posRot = transform(origin, 'EPSG:4326', 'EPSG:3857');
for (i = 0; i < (2000/15.6); i++) {
  var p1=[];
  var p2=[];
  p1[0] = ((pos[0] - posRot[0])*Math.cos(angle))-(pos[1] - posRot[1])*Math.sin(angle)+posRot[0];
  p1[1] = ((pos[0] - posRot[0])*Math.sin(angle))+(pos[1] - posRot[1])*Math.cos(angle)+posRot[1];
  p2[0] = ((pos[0]+800 - posRot[0])*Math.cos(angle))-(pos[1] - posRot[1])*Math.sin(angle)+posRot[0];
  p2[1] = ((pos[0]+800 - posRot[0])*Math.sin(angle))+(pos[1] - posRot[1])*Math.cos(angle)+posRot[1];
 
  gridRotLines.push(
    new Feature(
      new LineString([p1, p2])
    )
  );
  pos[1] += 15.6;
}
pos = transform(origin, 'EPSG:4326', 'EPSG:3857');
for (i = 0; i < (800/15.6); i++) {
  var p1=[];
  var p2=[];
  p1[0] = ((pos[0] - posRot[0])*Math.cos(angle))-(pos[1] - posRot[1])*Math.sin(angle)+posRot[0];
  p1[1] = ((pos[0] - posRot[0])*Math.sin(angle))+(pos[1] - posRot[1])*Math.cos(angle)+posRot[1];
  p2[0] = ((pos[0] - posRot[0])*Math.cos(angle))-(pos[1]+2000 - posRot[1])*Math.sin(angle)+posRot[0];
  p2[1] = ((pos[0] - posRot[0])*Math.sin(angle))+(pos[1]+2000 - posRot[1])*Math.cos(angle)+posRot[1];
 
  gridRotLines.push(
    new Feature(
      new LineString([p1, p2])
      )
    );
    pos[0] += 15.6;
}

for (i = 0, ii = dates.length; i < ii; ++i) {
   var fl= new TileLayer({
      source: new TileXYZ({
        url: 'https://wasserbueffel.hlrs.de/' + dates[i] + '/code/odm_orthophoto/odm_orthophoto/{z}/{x}/{-y}.png',
        type: 'png',
    //projection: 'projLayer1'
      }),
      visible: false,
      preload: Infinity,
    });
  layers.push(fl);
  flightLayers.push(fl);
}

pos = transform(origin, 'EPSG:4326', 'EPSG:3857');
pos[0] += -263;
pos[1] += -703;

var extent = [pos[0]+0, pos[1]+0, pos[0]+3000, pos[1]+3000];
//var extent = [0, 0, 512, 512];
var projection = new Projection({
  code: 'static-image',
  units: 'pixels',
  extent: extent
});

for (i = 0, ii = Bdates.length; i < ii; ++i) {
Blayers.push(new ImageLayer({
      source: new Static({
        url: 'https://wasserbueffel.hlrs.de/fauna/WBAvifauna_'+Bdates[i]+'NoBG.svg',
        projection: 'EPSG:3857',
        imageExtent: extent
      })
    })
);
}
var gridLayer =
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
  });

var gridRotLayer =
  new VectorLayer({
    visible: false,
    source: new VectorSource({
      projection: 'EPSG:3857',
      features: gridRotLines
    }),
    style: new Style({
      stroke: new Stroke({
        width: 1,
        color: [5, 5, 5, 1]
      })
    })
  });

layers.push(gridLayer);
layers.push(gridRotLayer);
layers.push(vLayer);
for (i = 0, ii = Bdates.length; i < ii; ++i) {
layers.push(Blayers[i]);
Blayers[i].setVisible(false);
}
Blayers[0].setVisible(true);


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
map.addInteraction(new DragAndDrop({
  source: vSource,
  formatConstructors: [GeoJSON]
}));
var modifyInteraction = new Modify({
  source: vSource
});
var drawInteraction = new Draw({
  type: 'Polygon',
  source: vSource
});
var snapInteraction = new Snap({
  source: vSource
});

/**
 *  * Handle checkbox change event.
 *   */
renderGridCheckbox.onchange = function () {
  gridLayer.setVisible(renderGridCheckbox.checked);
};
renderGridRotCheckbox.onchange = function () {
  gridRotLayer.setVisible(renderGridRotCheckbox.checked);
};
renderDebugCheckbox.onchange = function () {
  layers[1].setVisible(renderDebugCheckbox.checked);
};
renderStudyAreasCheckbox.onchange = function () {
  vLayer.setVisible(renderStudyAreasCheckbox.checked);
};
editStudyAreasCheckbox.onchange = function () {
  if(editStudyAreasCheckbox.checked)
  {
    vLayer.setVisible(true);
    renderStudyAreasCheckbox.checked=true;
    map.addInteraction(modifyInteraction);
    map.addInteraction(drawInteraction);
    map.addInteraction(snapInteraction);
  }
  else{
    map.removeInteraction(modifyInteraction);
    map.removeInteraction(drawInteraction);
    map.removeInteraction(snapInteraction);
  }
};
document.addEventListener('keydown',function(evt) {
  var handled = false;
  switch (evt.keyCode) {
      case 90: // z
          if (evt.metaKey || evt.ctrlKey) {
            drawInteraction.removeLastPoint();
              handled = true;
          }
          break;
      case 89: // y
          if (evt.metaKey || evt.ctrlKey) {
            //drawInteraction.redo();
              handled = true;
          }
          break;
      case 27: // esc
      drawInteraction.abortDrawing();
          handled = true;
          break;
  }
});

const clear = document.getElementById('clear');
clear.addEventListener('click', function() {
  vSource.clear();
});

const format = new GeoJSON({featureProjection: 'EPSG:3857'});
const download = document.getElementById('download');

vSource.on('change', function() {
  const features = vSource.getFeatures();
  const json = format.writeFeatures(features);
  download.href = 'data:text/json;charset=utf-8,' + json;
});

var select = document.getElementById('imageDate');
function onChange() {
  var date = select.value;
    console.log(date);
  for (var i = 0, ii = dates.length ; i < ii; ++i) {
    flightLayers[i].setVisible(dates[i] === date);
    console.log(dates[i] === date);
    console.log(dates[i]);
  }
}
select.addEventListener('change', onChange);
onChange();
var birdSelect = document.getElementById('birdsDate');
function BonChange() {
  var date = birdSelect.value;
  for (var i = 0, ii = Blayers.length; i < ii; ++i) {
    Blayers[i].setVisible(Bdates[i] === date);
  }
}
birdSelect.addEventListener('change', BonChange);
BonChange();
