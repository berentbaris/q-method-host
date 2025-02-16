document.addEventListener("DOMContentLoaded", function () {
    const pyramidData = JSON.parse(sessionStorage.getItem("pyramidMap"));
    const categorizedStatements = JSON.parse(sessionStorage.getItem("sortedCategories"));
    
    if (!pyramidData || !categorizedStatements) {
        alert("Missing data. Please go back and complete Steps 1 and 2.");
        return;
    }

    const pyramidContainer = document.getElementById("pyramid");

    // Create the pyramid structure
    pyramidData.forEach(row => {
        const colID = row["ID"];
        const numStatements = row["Number of Statements"];
        const colColor = row["Color"];

        const column = document.createElement("div");
        column.classList.add("pyramid-column");
        column.style.backgroundColor = colColor;
        column.dataset.limit = numStatements;
        column.dataset.id = colID;

        for (let i = 0; i < numStatements; i++) {
            const dropZone = document.createElement("div");
            dropZone.classList.add("dropzone");
            column.appendChild(dropZone);
        }

        pyramidContainer.appendChild(column);
    });

    // Enable drag-and-drop for statements
    const categories = document.querySelectorAll(".category");
    categories.forEach(category => {
        category.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", event.target.textContent);
        });
    });

    // Enable drop functionality for pyramid slots
    const dropZones = document.querySelectorAll(".dropzone");
    dropZones.forEach(zone => {
        zone.addEventListener("dragover", (event) => {
            event.preventDefault();
        });

        zone.addEventListener("drop", (event) => {
            event.preventDefault();
            const statement = event.dataTransfer.getData("text/plain");

            if (!statement) return;

            if (zone.childNodes.length === 0) { // Limit each slot to one statement
                const droppedItem = document.createElement("div");
                droppedItem.textContent = statement;
                droppedItem.classList.add("statement");
                zone.appendChild(droppedItem);
            }
        });
    });

    // Save Q-Sort Data
    document.getElementById("save-qsort").addEventListener("click", function () {
        const sortedStatements = {};
        pyramidContainer.querySelectorAll(".pyramid-column").forEach(column => {
            const columnID = column.dataset.id;
            const statements = Array.from(column.querySelectorAll(".statement")).map(s => s.textContent);
            sortedStatements[columnID] = statements;
        });

        sessionStorage.setItem("qsortData", JSON.stringify(sortedStatements));
        alert("Q-Sort Pyramid saved!");
    });
});
