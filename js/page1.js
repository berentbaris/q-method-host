document.addEventListener("DOMContentLoaded", function () {
    const uploadForm = document.getElementById("uploadForm");
    const statusMessage = document.getElementById("statusMessage"); // Ensure this exists

    if (!uploadForm) {
        console.error("Error: #uploadForm not found. Ensure it exists in page1.html.");
        return;
    }
    if (!statusMessage) {
        console.error("Error: #statusMessage not found. Ensure it exists in page1.html.");
        return;
    }

    uploadForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const fileInput = document.getElementById("fileUpload");
        if (!fileInput || fileInput.files.length === 0) {
            alert("Please upload an Excel file.");
            return;
        }

        const reader = new FileReader();
        reader.readAsArrayBuffer(fileInput.files[0]);

        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });

                console.log("Workbook loaded:", workbook.SheetNames);
                statusMessage.innerText = "Workbook loaded successfully!"; // Now it will work

                if (workbook.SheetNames.length < 2) {
                    alert("Error: The uploaded file must contain at least two sheets (Statements & Map).");
                    return;
                }

                // Read first sheet (Statements)
                const sheetNameStatements = workbook.SheetNames[0];
                const sheetStatements = workbook.Sheets[sheetNameStatements];
                const jsonData = XLSX.utils.sheet_to_json(sheetStatements, { header: 1 }).slice(1); // Skip header row
                const statementObjects = jsonData.map((row, index) => ({
                    id: index + 1,   // Assign a unique ID
                    text: row[1]      // Extract second column as the statement text
                }));
                console.log("Processed Statements Data:", statementObjects); // Debugging

                // Read second sheet (Map)
                const sheetNameMap = workbook.SheetNames[1];
                const sheetMap = workbook.Sheets[sheetNameMap];
                const mapData = XLSX.utils.sheet_to_json(sheetMap, { header: 1 }).slice(1); // Skip header row
                console.log("Pyramid Map data:", mapData);

                // Store data in sessionStorage
                const statementTexts = jsonData.map(row => row.slice(1)).flat(); 
                sessionStorage.setItem("uploadedData", JSON.stringify(statementObjects));
                console.log("Stored statements:", statementTexts); // Debugging log
                sessionStorage.setItem("pyramidMap", JSON.stringify(mapData));

                statusMessage.innerText = "File uploaded successfully!";
                alert("File uploaded successfully!");
            } catch (error) {
                console.error("Error reading file:", error);
                statusMessage.innerText = "Error processing the file.";
                alert("Error: Failed to process the uploaded file. Please check the console for details.");
            }
        };

        reader.onerror = function (error) {
            console.error("FileReader error:", error);
            statusMessage.innerText = "Error reading the file.";
            alert("Error reading the file. Please try again.");
        };
    });
});
