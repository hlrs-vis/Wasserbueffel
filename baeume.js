import 'ol/ol.css';
import Map from 'ol/Map';
import * as olProj from 'ol/proj';
import ImageLayer from 'ol/layer/Image';
import Layer from 'ol/layer/Layer';
import Static from 'ol/source/ImageStatic';
import Projection from 'ol/proj/Projection'
import Feature from 'ol/Feature';
import { LineString, Point, Polygon } from 'ol/geom';
import View from 'ol/View';
import {defaults as defaultControls, ScaleLine} from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import { OSM, TileDebug } from 'ol/source';
import TileXYZ from 'ol/source/XYZ';
import { transform, toLonLat } from 'ol/proj.js';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import sync from 'ol-hashed';
import GeoJSON from 'ol/format/GeoJSON';
import DragAndDrop from 'ol/interaction/DragAndDrop';
import Modify from 'ol/interaction/Modify';
import Draw from 'ol/interaction/Draw';
import Snap from 'ol/interaction/Snap';
import Event from 'ol/events/Event';
import { Vector as VectorLayer } from 'ol/layer';
import { TileJSON, Vector as VectorSource } from 'ol/source';
import { Fill, Icon, Stroke, Style, Circle as CircleStyle } from 'ol/style';

const photoList = document.getElementById('tree-list');

var scaleType = 'scalebar';
var scaleBarSteps = 4;
var scaleBarText = true;
var control;

var vectorSource;
var picturemap=null;
  
//undoRedo = new UndoRedo(vSource);	


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

// Get the MapTiler API key from the environment variable
const maptilerApiKey = import.meta.env.VITE_MAPTILER_API_KEY;

// Create the MapTiler Orthophoto layer
const maptilerLayer = new TileLayer({
  source: new TileXYZ({
    url: `https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=${maptilerApiKey}`,
    attributions: 'Map tiles by <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    maxZoom: 20,
  }),
});

layers.push(maptilerLayer);






    picturemap = new Map({
  controls: defaultControls().extend([
    scaleControl()
  ]),
  layers: layers,
  target: 'map',
  view: new View({
    center: transform([8.526905, 48.357352], 'EPSG:4326', 'EPSG:3857'),
    zoom: 16,
    maxZoom: 23
  })
});
sync(picturemap);



// Fetch the list of images from the public directory
async function fetchImages() {
  const imageFiles = [
    '20241013_165702.jpg',
'20241013_165711.jpg',
'20241013_165724.jpg',
'20241013_165733.jpg',
'20241013_165740.jpg',
'20241013_165748.jpg',
'20241013_165756.jpg',
'20241013_165848.jpg',
'20241013_165901.jpg',
'20241013_165944.jpg',
'20241013_170120.jpg',
'20241013_170140.jpg',
'20241013_170149.jpg',
'20241013_170235.jpg',
'20241013_170251.jpg',
'20241013_170404.jpg'
  ]; // Manually list your image files (as Vite doesn't support reading directory contents dynamically)
 /*
  imageFiles.forEach(imageFile => {
    const imgElement = document.createElement('img');
    imgElement.src = `/images/${imageFile}`; // Path to the images inside "public/images" directory

    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.appendChild(imgElement);
   
    // Extract EXIF data
    imgElement.onload = function () {
      EXIF.getData(imgElement, function () {
        const lat = EXIF.getTag(this, "GPSLatitude");
        const lon = EXIF.getTag(this, "GPSLongitude");
        const latRef = EXIF.getTag(this, "GPSLatitudeRef");
        const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

        if (lat && lon) {
          const latDec = convertDMSToDD(lat, latRef);
          const lonDec = convertDMSToDD(lon, lonRef);

          const locationText = document.createElement('p');
          locationText.textContent = `Location: Latitude ${latDec}, Longitude ${lonDec}`;
          photoItem.appendChild(locationText);

          // Add a marker to the map
          addMarkerToMap(latDec, lonDec);
        } else {
          const noLocationText = document.createElement('p');
          noLocationText.textContent = "No GPS data available";
          photoItem.appendChild(noLocationText);
        }
      });
    };

    photoList.appendChild(photoItem);
  });*/
}
// Add marker to the OpenLayers picturemap
function addMarkerToMap(lat, lon) {
  const marker = new Overlay({
    position: fromLonLat([lon, lat]),
    positioning: 'center-center',
    element: document.createElement('div'),
    stopEvent: false
  });
  marker.getElement().style.background = 'red';
  marker.getElement().style.width = '10px';
  marker.getElement().style.height = '10px';
  marker.getElement().style.borderRadius = '50%';

  picturemap.addOverlay(marker);

}


