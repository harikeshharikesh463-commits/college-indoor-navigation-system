/*
    MAIN APPLICATION
*/


document.addEventListener("DOMContentLoaded", function () {


    // -----------------------------------------
    // ELEMENTS
    // -----------------------------------------

    const startSelect =
        document.getElementById("startLocation");

    const destinationSelect =
        document.getElementById("destination");

    const findRouteBtn =
        document.getElementById("findRouteBtn");

    const resetBtn =
        document.getElementById("resetBtn");

    const routeMessage =
        document.getElementById("routeMessage");

    const routeResult =
        document.getElementById("routeResult");

    const status =
        document.getElementById("status");


    // -----------------------------------------
    // LOAD LOCATIONS
    // -----------------------------------------

    const locations = getLocations();


    locations.forEach(function (location) {


        // Current location option

        const startOption =
            document.createElement("option");

        startOption.value = location;

        startOption.textContent =
            getLocationName(location);

        startSelect.appendChild(startOption);


        // Destination option

        const destinationOption =
            document.createElement("option");

        destinationOption.value = location;

        destinationOption.textContent =
            getLocationName(location);

        destinationSelect.appendChild(destinationOption);

    });


    // -----------------------------------------
    // FIND ROUTE
    // -----------------------------------------

    findRouteBtn.addEventListener("click", function () {


        const start =
            startSelect.value;

        const destination =
            destinationSelect.value;


        // Validation

        if (!start || !destination) {

            routeMessage.textContent =
                "Please select both current location and destination.";

            routeResult.innerHTML = "";

            status.textContent = "Select locations";

            return;

        }


        if (start === destination) {

            routeMessage.textContent =
                "You are already at your destination.";

            routeResult.innerHTML = `
                <div class="route-step">
                    📍 ${getLocationName(start)}
                </div>
            `;

            status.textContent = "Already here";

            return;

        }


        // Run Dijkstra

        const result =
            dijkstra(collegeGraph, start, destination);


        // No route

        if (!result) {

            routeMessage.textContent =
                "No route found between these locations.";

            routeResult.innerHTML = "";

            status.textContent = "No route";

            return;

        }


        // -----------------------------------------
        // DISPLAY ROUTE
        // -----------------------------------------

        routeMessage.textContent =
            "Shortest route found:";


        let html = `
            <div class="route-path">
        `;


        result.path.forEach(function (node, index) {

            html += `
                <div class="route-step">
                    ${index + 1}.
                    ${getLocationName(node)}
                </div>
            `;

        });


        html += `
            </div>

            <div class="distance">
                📏 Total Distance:
                ${result.distance} meters
            </div>
        `;


        routeResult.innerHTML = html;


        status.textContent =
            "Route Found";


        // Show route on SVG

        drawRouteOnMap(result.path);

    });


    // -----------------------------------------
    // RESET
    // -----------------------------------------

    resetBtn.addEventListener("click", function () {

        startSelect.value = "";

        destinationSelect.value = "";

        routeMessage.textContent =
            "Select locations to find a route.";

        routeResult.innerHTML = "";

        status.textContent = "Ready";


        clearMapRoute();

    });


});


// -----------------------------------------
// DRAW ROUTE ON SVG
// -----------------------------------------

function drawRouteOnMap(path) {


    const mapObject =
        document.getElementById("collegeMap");


    try {

        const svg =
            mapObject.contentDocument;


        if (!svg) {

            console.log("SVG not loaded yet.");

            return;

        }


        // Remove old route

        const oldRoute =
            svg.getElementById("navigationRoute");


        if (oldRoute) {

            oldRoute.remove();

        }


        // Coordinates of nodes

        const coordinates = {

            entrance: [100, 300],

            corridor1: [250, 300],

            room101: [250, 180],

            room102: [250, 420],

            lab1: [400, 420],

            stairs: [400, 300],

            corridor2: [550, 300],

            room201: [550, 180],

            room202: [550, 420],

            washroom: [700, 420],

            facultyRoom: [700, 180],

            library: [400, 180],

            canteen: [550, 100]

        };


        // Create SVG polyline

        const polyline =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "polyline"
            );


        const points =
            path
                .map(node => coordinates[node])
                .filter(Boolean)
                .map(point => point.join(","))
                .join(" ");


        polyline.setAttribute(
            "points",
            points
        );


        polyline.setAttribute(
            "id",
            "navigationRoute"
        );


        polyline.setAttribute(
            "fill",
            "none"
        );


        polyline.setAttribute(
            "stroke",
            "#2563eb"
        );


        polyline.setAttribute(
            "stroke-width",
            "8"
        );


        polyline.setAttribute(
            "stroke-linecap",
            "round"
        );


        polyline.setAttribute(
            "stroke-linejoin",
            "round"
        );


        svg.documentElement.appendChild(
            polyline
        );


    } catch (error) {

        console.log(
            "Could not draw route:",
            error
        );

    }

}


