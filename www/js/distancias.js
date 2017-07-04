var arrayLength;

function haversineDistance(pos1,pos2){
  var R = 6371; // km
  var dLat = toRad(pos2.lat-pos1.lat);
  var dLon = toRad(pos2.lon-pos1.lon);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(pos1.lat)) * Math.cos(toRad(pos2.lat)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = Math.round10((R * c), -2);
  return d;
}
function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}

function buildHeap(input) {
    arrayLength = input.length;
    for (var i = Math.floor(arrayLength / 2); i >= 0; i -= 1) {
        heapify(input, i);
    }
}

function heapify(input, i) {
    var left = 2 * i + 1;
    var right = 2 * i + 2;
    var largest = i;

    if (left < arrayLength && input[left].distancia_poi > input[largest].distancia_poi) {
        largest = left;
    }

    if (right < arrayLength && input[right].distancia_poi_poi > input[largest].distancia_poi_poi) {
        largest = right;
    }

    if (largest != i) {
        swap(input, i, largest);
        heapify(input, largest);
    }
}

function swap(input, index_A, index_B) {
    var temp = input[index_A];

    input[index_A] = input[index_B];
    input[index_B] = temp;
}

function heapSort(input) {
    buildHeap(input);

    for (var i = input.length - 1; i > 0; i--) {
        swap(input, 0, i);
        arrayLength--;
        heapify(input, 0);
    }
}
