document.addEventListener("DOMContentLoaded", function () {
    const jsonData = JSON.parse(sessionStorage.getItem("uploadedData"));
    if (!jsonData) {
        alert("No data uploaded. Please go back to Step 1.");
        return;
    }

    const statements = jsonData; // jsonData already contains statement texts
    let currentIndex = 0;

    console.log("Loaded statements:", statements); // Check if statements load correctly

    const statementContainer = document.getElementById("statements");
    const dropzones = document.querySelectorAll(".dropzone");
    const saveButton = document.getElementById("save-categories");
    saveButton.disabled = true; // Disable save button initially

    let categorizedStatements = {
        agree: [],
        neutral: [],
        disagree: [],
    };

    document.addEventListener("DOMContentLoaded", function () {
        const jsonData = JSON.parse(sessionStorage.getItem("uploadedData"));
        if (!jsonData) {
            alert("No data uploaded. Please go back to Step 1.");
            return;
        }
    
        const statements = jsonData.map(statement => Array.isArray(statement) ? statement[1] : statement); // Ensure only statement text
        let currentIndex = 0;
    
        function showNextStatement() {
            if (currentIndex < statements.length) {
                document.getElementById("statementBox").innerText = statements[currentIndex];
                console.log("Next statement index:", currentIndex, "Statement:", statements[currentIndex]); // Debugging log
                currentIndex++; // Move to the next statement
            } else {
                document.getElementById("statementBox").innerText = "All statements sorted!";
            }
        }
    
        function handleDrop(event) {
            event.preventDefault();
            showNextStatement(); // Show the next statement after dropping
        }
    
        showNextStatement(); // Start with the first statement
    });
    

    // Save categorized data
    saveButton.addEventListener("click", function () {
        sessionStorage.setItem("sortedCategories", JSON.stringify(categorizedStatements));
        alert("Categories saved successfully!");
    });

    // Show the first statement
    showNextStatement();
});