// -----------------------------------------
// CLEAR ROUTE
// -----------------------------------------

function clearMapRoute() {


    const mapObject =
        document.getElementById("collegeMap");


    try {

        const svg =
            mapObject.contentDocument;


        if (!svg) return;


        const route =
            svg.getElementById("navigationRoute");


        if (route) {

            route.remove();

        }

    } catch (error) {

        console.log(error);

    }

}

/* =====================================
   EXPLORE CAMPUS FEATURE
===================================== */


// -------------------------------------
// PLACE INFORMATION
// -------------------------------------

const placeInformation = {

    entrance: {
        name: "Main Entrance",
        icon: "🚪",
        type: "Entrance",
        floor: "Ground Floor",
        description:
            "Main entrance of the college block.",
        nearby:
            "Ground Floor Corridor, Reception"
    },


    room101: {
        name: "Room 101",
        icon: "🏫",
        type: "Classroom",
        floor: "Ground Floor",
        description:
            "Classroom located near the main corridor.",
        nearby:
            "Room 102, Computer Lab, Stairs"
    },


    room102: {
        name: "Room 102",
        icon: "🏫",
        type: "Classroom",
        floor: "Ground Floor",
        description:
            "Classroom located beside Room 101.",
        nearby:
            "Room 101, Computer Lab"
    },


    lab1: {
        name: "Computer Lab",
        icon: "💻",
        type: "Laboratory",
        floor: "Ground Floor",
        description:
            "Computer laboratory for practical classes.",
        nearby:
            "Room 102, Stairs, Library"
    },


    library: {
        name: "Library",
        icon: "📚",
        type: "Library",
        floor: "Ground Floor",
        description:
            "College library containing books and study resources.",
        nearby:
            "Computer Lab, Canteen"
    },


    stairs: {
        name: "Stairs",
        icon: "🪜",
        type: "Navigation Point",
        floor: "Ground Floor",
        description:
            "Stairs connecting different floors of the building.",
        nearby:
            "Ground Floor Corridor, First Floor Corridor"
    },


    room201: {
        name: "Room 201",
        icon: "🏫",
        type: "Classroom",
        floor: "First Floor",
        description:
            "Classroom located on the first floor.",
        nearby:
            "Room 202, Faculty Room, Washroom"
    },


    room202: {
        name: "Room 202",
        icon: "🏫",
        type: "Classroom",
        floor: "First Floor",
        description:
            "Classroom located on the first floor.",
        nearby:
            "Room 201, Washroom"
    },


    facultyRoom: {
        name: "Faculty Room",
        icon: "👨‍🏫",
        type: "Faculty Room",
        floor: "First Floor",
        description:
            "Room used by college faculty members.",
        nearby:
            "Room 201, Corridor"
    },


    washroom: {
        name: "Washroom",
        icon: "🚻",
        type: "Facility",
        floor: "First Floor",
        description:
            "Washroom facility available for students.",
        nearby:
            "Room 202, Faculty Room"
    },


    canteen: {
        name: "Canteen",
        icon: "🍽️",
        type: "Food Facility",
        floor: "Ground Floor",
        description:
            "College canteen for food and refreshments.",
        nearby:
            "Library, Corridor"
    }

};


// -------------------------------------
// SHOW PLACE INFORMATION
// -------------------------------------

