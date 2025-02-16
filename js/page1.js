document.getElementById("uploadForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileUpload");
    if (fileInput.files.length === 0) {
        alert("Please upload an Excel file.");
        return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(fileInput.files[0]);

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Read first sheet (Statements)
        const sheetNameStatements = workbook.SheetNames[0];
        const sheetStatements = workbook.Sheets[sheetNameStatements];
        const jsonData = XLSX.utils.sheet_to_json(sheetStatements, { header: 1 }).slice(1); // Skip header row

        // Read second sheet (Map)
        const sheetNameMap = workbook.SheetNames[1];
        const sheetMap = workbook.Sheets[sheetNameMap];
        const mapData = XLSX.utils.sheet_to_json(sheetMap, { header: 1 }).slice(1); // Skip header row

        // Store data in sessionStorage
        sessionStorage.setItem("uploadedData", JSON.stringify(jsonData));
        sessionStorage.setItem("pyramidMap", JSON.stringify(mapData));

        alert("File uploaded successfully!");
    };
});
