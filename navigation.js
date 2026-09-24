/*
    COLLEGE INDOOR NAVIGATION
    Dijkstra's Shortest Path Algorithm
*/


// -----------------------------------------
// COLLEGE GRAPH
// -----------------------------------------

const collegeGraph = {

    entrance: {
        corridor1: 5
    },

    corridor1: {
        entrance: 5,
        room101: 5,
        room102: 5,
        stairs: 8,
        library: 12
    },

    room101: {
        corridor1: 5
    },

    room102: {
        corridor1: 5,
        lab1: 7
    },

    lab1: {
        room102: 7
    },

    stairs: {
        corridor1: 8,
        corridor2: 8
    },

    corridor2: {
        stairs: 8,
        room201: 5,
        room202: 5,
        washroom: 8,
        facultyRoom: 10
    },

    room201: {
        corridor2: 5
    },

    room202: {
        corridor2: 5
    },

    washroom: {
        corridor2: 8
    },

    facultyRoom: {
        corridor2: 10
    },

    library: {
        corridor1: 12,
        canteen: 10
    },

    canteen: {
        library: 10
    }

};


// -----------------------------------------
// LOCATION NAMES
// -----------------------------------------

const locationNames = {

    entrance: "Main Entrance",

    corridor1: "Ground Floor Corridor",

    room101: "Room 101",

    room102: "Room 102",

    lab1: "Computer Lab",

    stairs: "Stairs",

    corridor2: "First Floor Corridor",

    room201: "Room 201",

    room202: "Room 202",

    washroom: "Washroom",

    facultyRoom: "Faculty Room",

    library: "Library",

    canteen: "Canteen"

};


// -----------------------------------------
// DIJKSTRA ALGORITHM
// -----------------------------------------

function dijkstra(graph, start, end) {

    const distances = {};
    const previous = {};
    const unvisited = new Set();


    // Initialize distances

    for (const node in graph) {

        distances[node] = Infinity;

        previous[node] = null;

        unvisited.add(node);

    }


    distances[start] = 0;


    // Main algorithm

    while (unvisited.size > 0) {

        let currentNode = null;

        let shortestDistance = Infinity;


        // Find nearest unvisited node

        for (const node of unvisited) {

            if (distances[node] < shortestDistance) {

                shortestDistance = distances[node];

                currentNode = node;

            }

        }


        // No path exists

        if (currentNode === null) {

            break;

        }


        // Destination reached

        if (currentNode === end) {

            break;

        }


        unvisited.delete(currentNode);


        // Check neighbors

        for (const neighbor in graph[currentNode]) {

            const weight = graph[currentNode][neighbor];

            const newDistance =
                distances[currentNode] + weight;


            if (newDistance < distances[neighbor]) {

                distances[neighbor] = newDistance;

                previous[neighbor] = currentNode;

            }

        }

    }


    // Create path

    const path = [];

    let current = end;


    while (current !== null) {

        path.unshift(current);

        current = previous[current];

    }


    // No valid route

    if (path.length === 0 || path[0] !== start) {

        return null;

    }


    return {

        path: path,

        distance: distances[end]

    };

}


// -----------------------------------------
// GET LOCATION NAME
// -----------------------------------------

function getLocationName(id) {

    return locationNames[id] || id;

}


// -----------------------------------------
// GET ALL LOCATIONS
// -----------------------------------------

function getLocations() {

    return Object.keys(collegeGraph);

}