// Initialize the app
fetchImages();


// Baum-Positionen als Marker (Beispielkoordinaten, anpassen)
var trees = [
    


    { id: '1', name: 'Feldahorn', position: [ 8.525962, 48.356987], anrede: 'Pate/-in', paten: 'N.n.', preis: '45 €', bereich: 'A3', image: "20241013_165702.jpg"},
    { id: '2', name: 'Stieleiche', position: [8.526073, 48.357028], anrede: 'Pate', paten: 'Thomas Bönisch', preis: '45 €', bereich: 'B1', image: "20241013_165711.jpg"},
    { id: '3', name: 'Bergahorn', position: [8.526106, 48.356946], anrede: 'Pate/-in', paten: 'N.n.', preis: '38 €', bereich: 'A3', image: "20241013_165724.jpg"},
    { id: '4', name: 'Speierling', position: [8.526085, 48.357131], anrede: 'Pate/-in', paten: 'N.n.', preis: '55 €', bereich: 'B1', image: "20241013_165733.jpg"},
    { id: '5', name: 'Elsbeere', position: [8.526217, 48.357000], anrede: 'Pate', paten: 'Uwe Zimmat', preis: '60 €', bereich: 'A3', image: "20241013_165740.jpg"},
    { id: '6', name: 'Winterlinde', position: [8.526207, 48.357113], anrede: 'Patin', paten: 'Doris Lindner', preis: '46 €', bereich: 'B1', image: "20241013_165748.jpg"},
    { id: '7', name: 'Feldahorn', position: [8.526369, 48.357110], anrede: 'Pate/-in', paten: 'N.n.', preis: '45 €', bereich: 'A3', image: "20241013_165756.jpg"},
    { id: '8', name: 'Speierling', position: [8.526633, 48.357357], anrede: 'Pate/-in', paten: 'N.n.', preis: '55 €', bereich: 'B1', image: "20241013_165848.jpg"},
    { id: '9', name: 'Winterlinde', position: [8.526673, 48.357460], anrede: 'Pate/-in', paten: 'Marko Djuric; Angelina Polanyi', preis: '46 €', bereich: 'A3', image: "20241013_165901.jpg"},
    { id: '10', name: 'Stieleiche', position: [8.526825, 48.357460], anrede: 'Patin', paten: 'Josephine Stemmer', preis: '45 €', bereich: 'B1', image: "20241013_165944.jpg"},
    { id: '11', name: 'Elsbeere', position: [8.526768, 48.357580], anrede: 'Pate/-in', paten: 'Familie Resch', preis: '60 €', bereich: 'A3', image: "20241013_170120.jpg"},
    { id: '12', name: 'Eberesche', position: [8.526918, 48.357552], anrede: 'Pate/-in', paten: 'N.n.', preis: '38 €', bereich: 'B1', image: "20241013_170140.jpg"},
    { id: '13', name: 'Rotbuche', position: [8.526870, 48.357666], anrede: 'Patin', paten: 'Jisika', preis: '29 €', bereich: 'A3', image: "20241013_170149.jpg"},
    { id: '14', name: 'Bergahorn', position: [8.527094, 48.357617], anrede: 'Pate/-in', paten: 'N.n.', preis: '38 €', bereich: 'B1', image: "20241013_170235.jpg"},
    { id: '15', name: 'Eberesche', position: [8.527151, 48.357774], anrede: 'Pate/-in', paten: 'N.n.', preis: '38 €', bereich: 'A3', image: "20241013_170251.jpg"},
    { id: '16', name: 'Rotbuche', position: [8.527292, 48.357736], anrede: 'Pate/-in', paten: 'N.n.', preis: '29 €', bereich: 'B1', image: "20241013_170404.jpg"},
  /*  const imageFiles = [
        '20241013_165702.jpg',
    '20241013_165711.jpg',
    '20241013_165724.jpg',
    '20241013_165733.jpg',
    '20241013_165740.jpg',
    '20241013_165748.jpg',
    '20241013_165756.jpg',
    '20241013_165848.jpg',
    '20241013_165901.jpg',
    '20241013_165944.jpg',
    '20241013_170120.jpg',
    '20241013_170140.jpg',
    '20241013_170149.jpg',
    '20241013_170235.jpg',
    '20241013_170251.jpg',
    '20241013_170404.jpg'
      ];*/
    // Weitere Bäume hinzufügen
];

// Create a vector source and layer for markers
vectorSource = new VectorSource();
const markerLayer = new VectorLayer({
  source: vectorSource,
});
//picturemap.addLayer(markerLayer);
// Add a marker for each tree
const markers = {};