function showPlaceInformation(placeId) {

    const info =
        placeInformation[placeId];

    const placeInfo =
        document.getElementById("placeInfo");


    if (!info || !placeInfo) {

        return;

    }


    placeInfo.innerHTML = `

        <div class="place-icon">
            ${info.icon}
        </div>

        <div>

            <h3>
                ${info.name}
            </h3>

            <p>
                <strong>Type:</strong>
                ${info.type}
                &nbsp; | &nbsp;

                <strong>Floor:</strong>
                ${info.floor}
            </p>

            <p>
                ${info.description}
            </p>

            <p>
                <strong>Nearby:</strong>
                ${info.nearby}
            </p>

        </div>

    `;

}


// -------------------------------------
// MAKE SVG LOCATIONS CLICKABLE
// -------------------------------------

function enableMapExploration() {

    const mapObject =
        document.getElementById("collegeMap");


    try {

        const svg =
            mapObject.contentDocument;


        if (!svg) {

            return;

        }


        const clickablePlaces = [

            "entrance",
            "room101",
            "room102",
            "lab1",
            "library",
            "stairs",
            "room201",
            "room202",
            "facultyRoom",
            "washroom",
            "canteen"

        ];


        clickablePlaces.forEach(function (id) {

            const element =
                svg.getElementById(id);


            if (!element) {

                return;

            }


            element.style.cursor = "pointer";


            element.addEventListener(
                "click",
                function () {

                    showPlaceInformation(id);

                }
            );


            element.addEventListener(
                "mouseenter",
                function () {

                    element.style.opacity = "0.75";

                }
            );


            element.addEventListener(
                "mouseleave",
                function () {

                    element.style.opacity = "1";

                }
            );

        });


    } catch (error) {

        console.log(
            "Map exploration error:",
            error
        );

    }

}


// -------------------------------------
// WAIT FOR SVG MAP
// -------------------------------------

document
    .getElementById("collegeMap")
    .addEventListener(
        "load",
        function () {

            enableMapExploration();

        }
    );


// -------------------------------------
// FLOOR BUTTONS
// -------------------------------------

const floorButtons =
    document.querySelectorAll(".floor-btn");


floorButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            floorButtons.forEach(function (btn) {

                btn.classList.remove("active");

            });


            button.classList.add("active");


            const floor =
                button.dataset.floor;


            const placeInfo =
                document.getElementById("placeInfo");


            placeInfo.innerHTML = `

                <div class="place-icon">
                    🏢
                </div>

                <div>

                    <h3>
                        Floor ${floor}
                    </h3>

                    <p>
                        Explore the rooms,
                        laboratories and facilities
                        available on Floor ${floor}.
                    </p>

                </div>

            `;

        }
    );

});

/* =================================
   QUICK EXPLORE CARDS
================================= */

const exploreCards =
    document.querySelectorAll(".explore-card");


