document.addEventListener("DOMContentLoaded", function () {
    const savedStatements = JSON.parse(sessionStorage.getItem("sortedCategories"));

    if (!savedStatements) {
        alert("No sorted data found. Please go back to Step 2.");
        return;
    }

    const pyramid = document.getElementById("pyramid");
    const saveButton = document.getElementById("save-qsort");

    let draggedStatement = null;

    // Convert saved categories into a flat array of statements
    let statements = [
        ...savedStatements.agree,
        ...savedStatements.neutral,
        ...savedStatements.disagree
    ];

    console.log("Loaded statements for Q-sort:", statements);

    // Shuffle statements randomly
    statements = statements.sort(() => Math.random() - 0.5);

    // Create draggable statements
    statements.forEach((text, index) => {
        const statementItem = document.createElement("div");
        statementItem.classList.add("statement");
        statementItem.draggable = true;
        statementItem.textContent = text;
        statementItem.dataset.id = index;

        statementItem.addEventListener("dragstart", function (event) {
            draggedStatement = event.target;
            setTimeout(() => event.target.classList.add("dragging"), 0);
        });

        statementItem.addEventListener("dragend", function () {
            draggedStatement.classList.remove("dragging");
            draggedStatement = null;
        });

        pyramid.appendChild(statementItem); // Statements start in the pyramid container
    });

    // Enable drop zones
    const dropzones = document.querySelectorAll(".dropzone");

    dropzones.forEach((dropzone) => {
        dropzone.addEventListener("dragover", function (event) {
            event.preventDefault();
            dropzone.classList.add("drag-over");
        });

        dropzone.addEventListener("dragleave", function () {
            dropzone.classList.remove("drag-over");
        });

        dropzone.addEventListener("drop", function (event) {
            event.preventDefault();
            dropzone.classList.remove("drag-over");

            if (draggedStatement) {
                dropzone.appendChild(draggedStatement);
            }
        });
    });

    // Save the Q-sort results
    saveButton.addEventListener("click", function () {
        const sortedPyramid = {};

        dropzones.forEach((dropzone) => {
            const level = dropzone.dataset.level;
            if (!sortedPyramid[level]) sortedPyramid[level] = [];
            const statementsInZone = Array.from(dropzone.children).map(item => item.textContent);
            sortedPyramid[level] = statementsInZone;
        });

        sessionStorage.setItem("qSortResults", JSON.stringify(sortedPyramid));
        alert("Q-Sort saved successfully!");
    });
});
