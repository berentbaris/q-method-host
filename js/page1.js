window.onload = function () {
    const uploadForm = document.getElementById("uploadForm");
    if (!uploadForm) {
        console.error("Error: #uploadForm not found. Ensure the form exists in page1.html.");
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

                if (workbook.SheetNames.length < 2) {
                    alert("Error: The uploaded file must contain at least two sheets (Statements & Map).");
                    return;
                }

                // Read first sheet (Statements)
                const sheetNameStatements = workbook.SheetNames[0];
                const sheetStatements = workbook.Sheets[sheetNameStatements];
                const jsonData = XLSX.utils.sheet_to_json(sheetStatements, { header: 1 }).slice(1); // Skip header row
                console.log("Statements data:", jsonData);

                // Read second sheet (Map)
                const sheetNameMap = workbook.SheetNames[1];
                const sheetMap = workbook.Sheets[sheetNameMap];
                const mapData = XLSX.utils.sheet_to_json(sheetMap, { header: 1 }).slice(1); // Skip header row
                console.log("Pyramid Map data:", mapData);

                // Store data in sessionStorage
                sessionStorage.setItem("uploadedData", JSON.stringify(jsonData));
                sessionStorage.setItem("pyramidMap", JSON.stringify(mapData));

                alert("File uploaded successfully!");
            } catch (error) {
                console.error("Error reading file:", error);
                alert("Error: Failed to process the uploaded file. Please check the console for details.");
            }
        };

        reader.onerror = function (error) {
            console.error("FileReader error:", error);
            alert("Error reading the file. Please try again.");
        };
    });
};