exploreCards.forEach(function (card) {

    card.addEventListener("click", function () {

        const placeId =
            card.dataset.place;


        // Show information
        showPlaceInformation(placeId);


        // Scroll to information
        const placeInfo =
            document.getElementById("placeInfo");


        if (placeInfo) {

            placeInfo.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    });

});

/* =================================
   EXPLORE DETAILED INFORMATION
================================= */


const detailedPlaces = {

    lab1: {

        title: "Computer Lab",

        subtitle: "Computer Laboratory",

        icon: "💻",

        location: "Block A - Computer Lab",

        floor: "Ground Floor",

        capacity: "30 Students",

        availability: "Available",

        description:
            "The Computer Lab is used for programming, practical classes, web development and other computer-based activities.",

        nearby: [
            "Room 102",
            "Library",
            "Main Corridor",
            "Stairs"
        ]

    },


    library: {

        title: "College Library",

        subtitle: "Library & Study Area",

        icon: "📚",

        location: "Block A - Library",

        floor: "Ground Floor",

        capacity: "80 Students",

        availability: "Open",

        description:
            "The college library provides books, reference materials and a quiet environment for students to study and prepare for examinations.",

        nearby: [
            "Computer Lab",
            "Room 101",
            "Canteen",
            "Main Corridor"
        ]

    },


    room101: {

        title: "Room 101",

        subtitle: "Classroom",

        icon: "🏫",

        location: "Block A - Room 101",

        floor: "Ground Floor",

        capacity: "60 Students",

        availability: "Classroom",

        description:
            "Room 101 is a regular classroom used for lectures, tutorials and academic activities.",

        nearby: [
            "Room 102",
            "Computer Lab",
            "Main Entrance",
            "Stairs"
        ]

    },


    facultyRoom: {

        title: "Faculty Room",

        subtitle: "Faculty Office",

        icon: "👨‍🏫",

        location: "Block A - Faculty Room",

        floor: "First Floor",

        capacity: "Faculty Area",

        availability: "Staff Area",

        description:
            "This room is used by faculty members for academic work, meetings and student interaction.",

        nearby: [
            "Room 201",
            "Room 202",
            "Washroom",
            "Stairs"
        ]

    },


    washroom: {

        title: "Washroom",

        subtitle: "Student Facility",

        icon: "🚻",

        location: "Block A - Washroom",

        floor: "First Floor",

        capacity: "Multiple Users",

        availability: "Available",

        description:
            "Washroom facility available for students and staff on the first floor.",

        nearby: [
            "Room 202",
            "Faculty Room",
            "Stairs"
        ]

    },


    canteen: {

        title: "College Canteen",

        subtitle: "Food & Refreshment Area",

        icon: "🍽️",

        location: "Block A - Canteen",

        floor: "Ground Floor",

        capacity: "50 Students",

        availability: "Open",

        description:
            "The college canteen provides food and refreshments for students and staff.",

        nearby: [
            "Library",
            "Main Corridor",
            "Entrance"
        ]

    }

};


/* ---------------------------------
   CARD CLICK
--------------------------------- */

const detailedExploreCards =
    document.querySelectorAll(
        ".explore-card"
    );


detailedExploreCards.forEach(function(card) {

    card.addEventListener(
        "click",
        function() {

            const placeId =
                card.dataset.place;

            showDetailedPlace(placeId);

        }
    );

});


/* ---------------------------------
   SHOW DETAILS
--------------------------------- */

function showDetailedPlace(placeId) {

    const place =
        detailedPlaces[placeId];


    if (!place) {

        return;

    }


    const details =
        document.getElementById(
            "exploreDetails"
        );


    if (!details) {

        return;

    }


    document.getElementById(
        "detailsIcon"
    ).textContent = place.icon;


    document.getElementById(
        "detailsTitle"
    ).textContent = place.title;


    document.getElementById(
        "detailsSubtitle"
    ).textContent = place.subtitle;


    document.getElementById(
        "detailLocation"
    ).textContent = place.location;


    document.getElementById(
        "detailFloor"
    ).textContent = place.floor;


    document.getElementById(
        "detailCapacity"
    ).textContent = place.capacity;


    document.getElementById(
        "detailAvailability"
    ).textContent = place.availability;


    document.getElementById(
        "detailDescription"
    ).textContent =
        place.description;


    const nearby =
        document.getElementById(
            "nearbyPlaces"
        );


    nearby.innerHTML = "";


    place.nearby.forEach(function(item) {

        const tag =
            document.createElement("span");

        tag.textContent = item;

        nearby.appendChild(tag);

    });


    details.classList.add("show");


    details.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}
/* =========================================
   COURSES & PROGRAMS
========================================= */


const courseData = {

        ]
     "btech-cse": {
    title: "B.Tech Computer Science & Engineering",
    icon: "💻",
    duration: "4 Years",
    eligibility: "12th with PCM",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Bachelor of Technology in Computer Science & Engineering.",
    subjects: [
        "Programming",
        "Data Structures",
        "Algorithms",
        "Database Management",
        "Operating Systems",
        "Computer Networks"
    ]
},

"btech-cs": {
    title: "B.Tech Computer Science",
    icon: "🖥️",
    duration: "4 Years",
    eligibility: "12th with PCM",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Bachelor of Technology in Computer Science.",
    subjects: [
        "Programming",
        "Data Structures",
        "Algorithms",
        "Database",
        "Web Development"
    ]
},

"btech-it": {
    title: "B.Tech Information Technology",
    icon: "🌐",
    duration: "4 Years",
    eligibility: "12th with PCM",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Bachelor of Technology in Information Technology.",
    subjects: [
        "Web Technology",
        "Database",
        "Networking",
        "Programming",
        "Software Engineering"
    ]
},

"btech-ds": {
    title: "B.Tech Data Science",
    icon: "📊",
    duration: "4 Years",
    eligibility: "12th with PCM",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Bachelor of Technology in Data Science.",
    subjects: [
        "Python",
        "Statistics",
        "Data Analytics",
        "Machine Learning",
        "Data Visualization"
    ]
},

"btech-me": {
    title: "B.Tech Mechanical Engineering",
    icon: "⚙️",
    duration: "4 Years",
    eligibility: "12th with PCM",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Bachelor of Technology in Mechanical Engineering.",
    subjects: [
        "Engineering Mechanics",
        "Thermodynamics",
        "Machine Design",
        "Manufacturing",
        "Fluid Mechanics"
    ]
},

"btech-ece": {
    title: "B.Tech Electronics & Communication",
    icon: "📡",
    duration: "4 Years",
    eligibility: "12th with PCM",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Bachelor of Technology in Electronics & Communication Engineering.",
    subjects: [
        "Digital Electronics",
        "Communication Systems",
        "Microprocessors",
        "Signals & Systems",
        "Electronic Devices"
    ]
},

"btech-civil": {
    title: "B.Tech Civil Engineering",
    icon: "🏗️",
    duration: "4 Years",
    eligibility: "12th with PCM",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Bachelor of Technology in Civil Engineering.",
    subjects: [
        "Structural Engineering",
        "Surveying",
        "Construction",
        "Geotechnical Engineering",
        "Environmental Engineering"
    ]
},

"btech-electrical": {
    title: "B.Tech Electrical Engineering",
    icon: "⚡",
    duration: "4 Years",
    eligibility: "12th with PCM",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Bachelor of Technology in Electrical Engineering.",
    subjects: [
        "Electrical Circuits",
        "Electrical Machines",
        "Power Systems",
        "Control Systems",
        "Digital Electronics"
    ]
},

"mtech": {
    title: "M.Tech",
    icon: "🎓",
    duration: "2 Years",
    eligibility: "Relevant Bachelor's Degree",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Master of Technology postgraduate engineering program.",
    subjects: [
        "Advanced Engineering",
        "Research Methodology",
        "Specialization Subjects",
        "Project Work"
    ]
},

"bca": {
    title: "BCA",
    icon: "💻",
    duration: "3 Years",
    eligibility: "12th",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Bachelor of Computer Applications.",
    subjects: [
        "Programming",
        "Database",
        "Web Development",
        "Computer Networks",
        "Software Engineering"
    ]
},

"mca": {
    title: "MCA",
    icon: "🧑‍💻",
    duration: "2 Years",
    eligibility: "Relevant Bachelor's Degree",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Master of Computer Applications.",
    subjects: [
        "Advanced Programming",
        "Database Systems",
        "Computer Networks",
        "Software Engineering",
        "Artificial Intelligence"
    ]
},

"bba-new": {
    title: "BBA",
    icon: "📈",
    duration: "3 Years",
    eligibility: "12th",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Bachelor of Business Administration.",
    subjects: [
        "Marketing",
        "Finance",
        "Human Resources",
        "Business Communication",
        "Entrepreneurship"
    ]
},

"mba": {
    title: "MBA",
    icon: "💼",
    duration: "2 Years",
    eligibility: "Bachelor's Degree",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Master of Business Administration.",
    subjects: [
        "Marketing Management",
        "Financial Management",
        "Human Resource Management",
        "Operations Management",
        "Business Strategy"
    ]
},

"polytechnic": {
    title: "Polytechnic",
    icon: "🔧",
    duration: "3 Years",
    eligibility: "As per admission rules",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Diploma-level technical education program.",
    subjects: [
        "Engineering Mathematics",
        "Engineering Drawing",
        "Workshop Practice",
        "Basic Engineering",
        "Branch Subjects"
    ]
},

"llb": {
    title: "LLB",
    icon: "⚖️",
    duration: "3 Years",
    eligibility: "Bachelor's Degree",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Bachelor of Laws program.",
    subjects: [
        "Constitutional Law",
        "Criminal Law",
        "Contract Law",
        "Family Law",
        "Property Law"
    ]
},

"bpharma": {
    title: "B.Pharm",
    icon: "💊",
    duration: "4 Years",
    eligibility: "12th with relevant subjects",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Bachelor of Pharmacy program.",
    subjects: [
        "Pharmaceutics",
        "Pharmaceutical Chemistry",
        "Pharmacology",
        "Pharmacognosy",
        "Pharmacy Practice"
    ]
},

"dpharma": {
    title: "D.Pharm",
    icon: "💉",
    duration: "2 Years",
    eligibility: "12th with relevant subjects",
    seats: "As per college intake",
    fee: "Contact College",
    description: "Diploma in Pharmacy program.",
    subjects: [
        "Pharmaceutics",
        "Pharmaceutical Chemistry",
        "Pharmacology",
        "Pharmacognosy"
    ]
},
    


    ee: {

        title:
            "B.Tech Electrical Engineering",

        icon:
            "⚡",

        duration:
            "4 Years",

        eligibility:
            "12th with PCM",

        seats:
            "60",

        fee:
            "₹XX,XXX / Year",

        description:
            "This program covers electrical systems, electronics, power systems, circuits, control systems and modern electrical technologies.",

        subjects: [

            "Electrical Circuits",

            "Digital Electronics",

            "Power Systems",

            "Control Systems",

            "Electrical Machines",

            "Signals & Systems"

        ]

    },


    bsc: {

        title:
            "B.Sc Computer Science",

        icon:
            "🔬",

        duration:
            "3 Years",

        eligibility:
            "12th",

        seats:
            "60",

        fee:
            "₹XX,XXX / Year",

        description:
            "This program provides fundamental knowledge of computer science, programming, mathematics, databases and software development.",

        subjects: [

            "Programming",

            "Computer Fundamentals",

            "Data Structures",

            "Database Systems",

            "Web Technology",

            "Computer Networks"

        ]

    },


    bba: {

        title:
            "Bachelor of Business Administration",

        icon:
            "📊",

        duration:
            "3 Years",

        eligibility:
            "12th",

        seats:
            "60",

        fee:
            "₹XX,XXX / Year",

        description:
            "This program focuses on business management, marketing, finance, human resources, entrepreneurship and organizational management.",

        subjects: [

            "Marketing Management",

            "Financial Management",

            "Human Resource Management",

            "Business Communication",

            "Entrepreneurship",

            "Business Economics"

        ]

    }

};


