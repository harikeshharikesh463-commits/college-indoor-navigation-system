function generateQR() {

    let block = document.getElementById("block").value.trim();
    let floor = document.getElementById("floor").value.trim();
    let room = document.getElementById("room").value.trim();

    if (block === "" || floor === "" || room === "") {
        alert("Please enter Block, Floor and Room.");
        return;
    }

    // Location data
    let locationData = {
        block: block,
        floor: floor,
        room: room
    };

    // Convert object into JSON
    let qrData = JSON.stringify(locationData);

    // Remove previous QR
    document.getElementById("qrcode").innerHTML = "";

    // Generate QR
    new QRCode(document.getElementById("qrcode"), {
        text: qrData,
        width: 250,
        height: 250
    });
}
function onScanSuccess(decodedText, decodedResult) {

    console.log("QR Data:", decodedText);

    try {

        // Convert scanned JSON into JavaScript object
        let location = JSON.parse(decodedText);

        document.getElementById("result").innerHTML =
            "Block: " + location.block +
            "<br>Floor: " + location.floor +
            "<br>Room: " + location.room;

    } catch (error) {

        // If QR contains normal text
        document.getElementById("result").innerText =
            decodedText;
    }
}


// Start QR scanner
let scanner = new Html5QrcodeScanner(
    "reader",
    {
        fps: 10,
        qrbox: 250
    }
);

scanner.render(
    onScanSuccess
);