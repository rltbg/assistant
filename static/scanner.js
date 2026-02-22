let barcode = ""

function docReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
} 

docReady(function() {
    var resultContainer = document.getElementById('qr-reader-results');
    var lastResult, countResults = 0;

    var html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader", { fps: 10, qrbox: 250 });

    function onScanSuccess(decodedText, decodedResult) {
        console.log("WORKS!")
        if (decodedText !== lastResult) {
            lastResult = decodedText;
            
            console.log(`Scan result = ${decodedText}`);
            resultContainer.innerHTML = `<div>Found: ${decodedText}</div>`;

            // Stop scanning after a successful read to prevent spamming the API
            html5QrcodeScanner.clear();

            lookupProductMetadata(decodedText); 
        }
    }

    function onScanError(qrCodeError) {
        // Ignored to avoid verbose console spam
    }

    html5QrcodeScanner.render(onScanSuccess, onScanError);
});

function lookupProductMetadata(barcode) {
    console.log("Fetching data for:", barcode);
    
    const backendUrl = 'http://127.0.0.1:8000/lookup'; 

    fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: barcode })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Data from Python:", data);
        
        const messageEl = document.getElementById('message');
        
        if (data.product_name) {
            // Determine how to display the CO2 footprint
            let co2Display = data.calculated_co2_per_kg !== null 
                ? `<span style="color: green;">${data.calculated_co2_per_kg} kg CO₂e / kg</span>`
                : `<span style="color: red;">Data Unavailable</span>`;

            messageEl.innerHTML = `
                <div style="font-family: sans-serif; border: 1px solid #ccc; padding: 15px; margin-top: 15px; border-radius: 8px;">
                    <h3 style="margin-top: 0;">${data.product_name}</h3>
                    <p><strong>Brand:</strong> ${data.brands || 'Unknown'}</p>
                    <p><strong>Eco-Score:</strong> ${data.ecoscore_grade?.toUpperCase() || 'N/A'}</p>
                    <hr>
                    <p><strong>Carbon Footprint:</strong> ${co2Display}</p>
                    <p style="font-size: 0.8em; color: #666;">
                        *Based on Life Cycle Analysis (Agriculture, Packaging, Transport).
                    </p>
                </div>
            `;
        } else {
            messageEl.textContent = "Product not found in database.";
        }
    })
    .catch(err => {
        console.error("Error connecting to Python:", err);
        document.getElementById('message').textContent = "Server error. Check console.";
    });
}

function lookupProductMetadata(barcode) {
    console.log("Fetching data for:", barcode);
    
    const backendUrl = 'http://127.0.0.1:8000/lookup'; 

    fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: barcode })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Data from Python:", data);
        
        const messageEl = document.getElementById('message');
        
        if (data.product_name) {
            // Safely extract the agribalyse data, defaulting to an empty object if missing
            const agribalyse = data.ecoscore_data?.agribalyse || {};
            
            // Helper function to format the CO2 values safely
            const formatCO2 = (val) => val != null ? `${val.toFixed(4)} kg` : '0.0000 kg';

            // Determine how to display the total CO2 footprint
            let co2Display = data.calculated_co2_per_kg != null 
                ? `<span style="color: green; font-weight: bold;">${data.calculated_co2_per_kg.toFixed(3)} kg CO₂e / kg</span>`
                : `<span style="color: red;">Data Unavailable</span>`;

            // Build the HTML, including the breakdown list
            messageEl.innerHTML = `
                <div style="font-family: sans-serif; border: 1px solid #ccc; padding: 15px; margin-top: 15px; border-radius: 8px; max-width: 400px;">
                    <h3 style="margin-top: 0; margin-bottom: 5px;">${data.product_name}</h3>
                    <p style="margin: 0 0 10px 0;"><strong>Brand:</strong> ${data.brands || 'Unknown'}</p>
                    
                    <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                        <p style="margin: 0 0 5px 0;"><strong>Eco-Score:</strong> ${data.ecoscore_grade?.toUpperCase() || 'N/A'}</p>
                        <p style="margin: 0;"><strong>Total Carbon Footprint:</strong> ${co2Display}</p>
                    </div>
                    
                    <h4 style="margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Emissions Breakdown (per kg)</h4>
                    <ul style="list-style-type: none; padding: 0; margin: 0; font-size: 0.9em; line-height: 1.6;">
                        <li>🌱 <strong>Agriculture:</strong> ${formatCO2(agribalyse.co2_agriculture)}</li>
                        <li>🏭 <strong>Processing:</strong> ${formatCO2(agribalyse.co2_processing)}</li>
                        <li>📦 <strong>Packaging:</strong> ${formatCO2(agribalyse.co2_packaging)}</li>
                        <li>🚚 <strong>Transport:</strong> ${formatCO2(agribalyse.co2_transport)}</li>
                        <li>🏪 <strong>Distribution:</strong> ${formatCO2(agribalyse.co2_distribution)}</li>
                        <li>🍽️ <strong>Consumption:</strong> ${formatCO2(agribalyse.co2_consumption)}</li>
                    </ul>
                    
                    <p style="font-size: 0.8em; color: #666; margin-top: 15px;">
                        *Values represent kg of CO₂ equivalent per 1 kg of product.
                    </p>
                </div>
            `;
        } else {
            messageEl.innerHTML = `<div style="color: red; padding: 10px; border: 1px solid red; border-radius: 5px;">Product not found in database.</div>`;
        }
    })
    .catch(err => {
        console.error("Error connecting to Python:", err);
        document.getElementById('message').innerHTML = `<div style="color: red;">Server error. Ensure your Python backend is running.</div>`;
    });
}