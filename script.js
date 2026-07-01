document.addEventListener("DOMContentLoaded", () => {
  const rsvpForm = document.getElementById("rsvpForm");
  const ticketTypeSelect = document.getElementById("ticketType");
  const priceDisplay = document.getElementById("priceDisplay");
  const hasGuestCheckbox = document.getElementById("hasGuest");
  const guestSection = document.getElementById("guestSection");
  const guestNameInput = document.getElementById("guestName");
  const formFeedback = document.getElementById("formFeedback");
  const submitBtn = document.getElementById("submitBtn");

  // Define ticket prices (adjust values as needed)
  const ticketPrices = {
    student: 500,
    standard: 1500,
    vip: 3500,
  };

  // 1. Handle Ticket Price Changes
  ticketTypeSelect.addEventListener("change", () => {
    const selectedTier = ticketTypeSelect.value;
    const price = ticketPrices[selectedTier] || 0;
    
    // Format price with commas if necessary
    priceDisplay.textContent = `Ticket Price: Php ${price.toLocaleString()}`;
  });

  // 2. Handle Dynamic Guest Field Toggle
  hasGuestCheckbox.addEventListener("change", () => {
    if (hasGuestCheckbox.checked) {
      guestSection.style.display = "block";
      guestNameInput.setAttribute("required", "required");
    } else {
      guestSection.style.display = "none";
      guestNameInput.removeAttribute("required");
      guestNameInput.value = ""; // Clear input if unchecked
    }
  });

  // 3. Form Submission Handling
  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent native form reload

    // Update UI state to loading
    submitBtn.disabled = true;
    formFeedback.textContent = "Submitting your registration...";
    formFeedback.style.color = "#555";

    // Gather dietary preferences into an array, then turn into a string
    const checkedDiets = Array.from(document.querySelectorAll('input[name="diet"]:checked'))
      .map(checkbox => checkbox.value);
    const dietaryNeedsString = checkedDiets.length > 0 ? checkedDiets.join(", ") : "None";

    // Build payload to match your Google Apps Script keys exactly
    const payload = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      ticketType: ticketTypeSelect.value,
      hasGuest: hasGuestCheckbox.checked ? "Yes" : "No",
      guestName: hasGuestCheckbox.checked ? guestNameInput.value : "N/A",
      dietaryNeeds: dietaryNeedsString
    };

    try {
      const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyW8-x9d6-6SXwmbthMphHTB20WgXHfTMQm8ouwIyYh1Y-L5pp-KdTMKv9PCzDnMptg/exec";

      const response = await fetch(GOOGLE_WEB_APP_URL, {
        method: "POST",
        mode: "cors", 
        headers: {
          "Content-Type": "text/plain", // Crucial for bypassing certain CORS preflight restrictions with Apps Script
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === "success") {
        formFeedback.textContent = "Registration successful! See you at Tech Summit 2026.";
        formFeedback.style.color = "green";
        rsvpForm.reset();
        
        // Reset dynamic elements back to default states
        priceDisplay.textContent = "Ticket Price: Php 0";
        guestSection.style.display = "none";
        guestNameInput.removeAttribute("required");
      } else {
        throw new Error(result.message || "Unknown error occurred on server.");
      }

    } catch (error) {
      console.error("Submission Error:", error);
      formFeedback.textContent = "Oops! Something went wrong. Please try again.";
      formFeedback.style.color = "red";
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
    }
  });
});