/* -----------------------------------------
   COURSE DETAILS
----------------------------------------- */


const courseButtons =
    document.querySelectorAll(
        ".course-details-btn"
    );


courseButtons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            const courseId =
                button.dataset.course;

            showCourseDetails(courseId);

        }
    );

});


function showCourseDetails(courseId) {

    const course =
        courseData[courseId];


    if (!course) {

        return;

    }


    document.getElementById(
        "courseDetailsIcon"
    ).textContent =
        course.icon;


    document.getElementById(
        "courseDetailsTitle"
    ).textContent =
        course.title;


    document.getElementById(
        "courseDuration"
    ).textContent =
        course.duration;


    document.getElementById(
        "courseEligibility"
    ).textContent =
        course.eligibility;


    document.getElementById(
        "courseSeats"
    ).textContent =
        course.seats;


    document.getElementById(
        "courseFee"
    ).textContent =
        course.fee;


    document.getElementById(
        "courseDescription"
    ).textContent =
        course.description;


    const subjectList =
        document.getElementById(
            "courseSubjects"
        );


    subjectList.innerHTML = "";


    course.subjects.forEach(
        function(subject) {

            const span =
                document.createElement(
                    "span"
                );

            span.textContent =
                subject;

            subjectList.appendChild(
                span
            );

        }
    );


    const detailsPanel =
        document.getElementById(
            "courseDetails"
        );


    detailsPanel.classList.add(
        "show"
    );


    detailsPanel.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/* -----------------------------------------
   COURSE FILTER
----------------------------------------- */


const courseFilters =
    document.querySelectorAll(
        ".course-filter"
    );


courseFilters.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            courseFilters.forEach(
                function(btn) {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


            button.classList.add(
                "active"
            );


            const category =
                button.dataset.category;


            const cards =
                document.querySelectorAll(
                    ".course-card"
                );


            cards.forEach(
                function(card) {

                    if (
                        category === "all" ||
                        card.dataset.category ===
                        category
                    ) {

                        card.style.display =
                            "block";

                    } else {

                        card.style.display =
                            "none";

                    }

                }
            );

        }
    );

});

