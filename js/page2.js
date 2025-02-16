document.addEventListener("DOMContentLoaded", function () {
    const jsonData = JSON.parse(sessionStorage.getItem("uploadedData"));
    if (!jsonData) {
        alert("No data uploaded. Please go back to Step 1.");
        return;
    }

    const statements = jsonData.map((row) => row[0]); // Extract first column
    let currentIndex = 0;

    const statementContainer = document.getElementById("statements");
    const dropzones = document.querySelectorAll(".dropzone");
    const saveButton = document.getElementById("save-categories");
    saveButton.disabled = true; // Disable save button initially

    let categorizedStatements = {
        agree: [],
        neutral: [],
        disagree: [],
    };

    function showNextStatement() {
        statementContainer.innerHTML = ""; // Clear previous statement

        if (currentIndex < statements.length) {
            const statement = statements[currentIndex];
            const listItem = document.createElement("li");
            listItem.textContent = statement;
            listItem.setAttribute("draggable", true);

            listItem.addEventListener("dragstart", function (event) {
                event.dataTransfer.setData("text/plain", statement);
            });

            statementContainer.appendChild(listItem);
        } else {
            // All statements are categorized
            alert("All statements categorized!");
            saveButton.disabled = false; // Enable save button
        }
    }

    // Handle dropping into a category
    dropzones.forEach((dropzone) => {
        dropzone.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        dropzone.addEventListener("drop", function (event) {
            event.preventDefault();
            const statement = event.dataTransfer.getData("text/plain");

            if (statement) {
                const droppedItem = document.createElement("li");
                droppedItem.textContent = statement;

                dropzone.appendChild(droppedItem);

                // Store categorized statement
                categorizedStatements[dropzone.id].push(statement);

                // Move to next statement
                currentIndex++;
                showNextStatement();
            }
        });
    });

    // Save categorized data
    saveButton.addEventListener("click", function () {
        sessionStorage.setItem("sortedCategories", JSON.stringify(categorizedStatements));
        alert("Categories saved successfully!");
    });

    // Show the first statement
    showNextStatement();
});
