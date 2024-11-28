// Include a library like SheetJS (xlsx) for handling Excel files
// Add the library via CDN in your HTML before this script: 
// <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.5/xlsx.full.min.js"></script>

document.getElementById("upload-button").addEventListener("click", function () {
    const fileInput = document.getElementById("file-upload");
    const feedback = document.getElementById("upload-feedback");

    if (!fileInput.files.length) {
        feedback.textContent = "Please upload a file.";
        feedback.style.color = "red";
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Assuming the first sheet contains the data
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Parse the sheet data
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Display preview (or save for future processing)
        feedback.textContent = "File uploaded successfully. Here's a preview:";
        feedback.style.color = "green";

        const preview = document.createElement("pre");
        preview.textContent = JSON.stringify(jsonData, null, 2);
        feedback.appendChild(preview);

        // Store jsonData for use in subsequent pages
        sessionStorage.setItem("uploadedData", JSON.stringify(jsonData));
    };

    reader.readAsArrayBuffer(file);
});