/* =========================================
   FIX: FEE COURSE DROPDOWN
========================================= */

const feeSelect =
    document.getElementById("feeCourseSelect");

const feeTotal =
    document.getElementById("totalCourseFee");

const feeAnnual =
    document.getElementById("annualFee");

const feeCourseName =
    document.getElementById("selectedFeeCourse");

const feeInstallmentCount =
    document.getElementById("installmentCount");

const feeInstallmentList =
    document.getElementById("installmentList");


const courseFees = {

    "btech-cse": {
        name: "B.Tech Computer Science & Engineering",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "btech-cs": {
        name: "B.Tech Computer Science",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "btech-it": {
        name: "B.Tech Information Technology",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "btech-ds": {
        name: "B.Tech Data Science",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "btech-me": {
        name: "B.Tech Mechanical Engineering",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "btech-ece": {
        name: "B.Tech Electronics & Communication",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "btech-civil": {
        name: "B.Tech Civil Engineering",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "btech-electrical": {
        name: "B.Tech Electrical Engineering",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "mtech": {
        name: "M.Tech",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "bca": {
        name: "BCA",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "mca": {
        name: "MCA",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "bba-new": {
        name: "BBA",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "mba": {
        name: "MBA",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "polytechnic": {
        name: "Polytechnic",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 3
    },

    "llb": {
        name: "LLB",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 3
    },

    "bpharma": {
        name: "B.Pharm",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 4
    },

    "dpharma": {
        name: "D.Pharm",
        total: "₹XX,XXX",
        annual: "₹XX,XXX",
        installments: 2
    }

};


/* UPDATE FEE SECTION */

function updateFeeSection(courseId) {

    const course = courseFees[courseId];

    if (!course) {
        return;
    }


    /* COURSE NAME */

    feeCourseName.textContent =
        course.name;


    /* TOTAL FEE */

    feeTotal.textContent =
        course.total;


    /* ANNUAL FEE */

    feeAnnual.textContent =
        course.annual;


    /* INSTALLMENT COUNT */

    feeInstallmentCount.textContent =
        course.installments;


    /* INSTALLMENT LIST */

    feeInstallmentList.innerHTML = "";


    for (
        let i = 1;
        i <= course.installments;
        i++
    ) {

        const installment =
            document.createElement("div");

        installment.className =
            "installment-card";


        installment.innerHTML = `

            <div class="installment-number">
                ${i}
            </div>

            <div>
                <span>
                    INSTALLMENT
                </span>

                <strong>
                    Payment ${i}
                </strong>
            </div>

            <div>
                <span>
                    AMOUNT
                </span>

                <strong>
                    Contact College
                </strong>
            </div>

            <div>
                <span>
                    DUE DATE
                </span>

                <strong>
                    To Be Announced
                </strong>
            </div>

            <div class="payment-status status-upcoming">
                UPCOMING
            </div>

        `;


        feeInstallmentList.appendChild(
            installment
        );

    }

}


/* DROPDOWN CHANGE EVENT */

if (feeSelect) {

    feeSelect.addEventListener(
        "change",
        function () {

            updateFeeSection(
                this.value
            );

        }
    );


    /* LOAD SELECTED COURSE */

    updateFeeSection(
        feeSelect.value
    );

}

/* =========================================
   FEES & INSTALLMENT SYSTEM
========================================= */


/*
   IMPORTANT:
   Abhi fee amounts aur dates demo values hain.
   Actual college data baad me yahan change karna hai.
*/


const feeData = {

    "btech-cse": {

        course:
            "B.Tech Computer Science & Engineering",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: [

            {
                number: 1,
                amount: "₹XX,XXX",
                date: "DD/MM/YYYY",
                status: "Pending"
            },

            {
                number: 2,
                amount: "₹XX,XXX",
                date: "DD/MM/YYYY",
                status: "Upcoming"
            },

            {
                number: 3,
                amount: "₹XX,XXX",
                date: "DD/MM/YYYY",
                status: "Upcoming"
            },

            {
                number: 4,
                amount: "₹XX,XXX",
                date: "DD/MM/YYYY",
                status: "Upcoming"
            }

        ]

    },


    "btech-cs": {

        course:
            "B.Tech Computer Science",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "btech-it": {

        course:
            "B.Tech Information Technology",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "btech-ds": {

        course:
            "B.Tech Data Science",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "btech-me": {

        course:
            "B.Tech Mechanical Engineering",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "btech-ece": {

        course:
            "B.Tech Electronics & Communication",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "btech-civil": {

        course:
            "B.Tech Civil Engineering",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "btech-electrical": {

        course:
            "B.Tech Electrical Engineering",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "mtech": {

        course:
            "M.Tech",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "bca": {

        course:
            "BCA",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "mca": {

        course:
            "MCA",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "bba-new": {

        course:
            "BBA",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "mba": {

        course:
            "MBA",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "polytechnic": {

        course:
            "Polytechnic",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "llb": {

        course:
            "LLB",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "bpharma": {

        course:
            "B.Pharm",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    },


    "dpharma": {

        course:
            "D.Pharm",

        total:
            "₹XX,XXX",

        annual:
            "₹XX,XXX",

        installments: []

    }

};


/* -----------------------------------------
   FEE ELEMENTS
----------------------------------------- */

const feeCourseSelect =
    document.getElementById(
        "feeCourseSelect"
    );


const totalCourseFee =
    document.getElementById(
        "totalCourseFee"
    );


const annualFee =
    document.getElementById(
        "annualFee"
    );


const selectedFeeCourse =
    document.getElementById(
        "selectedFeeCourse"
    );


const installmentCount =
    document.getElementById(
        "installmentCount"
    );


const installmentList =
    document.getElementById(
        "installmentList"
    );


/* -----------------------------------------
   LOAD FEE DETAILS
----------------------------------------- */

function loadFeeDetails(courseId) {

    const data =
        feeData[courseId];


    if (!data) {

        return;

    }


    totalCourseFee.textContent =
        data.total;


    annualFee.textContent =
        data.annual;


    selectedFeeCourse.textContent =
        data.course;


    installmentCount.textContent =
        data.installments.length;


    installmentList.innerHTML = "";


    if (
        data.installments.length === 0
    ) {

        installmentList.innerHTML = `

            <div class="installment-card">

                <div class="installment-number">
                    —
                </div>

                <div>

                    <span>
                        INSTALLMENT INFORMATION
                    </span>

                    <strong>
                        Details not available
                    </strong>

                </div>

                <div>

                    <span>
                        AMOUNT
                    </span>

                    <strong>
                        Contact College
                    </strong>

                </div>

                <div>

                    <span>
                        DUE DATE
                    </span>

                    <strong>
                        Contact College
                    </strong>

                </div>

                <div class="payment-status status-upcoming">
                    INFORMATION
                </div>

            </div>

        `;

        return;

    }


    data.installments.forEach(
        function(installment) {

            let statusClass =
                "status-upcoming";


            if (
                installment.status ===
                "Pending"
            ) {

                statusClass =
                    "status-pending";

            }


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "installment-card";


            card.innerHTML = `

                <div class="installment-number">

                    ${installment.number}

                </div>


                <div>

                    <span>
                        INSTALLMENT
                    </span>

                    <strong>
                        Payment ${installment.number}
                    </strong>

                </div>


                <div>

                    <span>
                        AMOUNT
                    </span>

                    <strong>
                        ${installment.amount}
                    </strong>

                </div>


                <div>

                    <span>
                        DUE DATE
                    </span>

                    <strong>
                        ${installment.date}
                    </strong>

                </div>


                <div class="payment-status ${statusClass}">

                    ${installment.status}

                </div>

            `;


            installmentList.appendChild(
                card
            );

        }
    );

}


/* -----------------------------------------
   COURSE CHANGE
----------------------------------------- */

if (feeCourseSelect) {

    feeCourseSelect.addEventListener(
        "change",
        function() {

            loadFeeDetails(
                this.value
            );

        }
    );


    loadFeeDetails(
        feeCourseSelect.value
    );

}