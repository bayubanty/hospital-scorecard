document.addEventListener('DOMContentLoaded', function() {
    let hospitalsData = [];
    let filteredHospitals = [];
    let currentMetric = '';
    let activeDropdown = null;

    // Check if we're on a hospital detail page
    const urlParams = new URLSearchParams(window.location.search);
    const hospitalId = urlParams.get('id');
    
    if (hospitalId) {
        // We're on a detail page
        fetch('hospitals.json')
            .then(response => response.json())
            .then(data => {
                hospitalsData = data.georgiaHospitals;
                showHospitalDetailPage(hospitalId);
            })
            .catch(error => {
                console.error('Error loading hospital data:', error);
            });
    } else {
        // We're on the main page
        fetch('hospitals.json')
            .then(response => response.json())
            .then(data => {
                hospitalsData = data.georgiaHospitals;
                initializeMainPage();
            })
            .catch(error => {
                console.error('Error loading hospital data:', error);
            });
    }

    function initializeMainPage() {
        // Initialize with the data
        filteredHospitals = [...hospitalsData];
        displayHospitals(filteredHospitals);

        // Add click event to metrics
        const metrics = document.querySelectorAll('.metrics-list li');
        metrics.forEach(metric => {
            metric.addEventListener('click', function() {
                const metricType = this.getAttribute('data-metric');
                
                // Toggle active class
                metrics.forEach(m => m.classList.remove('active'));
                this.classList.add('active');
                
                // Sort by selected metric
                sortHospitalsByMetric(metricType);
                currentMetric = metricType;
            });
        });
        
        // Add click event to details buttons (using event delegation)
        document.getElementById('hospitalResults').addEventListener('click', function(e) {
            if (e.target.classList.contains('details-button')) {
                const hospitalId = e.target.getAttribute('data-id');
                const hospital = hospitalsData.find(h => h.id == hospitalId);
                const row = e.target.closest('tr');
                const detailsRow = row.nextElementSibling;
                
                // If this dropdown is already open, close it
                if (activeDropdown === detailsRow) {
                    detailsRow.style.display = 'none';
                    activeDropdown = null;
                    e.target.textContent = 'View Details';
                    return;
                }
                
                // Close any open dropdown
                if (activeDropdown) {
                    activeDropdown.style.display = 'none';
                    activeDropdown.previousElementSibling.querySelector('.details-button').textContent = 'View Details';
                }
                
                // If this row doesn't have a details row, create one
                if (!detailsRow || !detailsRow.classList.contains('hospital-details-dropdown')) {
                    const newRow = document.createElement('tr');
                    newRow.classList.add('hospital-details-dropdown');
                    newRow.innerHTML = `<td colspan="3"><div class="details-content"></div></td>`;
                    row.parentNode.insertBefore(newRow, row.nextSibling);
                    showHospitalDetails(hospital, newRow.querySelector('.details-content'));
                    activeDropdown = newRow;
                } else {
                    detailsRow.style.display = 'table-row';
                    activeDropdown = detailsRow;
                }
                
                e.target.textContent = 'Hide Details';
            }
        });
        
        // Sidebar search button
        document.getElementById('sidebarSearchBtn').addEventListener('click', function() {
            filterHospitals();
        });
        
        // Sidebar reset button
        document.getElementById('sidebarResetBtn').addEventListener('click', function() {
            // Clear all sidebar inputs
            document.getElementById('sidebarHospitalType').value = '';
            document.getElementById('sidebarCity').value = '';
            
            // Reset to show all hospitals
            filteredHospitals = [...hospitalsData];
            displayHospitals(filteredHospitals);
            
            // Remove active class from metrics
            metrics.forEach(m => m.classList.remove('active'));
            currentMetric = '';
        });
    }

    function displayHospitals(hospitals) {
        const resultsContainer = document.getElementById('hospitalResults');
        const resultsCount = document.getElementById('resultsCount');
        
        resultsCount.textContent = `Viewing ${hospitals.length} results`;
        
        let html = '';
        hospitals.forEach((hospital) => {
            // Determine grade class for color coding
            const gradeClass = `grade-${hospital.rank}`;
            
            html += `
                <tr>
                    <td><span class="grade-circle ${gradeClass}">${hospital.rank}</span></td>
                    <td>
                        <a href="?id=${hospital.id}" class="hospital-link">${hospital.name}</a><br>
                        ${hospital.address}
                    </td>
                    <td><button class="details-button" data-id="${hospital.id}">View Details</button></td>
                </tr>
            `;
        });
        
        resultsContainer.innerHTML = html;
        
        // Clear any active dropdown when results change
        if (activeDropdown) {
            activeDropdown.style.display = 'none';
            activeDropdown = null;
        }
    }
    
    function filterHospitals() {
        const typeFilter = document.getElementById('sidebarHospitalType').value;
        // Get city filter from sidebar
        const cityFilter = document.getElementById('sidebarCity').value;
        
        filteredHospitals = hospitalsData.filter(hospital => {
            const typeMatch = !typeFilter || 
                (typeFilter === 'rural' && hospital.criticalAccess === 'Yes') ||
                (typeFilter === 'urban' && hospital.criticalAccess === 'No');
            // Add city filter
            const cityMatch = !cityFilter || hospital.address.includes(cityFilter);
            
            return typeMatch && cityMatch;
        });
        
        // Reapply metric sorting if one is selected
        if (currentMetric) {
            sortHospitalsByMetric(currentMetric);
        } else {
            displayHospitals(filteredHospitals);
        }
    }
    
    function sortHospitalsByMetric(metric) {
        filteredHospitals.sort((a, b) => {
            return b.metrics[metric] - a.metrics[metric];
        });
        
        displayHospitals(filteredHospitals);
    }
    
    function showHospitalDetails(hospital, container) {
        // Determine grade class for color coding
        const gradeClass = `grade-${hospital.rank}`;
        
        // Set hospital details
        container.innerHTML = `
            <div class="details-grid">
                <div class="details-section">
                    <h4>Hospital Information</h4>
                    <p><strong>Grade:</strong> <span class="grade-circle ${gradeClass}">${hospital.rank}</span></p>
                    <p><strong>Beds:</strong> ${hospital.beds}</p>
                    <p><strong>Critical Access:</strong> ${hospital.criticalAccess</p>
                    <p><strong>County:</strong> ${hospital.county}</p>
                    <p><strong>Type:</strong> ${hospital.type}</p>
                    <p><strong>System:</strong> ${hospital.system || 'N/A'}</p>
                </div>
                
                <div class="details-section">
                    <h4>Performance Metrics</h4>
                    <div class="metric-bars">
                        ${Object.entries(hospital.metrics).map(([metric, value]) => {
                            const percentage = (value / 5) * 100;
                            return `
                                <div class="metric-bar">
                                    <div class="metric-name">
                                        <span>${formatMetricName(metric)}</span>
                                        <span class="metric-value">${value.toFixed(1)}/5.0</span>
                                    </div>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 15px;">
                <a href="?id=${hospital.id}" class="details-button">View Full Details Page</a>
            </div>
        `;
    }
    
    function showHospitalDetailPage(hospitalId) {
        // Hide the main content and show detail content
        document.querySelector('.main-content').style.display = 'none';
        document.querySelector('.metrics-section').style.display = 'none';
        
        const hospital = hospitalsData.find(h => h.id == hospitalId);
        
        if (!hospital) {
            // Hospital not found, redirect to main page
            window.location.href = window.location.pathname;
            return;
        }
        
        // Create detail page content
        const detailContainer = document.createElement('div');
        detailContainer.className = 'hospital-detail-container';
        
        // Determine grade class for color coding
        const gradeClass = `grade-${hospital.rank}`;
        
        detailContainer.innerHTML = `
            <div class="hospital-header">
                <div>
                    <h2>${hospital.name}</h2>
                    <p>${hospital.address}</p>
                </div>
                <a href="${window.location.pathname}" class="back-button">Back to Results</a>
            </div>
            
            <div class="detail-page-grid">
                <div class="detail-page-section">
                    <h3>Hospital Information</h3>
                    <p><strong>Grade:</strong> <span class="grade-circle ${gradeClass}">${hospital.rank}</span></p>
                    <p><strong>Beds:</strong> ${hospital.beds}</p>
                    <p><strong>Critical Access:</strong> ${hospital.criticalAccess}</p>
                    <p><strong>County:</strong> ${hospital.county}</p>
                    <p><strong>Type:</strong> ${hospital.type}</p>
                    <p><strong>System:</strong> ${hospital.system || 'N/A'}</p>
                </div>
                
                <div class="detail-page-section">
                    <h3>Performance Metrics</h3>
                    <div class="metric-bars">
                        ${Object.entries(hospital.metrics).map(([metric, value]) => {
                            const percentage = (value / 5) * 100;
                            return `
                                <div class="metric-bar">
                                    <div class="metric-name">
                                        <span>${formatMetricName(metric)}</span>
                                        <span class="metric-value">${value.toFixed(1)}/5.0</span>
                                    </div>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <h3>Location Map</h3>
            <div id="map" class="map-container"></div>
        `;
        
        // Insert the detail container at the top of the content area
        const contentArea = document.querySelector('.content-area');
        contentArea.parentNode.insertBefore(detailContainer, contentArea);
        
        // Initialize the map
        initMap(hospital.lat, hospital.lng, hospital.name);
    }
    
    function initMap(lat, lng, name) {
        // Create a map centered at the hospital location
        const map = L.map('map').setView([lat, lng], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add a marker for the hospital
        L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`<b>${name}</b>`)
            .openPopup();
    }
    
    function formatMetricName(metric) {
        const names = {
            'birth': 'Birth Services Quality',
            'mars': 'Medical Assistance Response',
            'witchers': 'Wait Times & Patient Flow',
            'financialTransparency': 'Financial Transparency',
            'healthcareAffordability': 'Healthcare Affordability',
            'accessAndResponsibility': 'Access & Social Responsibility'
        };
        
        return names[metric] || metric;
    }
});