// Hinzufügen von Markern für jeden Baum
trees.forEach(tree => {
    var marker = new Feature({
        geometry: new Point(olProj.fromLonLat(tree.position)),
        name: tree.name,
        paten: tree.paten,
        preis: tree.preis,
        bereich: tree.bereich,
        treeId: tree.id,
    });

  
    // Set the default marker style
    marker.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: 'blue' }),
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
      })
    );
  
    vectorSource.addFeature(marker);
    markers[tree.id] = marker; // Store markers by tree ID
    /*vectorSource = new VectorSource({
        features: [marker]
    });

    var markerLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
            image: new Icon({
                src: 'https://cdn.mapmarker.io/api/v1/pin?size=30&background=%230073B3&icon=fa-tree&color=%23FFFFFF',
                anchor: [0.5, 1]
            })
        })
    });*/
    

});

picturemap.addLayer(markerLayer);
/*
// Popup für jedes Feature
picturemap.on('singleclick', function (evt) {
    picturemap.forEachFeatureAtPixel(evt.pixel, function (feature) {
        alert(`Baum: ${feature.get('name')}\nBaumpate: ${feature.get('paten')}\nPreis: ${feature.get('preis')}`);
    });
});*/




// Function to display trees in HTML
function displayTrees() {
    const treeContainer = document.getElementById('tree-list');
  
    trees.forEach((tree, index) => {
      // Create a container for each tree's details
      const treeElement = document.createElement('div');
      treeElement.classList.add('tree');
      treeElement.setAttribute('data-tree-id', tree.id); // Set tree ID as a data attribute for easy access

      const treeInfoElement= document.createElement('div');
      treeInfoElement.setAttribute('class','tree-info')
      //<img src="/images/20241013_165702.jpg" alt="Baum 1">
      // Add details about each tree
      treeInfoElement.innerHTML = `
        <p><strong>Baumart:</strong> ${tree.name}</p>
        <p><strong>${tree.anrede}:</strong> ${tree.paten}</p>
        <p><strong>Preis:</strong> ${tree.preis}</p>
        <p><strong>Position:</strong> (${tree.position[0]}, ${tree.position[1]})</p>
      `;
      treeElement.appendChild(treeInfoElement);
      const imageElement = document.createElement('img');
      imageElement.setAttribute('src','/images/'+tree.image);
      imageElement.setAttribute('alt','Tree '+index);

      imageElement.addEventListener('click', () => {
        highlightMarker(tree.id);
      });
      treeElement.prepend(imageElement);
  
      // Append each tree's details to the container
      treeContainer.appendChild(treeElement);
    });
  }
  // Function to highlight a marker on the map
function highlightMarker(treeId) {
    // Reset all marker styles
    vectorSource.getFeatures().forEach((feature) => {
      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: 'blue' }),
            stroke: new Stroke({ color: 'white', width: 2 }),
          }),
        })
      );
    });
  
    // Apply a highlight style to the selected marker
    const selectedMarker = markers[treeId];
    if (selectedMarker) {
      selectedMarker.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: 'red' }),
            stroke: new Stroke({ color: 'yellow', width: 2 }),
          }),
        })
      );
  
      // Center the map on the highlighted marker
      picturemap.getView().animate({
        center: selectedMarker.getGeometry().getCoordinates(),
        duration: 1000,
      });
    }
    
    
    /*photoList.forEach((treeEntry, index) => {
        if(treeEntry)
        {
            treeEntry.style.border = '1px solid black';
        }
    });*/
    const allImages = document.querySelectorAll('#tree-list div');
    allImages.forEach((img) => {
       img.style.border = '1px solid gray'; // Reset border to unhighlight
    });
    // Highlight the corresponding image
    const selectedImage = document.querySelector(`#tree-list div[data-tree-id="${treeId}"]`);
    if (selectedImage) {
        selectedImage.style.border = '2px solid red';
    }
}
  
// Highlight image when clicking on a marker on the map
picturemap.on('singleclick', (event) => {
    picturemap.forEachFeatureAtPixel(event.pixel, (feature) => {
      const treeId = feature.get('treeId');
      highlightMarker(treeId); // Highlight both marker and image
    });
  });

  // Display coordinates when clicking on the map
  picturemap.on('singleclick', (event) => {
    // Convert the clicked pixel position to geographic coordinates
    const clickedCoordinate = toLonLat(event.coordinate);
  
    // Extract longitude and latitude
    const [lon, lat] = clickedCoordinate;
    console.log(`position: ${lon.toFixed(6)}, ${lat.toFixed(6)}`);
  
  });
  // Call the display function when the DOM is loaded
  document.addEventListener('DOMContentLoaded', displayTrees);