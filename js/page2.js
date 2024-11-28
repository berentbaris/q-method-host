document.addEventListener("DOMContentLoaded", function () {
    // Load uploaded data from sessionStorage
    const jsonData = JSON.parse(sessionStorage.getItem("uploadedData"));

    if (!jsonData) {
        alert("No data uploaded. Please go back to Step 1.");
        return;
    }

    const statements = jsonData.map((row) => row[0]); // Assuming statements are in the first column
    const statementList = document.getElementById("statements");

    // Populate the statement list
    statements.forEach((statement) => {
        const listItem = document.createElement("li");
        listItem.textContent = statement;
        listItem.setAttribute("draggable", true);

        listItem.addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("text/plain", statement);
        });

        statementList.appendChild(listItem);
    });

    // Add drag-and-drop functionality to categories
    const dropzones = document.querySelectorAll(".dropzone");

    dropzones.forEach((dropzone) => {
        dropzone.addEventListener("dragover", function (event) {
            event.preventDefault(); // Allow dropping
        });

        dropzone.addEventListener("drop", function (event) {
            event.preventDefault();
            const statement = event.dataTransfer.getData("text/plain");

            const droppedItem = document.createElement("li");
            droppedItem.textContent = statement;

            dropzone.appendChild(droppedItem);

            // Remove the statement from the original list
            const items = Array.from(statementList.children);
            const itemToRemove = items.find((item) => item.textContent === statement);
            if (itemToRemove) {
                statementList.removeChild(itemToRemove);
            }
        });
    });

    // Save sorted categories to sessionStorage
    document.getElementById("save-categories").addEventListener("click", function () {
        const sortedCategories = {
            agree: Array.from(document.querySelector("#agree .dropzone").children).map(
                (item) => item.textContent
            ),
            neutral: Array.from(document.querySelector("#neutral .dropzone").children).map(
                (item) => item.textContent
            ),
            disagree: Array.from(document.querySelector("#disagree .dropzone").children).map(
                (item) => item.textContent
            ),
        };

        sessionStorage.setItem("sortedCategories", JSON.stringify(sortedCategories));
        alert("Categories saved successfully!");
    });
});
