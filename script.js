// Load hospitals on index.html
async function loadHospitals() {
  const response = await fetch("hospitals.json");
  const hospitals = await response.json();
  const container = document.getElementById("hospital-list");

  if (!container) return; // Prevent running on details.html

  hospitals.forEach(hospital => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${hospital.name}</h2>
      <p><strong>Location:</strong> ${hospital.city}, ${hospital.state}</p>
      <p><strong>Rating:</strong> ${hospital.rating}</p>
      <button onclick="viewDetails(${hospital.id})">Details</button>
    `;
    container.appendChild(card);
  });
}

// Load single hospital on details.html
async function loadHospitalDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  const response = await fetch("hospitals.json");
  const hospitals = await response.json();
  const hospital = hospitals.find(h => h.id == id);

  const container = document.getElementById("hospital-details");
  if (hospital) {
    container.innerHTML = `
      <h2>${hospital.name}</h2>
      <p><strong>Location:</strong> ${hospital.city}, ${hospital.state}</p>
      <p><strong>Rating:</strong> ${hospital.rating}</p>
      <p><strong>Specialties:</strong> ${hospital.specialties.join(", ")}</p>
    `;
  }
}

function viewDetails(id) {
  window.location.href = `details.html?id=${id}`;
}

// Run appropriate function
if (document.getElementById("hospital-list")) {
  loadHospitals();
}
if (document.getElementById("hospital-details")) {
  loadHospitalDetails();
}
