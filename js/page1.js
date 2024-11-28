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
        try {
            // Read the file as an array buffer
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            // Parse the first sheet of the workbook
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Display success feedback and file preview
            feedback.textContent = "File uploaded successfully. Here's a preview:";
            feedback.style.color = "green";

            const preview = document.createElement("pre");
            preview.textContent = JSON.stringify(jsonData, null, 2);
            feedback.appendChild(preview);

            // Store parsed data in sessionStorage for later use
            sessionStorage.setItem("uploadedData", JSON.stringify(jsonData));
        } catch (error) {
            feedback.textContent = "Error reading the file. Please ensure it is a valid Excel file.";
            feedback.style.color = "red";
        }
    };

    // Read the file as an array buffer
    reader.readAsArrayBuffer(file);
});
