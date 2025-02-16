document.addEventListener("DOMContentLoaded", function () {
    const jsonData = JSON.parse(sessionStorage.getItem("uploadedData"));
    if (!jsonData) {
        alert("No data uploaded. Please go back to Step 1.");
        return;
    }

    console.log("Loaded Statements:", jsonData); // Debugging

    const statements = jsonData.map(statement => statement.text); // Extract only text
    let currentIndex = 0;

    console.log("Loaded statements:", statements); // Debugging

    const statementContainer = document.getElementById("statement-container"); // Ensure this exists in HTML
    const dropzones = document.querySelectorAll(".dropzone");
    const saveButton = document.getElementById("save-categories");
    saveButton.disabled = true; // Disable save button initially

    let categorizedStatements = {
        agree: [],
        neutral: [],
        disagree: [],
    };

    function showNextStatement() {
        if (currentIndex < statements.length) {
            statementContainer.innerText = statements[currentIndex]; 
            currentIndex++;
        } else {
            statementContainer.innerText = "All statements sorted!";
        }
    }

    dropzones.forEach(dropzone => {
        dropzone.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        dropzone.addEventListener("drop", function (event) {
            event.preventDefault();
            let category = dropzone.getAttribute("data-category");
            if (currentIndex > 0) {
                categorizedStatements[category].push(statements[currentIndex - 1]); // Add previous statement to category
            }
            showNextStatement();
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
