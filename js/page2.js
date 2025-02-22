document.addEventListener("DOMContentLoaded", function () {
    const jsonData = JSON.parse(sessionStorage.getItem("uploadedData"));
    if (!jsonData || jsonData.length === 0) {
        alert("No data uploaded. Please go back to Step 1.");
        return;
    }

    console.log("Loaded Statements:", jsonData); // Debugging

    const statementContainer = document.getElementById("statements");
    const dropzones = document.querySelectorAll(".dropzone");
    const saveButton = document.getElementById("save-categories");
    saveButton.disabled = true; // Disable save button initially

    let categorizedStatements = {
        agree: [],
        neutral: [],
        disagree: [],
    };

    let currentIndex = 0;

    function showNextStatement() {
        statementContainer.innerHTML = ""; // Clear previous statement

        if (currentIndex < jsonData.length) {
            const statement = jsonData[currentIndex]; // Get the next statement
            const statementDiv = document.createElement("div");
            statementDiv.classList.add("statement");
            statementDiv.textContent = statement.text; // Ensure it's just the text
            statementDiv.draggable = true;
            statementDiv.dataset.id = statement.id;

            statementDiv.addEventListener("dragstart", (event) => {
                event.dataTransfer.setData("text/plain", statement.id);
            });

            statementContainer.appendChild(statementDiv);
        } else {
            statementContainer.innerText = "All statements sorted!";
            saveButton.disabled = false; // Enable save button when sorting is done
        }
    }

    // 🛠 Enable drag-and-drop for each drop zone
    dropzones.forEach(dropzone => {
        dropzone.addEventListener("dragover", (event) => {
            event.preventDefault();
        });

        dropzone.addEventListener("drop", (event) => {
            event.preventDefault();
            const statementId = event.dataTransfer.getData("text/plain");
            const draggedElement = document.querySelector(`[data-id='${statementId}']`);

            if (draggedElement) {
                dropzone.appendChild(draggedElement); // Move element to new category
                const category = dropzone.getAttribute("data-category");
                categorizedStatements[category].push(draggedElement.textContent);
                currentIndex++; // Move to next statement
                setTimeout(showNextStatement, 300); // Show next statement after a short delay
            }

            // Enable save button when sorting is completed
            if (currentIndex === jsonData.length) {
                saveButton.disabled = false;
            }
        });
    });

    // Save categorized data
    saveButton.addEventListener("click", function () {
        sessionStorage.setItem("sortedCategories", JSON.stringify(categorizedStatements));
        alert("Categories saved successfully!");
    });

    showNextStatement(); // Start with the first statement
});
